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

      if (res) res.write("Starting backup process...\n");
      else console.log("Starting backup process...");

      // Step 1: Create the backup folder
      fs.mkdirSync(backupFolderPath, { recursive: true });
      fs.mkdirSync(dbBackupPath, { recursive: true });

      // Step 2: Export MongoDB data dynamically
      if (res) res.write("Fetching collections...\n");
      else console.log("Fetching collections...");
      const collections = await getCollections();
      if (res) res.write(`Found collections: ${collections.join(", ")}\n`);
      else console.log(`Found collections: ${collections.join(", ")}`);

      for (const collection of collections) {
        const jsonFilePath = path.join(dbBackupPath, `${collection}.json`);
        if (res) res.write(`Exporting collection '${collection}'...\n`);
        else console.log(`Exporting collection '${collection}'...`);
        await execAsync(
          `mongoexport --uri="${mongoUri}" --db=${dbName} --collection=${collection} --out="${jsonFilePath}" --jsonArray`
        );
        if (res)
          res.write(`Exported collection '${collection}' to ${jsonFilePath}\n`);
        else
          console.log(`Exported collection '${collection}' to ${jsonFilePath}`);
      }

      if (res) res.write("MongoDB data exported as JSON.\n");
      else console.log("MongoDB data exported as JSON.");

      // Step 3: 7z the public folder

      if (fs.existsSync(publicFolderPath)) {
        if (res) res.write("Compressing public folder...\n");
        else console.log("Compressing public folder...");
        await sevenZipFolder(publicFolderPath, public7zPath);
        if (res) res.write("Public folder compressed.\n");
        else console.log("Public folder compressed.");
      } else {
        if (res) res.write("Public folder not found.\n");
        else console.log("Public folder not found.");
      }
      if (res) {
        res.write(`Backup created successfully at ${backupFolderPath}\n`);
      } else {
        console.log(`Backup created successfully at ${backupFolderPath}`);
      }
      return {
        success: true,
        message: `Backup created successfully at ${backupFolderPath}`,
        backupRoot: backupFolderPath,
      };
    } catch (error) {
      if (res) {
        res.write(`Error during backup: ${error.message}\n`);
      } else {
        console.error(`Error during backup: ${error.message}`);
      }
      return { success: false, message: "Failed to create backup", error };
    }
  },

  // Restore from a backup
  restoreBackup: async (backupFolderPath) => {
    try {
      if (!fs.existsSync(backupFolderPath)) {
        throw new Error("Backup folder does not exist.");
      }

      if (res) res.write("Starting restoration process...\n");
      else console.log("Starting restoration process...");

      const dbBackupPath = path.join(backupFolderPath, "db-backup");
      const public7zPath = path.join(backupFolderPath, "public.7z");

      // Step 1: Restore MongoDB
      if (res) res.write("Restoring MongoDB...\n");
      else console.log("Restoring MongoDB...");
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
          if (res) res.write(`Skipping empty file: ${jsonFilePath}\n`);
          else console.log(`Skipping empty file: ${jsonFilePath}`);
          continue; // Skip empty files
        }
        replace
          ? await execAsync(
              `mongoimport --uri="${mongoUri}" --db=${dbName} --collection=${collectionName} --file="${jsonFilePath}" --jsonArray --drop`
            )
          : await execAsync(
              `mongoimport --uri="${mongoUri}" --db=${dbName} --collection=${collectionName} --file="${jsonFilePath}" --jsonArray --mode=upsert`
            );
        if (res)
          res.write(
            `Restored collection '${collectionName}' from ${jsonFilePath}\n`
          );
        else
          console.log(
            `Restored collection '${collectionName}' from ${jsonFilePath}`
          );
      }
      if (res) res.write("MongoDB restored.\n");
      else console.log("MongoDB restored.");

      // Step 2: Un7z and replace the public folder
      if (res) res.write("Replacing public folder...\n");
      else console.log("Replacing public folder...");
      if (fs.existsSync(public7zPath)) {
        await sevenUnzipFolder(public7zPath, unzipFolderPath);
        if (res) res.write("Public folder restored.\n");
        else console.log("Public folder restored.");
      } else {
        if (res) res.write("Public folder 7z not found in backup.\n");
        else console.log("Public folder 7z not found in backup.");
      }

      if (res) {
        res.write("Restoration completed successfully.\n");
      } else {
        console.log("Restoration completed successfully.");
      }
      return { success: true, message: "Restoration completed successfully." };
    } catch (error) {
      if (res) {
        res.write(`Error during restoration: ${error.message}\n`);
      } else {
        console.error(`Error during restoration: ${error.message}`);
      }
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