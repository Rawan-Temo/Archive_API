const { exec } = require("child_process");
const path = require("path");
const util = require("util");

const execAsync = util.promisify(exec);
const MBTILES_PATH = path.join(
  __dirname,
  "../public/tileserver/syria_0_16.mbtiles"
);
console.log(MBTILES_PATH);

// Start TileServer-GL-Light
const turnMapOn = () => {
  try {
    execAsync(
      `tileserver-gl-light ${MBTILES_PATH} --port 8080`,
      (err, stdout, stderr) => {
        if (err) {
          console.error(`Error starting TileServer: ${err.message}`);
          return;
        }
        console.log("TileServer is running on port 8080");
      }
    );
  } catch (error) {
    console.log(error);
  }
};

// Proxy TileServer requests through Express

module.exports = turnMapOn;
