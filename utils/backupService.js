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
  createBackup: async (req, res) => {
    try {
      const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
      const backupFolderPath = path.join(
        backupsFolderPath,
        `backup-${timestamp}`
      );
      const dbBackupPath = path.join(backupFolderPath, "db-backup"); // MongoDB JSON backup folder
      const public7zPath = path.join(backupFolderPath, "public.7z"); // Public folder 7z file

      res.write("Starting backup process...\n");

      // Step 1: Create the backup folder
      fs.mkdirSync(backupFolderPath, { recursive: true });
      fs.mkdirSync(dbBackupPath, { recursive: true });

      // Step 2: Export MongoDB data dynamically
      res.write("Fetching collections...\n");
      const collections = await getCollections();
      res.write(`Found collections: ${collections.join(", ")}\n`);

      for (const collection of collections) {
        const jsonFilePath = path.join(dbBackupPath, `${collection}.json`);
        res.write(`Exporting collection '${collection}'...\n`);
        await execAsync(
          `mongoexport --uri="${mongoUri}" --db=${dbName} --collection=${collection} --out=${jsonFilePath} --jsonArray`
        );
        res.write(`Exported collection '${collection}' to ${jsonFilePath}\n`);
      }

      res.write("MongoDB data exported as JSON.\n");

      // Step 3: 7z the public folder

      if (fs.existsSync(publicFolderPath)) {
        res.write("Compressing public folder...\n");
        await sevenZipFolder(publicFolderPath, public7zPath);
        res.write("Public folder compressed.\n");
      } else {
        res.write("Public folder not found.\n");
      }
      res.write(`Backup created successfully at ${backupFolderPath}\n`);
      return {
        success: true,
        message: `Backup created successfully at ${backupFolderPath}`,
        backupRoot: backupFolderPath,
      };
    } catch (error) {
      res.write(`Error during backup: ${error.message}\n`);
      res.end();
      return { success: false, message: "Failed to create backup", error };
    }
  },

  // Restore from a backup
  restoreBackup: async (backupFolderPath, replace, req, res) => {
    try {
      if (!fs.existsSync(backupFolderPath)) {
        throw new Error("Backup folder does not exist.");
      }

      res.write("Starting restoration process...\n");

      const dbBackupPath = path.join(backupFolderPath, "db-backup");
      const public7zPath = path.join(backupFolderPath, "public.7z");

      // Step 1: Restore MongoDB
      res.write("Restoring MongoDB...\n");
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
          res.write(`Skipping empty file: ${jsonFilePath}\n`);
          continue; // Skip empty files
        }
        replace
          ? await execAsync(
              `mongoimport --uri="${mongoUri}" --db=${dbName} --collection=${collectionName} --file=${jsonFilePath} --jsonArray --drop`
            )
          : await execAsync(
              `mongoimport --uri="${mongoUri}" --db=${dbName} --collection=${collectionName} --file=${jsonFilePath} --jsonArray --mode=upsert`
            );
        res.write(
          `Restored collection '${collectionName}' from ${jsonFilePath}\n`
        );
      }
      res.write("MongoDB restored.\n");

      // Step 2: Un7z and replace the public folder
      res.write("Replacing public folder...\n");
      if (fs.existsSync(public7zPath)) {
        await sevenUnzipFolder(public7zPath, unzipFolderPath);
        res.write("Public folder restored.\n");
      } else {
        res.write("Public folder 7z not found in backup.\n");
      }

      res.write("Restoration completed successfully.\n");
      res.end();
      return { success: true, message: "Restoration completed successfully." };
    } catch (error) {
      res.write(`Error during restoration: ${error.message}\n`);
      res.end();
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
