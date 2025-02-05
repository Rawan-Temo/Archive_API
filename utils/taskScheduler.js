const cron = require("node-cron");
const BackupService = require("./backupService");

// Schedule a task to run every 10 minutes for testing
cron.schedule("* * * * *", async () => {
  console.log("Cron job triggered at", new Date().toISOString());
  try {
    console.log("Starting backup...");
    const result = await BackupService.createBackup();
    if (result.success) {
      console.log(result.message);
    } else {
      console.error(result.message, result.error);
    }
  } catch (err) {
    console.error("Error during backup:", err);
  }
});

console.log(
  "Task scheduler initialized. Backup scheduled every monday at midnight."
);
