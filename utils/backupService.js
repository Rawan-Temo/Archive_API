const fs = require("fs");
const path = require("path");
const archiver = require("archiver");
const { exec } = require("child_process");
const util = require("util");
const { MongoClient } = require("mongodb");
const unzipper = require("unzipper"); // This requires the 'unzipper' package

// Promisify exec for async/await
const execAsync = util.promisify(exec);

// MongoDB connection string
const mongoUri = "mongodb://localhost:27017"; // Replace with your MongoDB URI
const dbName = "test"; // Replace with your database name

// Paths
const publicFolderPath = path.join(__dirname, "../public");
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
      const publicZipPath = path.join(backupFolderPath, "public.zip"); // Public folder zip file

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

      // Step 3: Zip the public folder
      console.log("Zipping public folder...");
      await zipFolder(publicFolderPath, publicZipPath);
      console.log("Public folder zipped.");

      return {
        success: true,
        message: `Backup created successfully at ${backupFolderPath}`,
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
      const publicZipPath = path.join(backupFolderPath, "public.zip");

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
        );
        console.log(
          `Restored collection '${collectionName}' from ${jsonFilePath}`
        );
      }
      console.log("MongoDB restored.");

      // Step 2: Unzip and replace the public folder
      console.log("Replacing public folder...");
      if (fs.existsSync(publicZipPath)) {
        await unzipFolder(publicZipPath, publicFolderPath);
        console.log("Public folder restored.");
      } else {
        console.warn("Public folder zip not found in backup.");
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
    return collections.map((collection) => collection.name);
  } finally {
    await client.close();
  }
};

// Helper function to zip a folder
const zipFolder = (sourceFolder, zipFilePath) => {
  return new Promise((resolve, reject) => {
    const output = fs.createWriteStream(zipFilePath);
    const archive = archiver("zip", { zlib: { level: 9 } });

    output.on("close", resolve);
    archive.on("error", reject);

    archive.pipe(output);
    archive.directory(sourceFolder, false);
    archive.finalize();
  });
};

// Helper function to unzip a folder
const unzipFolder = (zipFilePath, destinationFolder) => {
  return fs
    .createReadStream(zipFilePath)
    .pipe(unzipper.Extract({ path: destinationFolder }))
    .promise();
};

module.exports = BackupService;
