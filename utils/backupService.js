const fs = require("fs");
const path = require("path");
const { exec } = require("child_process");
const util = require("util");
const { MongoClient } = require("mongodb");
const Seven = require("node-7z"); // Use 'node-7z' package for 7z compression

// Promisify exec for async/await
const execAsync = util.promisify(exec);

// MongoDB connection string
const mongoUri = process.env.DB.replace(
  "<db_password>",
  process.env.DB_PASSWORD
);
// Replace with your MongoDB URI
const dbName = "test"; // Replace with your database name

// Paths
const publicFolderPath = path.join(__dirname, "../public");
const unzipFolderPath = path.join(__dirname, "../public");
const backupsFolderPath = path.join(__dirname, "../backups");

// Ensure backups folder exists
if (!fs.existsSync(backupsFolderPath)) {
  fs.mkdirSync(backupsFolderPath);
}

const BackupService = {
  // Create a backup
  createBackup: async () => {
    try {
      const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
      const backupFolderPath = path.join(
        backupsFolderPath,
        `backup-${timestamp}`
      );
      const dbBackupPath = path.join(backupFolderPath, "db-backup"); // MongoDB JSON backup folder
      const public7zPath = path.join(backupFolderPath, "public.7z"); // Public folder 7z file

      console.log("Starting backup process...");

      // Step 1: Create the backup folder
      fs.mkdirSync(backupFolderPath, { recursive: true });
      fs.mkdirSync(dbBackupPath, { recursive: true });

      // Step 2: Export MongoDB data dynamically
      console.log("Fetching collections...");
      const collections = await getCollections();
      console.log(`Found collections: ${collections.join(", ")}`);

      for (const collection of collections) {
        const jsonFilePath = path.join(dbBackupPath, `${collection}.json`);
        console.log(`Exporting collection '${collection}'...`);
        await execAsync(
          `mongoexport --uri="${mongoUri}" --db=${dbName} --collection=${collection} --out=${jsonFilePath} --jsonArray`
        );
        console.log(`Exported collection '${collection}' to ${jsonFilePath}`);
      }

      console.log("MongoDB data exported as JSON.");

      // Step 3: 7z the public folder

      if (fs.existsSync(publicFolderPath)) {
        console.log("Compressed public folder...");
        await sevenZipFolder(publicFolderPath, public7zPath);
        console.log("Public folder compressed.");
      } else {
        console.warn("Public folder not found.");
      }
      return {
        success: true,
        message: `Backup created successfully at ${backupFolderPath}`,
        backupRoot: backupFolderPath,
      };
    } catch (error) {
      console.error("Error during backup:", error);
      return { success: false, message: "Failed to create backup", error };
    }
  },

  // Restore from a backup
  restoreBackup: async (backupFolderPath) => {
    try {
      if (!fs.existsSync(backupFolderPath)) {
        throw new Error("Backup folder does not exist.");
      }

      console.log("Starting restoration process...");

      const dbBackupPath = path.join(backupFolderPath, "db-backup");
      const public7zPath = path.join(backupFolderPath, "public.7z");

      // Step 1: Restore MongoDB
      console.log("Restoring MongoDB...");
      const collections = fs
        .readdirSync(dbBackupPath)
        .filter((file) => file.endsWith(".json"));

      for (const file of collections) {
        const collectionName = path.basename(file, ".json");
        const jsonFilePath = path.join(dbBackupPath, file);
        // Check if the file is empty
        const fileContent = fs.readFileSync(jsonFilePath, "utf-8").trim();
        const jsonContent = JSON.parse(fileContent); // Ensure valid JSON
        if (jsonContent.length === 0) {
          console.log(`Skipping empty file: ${jsonFilePath}`);
          continue; // Skip empty files
        }
        await execAsync(
          `mongoimport --uri="${mongoUri}" --db=${dbName} --collection=${collectionName} --file=${jsonFilePath} --jsonArray --drop`
          // `mongoimport --uri="${mongoUri}" --db=${dbName} --collection=${collectionName} --file=${jsonFilePath} --jsonArray --mode=upsert`
        );
        console.log(
          `Restored collection '${collectionName}' from ${jsonFilePath}`
        );
      }
      console.log("MongoDB restored.");

      // Step 2: Un7z and replace the public folder
      console.log("Replacing public folder...");
      if (fs.existsSync(public7zPath)) {
        await sevenUnzipFolder(public7zPath, unzipFolderPath);
        console.log("Public folder restored.");
      } else {
        console.warn("Public folder 7z not found in backup.");
      }

      return { success: true, message: "Restoration completed successfully." };
    } catch (error) {
      console.error("Error during restoration:", error);
      return { success: false, message: "Failed to restore backup", error };
    }
  },
};

// Helper function to get all collection names from the database
const getCollections = async () => {
  const client = new MongoClient(mongoUri);
  try {
    await client.connect();
    const db = client.db(dbName);
    const collections = await db.listCollections().toArray();
    // Filter out the backup collections
    return collections
      .map((collection) => collection.name)
      .filter((name) => !name.includes("backup"));
  } finally {
    await client.close();
  }
};

// Helper function to 7z a folder
const sevenZipFolder = (sourceFolder, sevenZipFilePath) => {
  return new Promise((resolve, reject) => {
    const archive = Seven.add(sevenZipFilePath, path.join(sourceFolder, "*"), {
      baseFolder: sourceFolder,
    });
    archive.on("end", resolve);
    archive.on("error", reject);
  });
};
// Helper function to un7z a folder
const sevenUnzipFolder = (sevenZipFilePath, destinationFolder) => {
  return new Promise((resolve, reject) => {
    const archive = Seven.extractFull(sevenZipFilePath, destinationFolder, {
      $cherryPick: "*",
    });
    archive.on("end", resolve);
    archive.on("error", reject);
  });
};

module.exports = BackupService;
