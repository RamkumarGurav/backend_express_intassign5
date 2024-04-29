const fs = require("fs/promises");
const { writeFile } = require("fs/promises");

module.exports = async function folderMaker(path) {
  try {
    await fs.access(path, fs.constants.F_OK); // Check if folder exists
  } catch (err) {
    await fs.mkdir(path, { recursive: true }); // Create folder if it doesn't exist
  }
};
