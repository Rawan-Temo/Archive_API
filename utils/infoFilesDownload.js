const express = require("express");
const router = express.Router();
const archiver = require("archiver");
const fs = require("fs");
const Image = require("../models/media/image");
const Audio = require("../models/media/audio");
const Video = require("../models/media/video");
const DocumentTable = require("../models/media/document");
const Information = require("../models/information/information");
const path = require("path");
//----------------------------------------------------------------

// Import the docx package for creating Word documents
const { Document, Packer, Paragraph, TextRun } = require("docx");

const downloadInforamtion = async (req, res) => {
  const { informationId } = req.body;

  // 1. Retrieve file records related to this informationId from various collections
  const filesResult = await getFilesByInformationId(informationId);
  console.log(filesResult);
  if (!filesResult.success) {
    // If an error occurred while fetching file records, return a 500 error response
    return res.status(500).json({ error: filesResult.message });
  }
  console.log(informationId);
  // 2. Retrieve the corresponding SecurityInformation document from the database
  const securityInfo = await Information.findById(informationId)
    .populate([
      { path: "sectionId", select: "name" }, // Only include `name` from Section
      { path: "cityId", select: "name" },
      { path: "countryId", select: "name" },
      { path: "governmentId", select: "name" },
      { path: "regionId", select: "name" },
      { path: "streetId", select: "name" },
      { path: "villageId", select: "name" },
      { path: "events", select: "name" }, // Only include specific fields
      { path: "parties", select: "name" },
      { path: "sources", select: "source_name source_credibility" },
      { path: "people", select: "firstName fatherName surName" },
      { path: "coordinates", select: "coordinates note" },
    ])
    .lean();
  if (!securityInfo) {
    // If no SecurityInformation is found, return a 404 error response
    return res.status(404).json({ error: "Security information not found" });
  }

  // 3. Set headers to indicate that the response will be a ZIP file attachment
  res.setHeader("Content-Type", "application/zip");
  res.setHeader(
    "Content-Disposition",
    `attachment; filename=${informationId}_files.zip`
  );

  // 4. Create a ZIP archive stream with maximum compression (zlib level 9)
  const archive = archiver("zip", { zlib: { level: 9 } });
  // Pipe the archive to the response so that it is streamed directly to the client
  archive.pipe(res);

  // 5. If there are any files associated with this informationId, add them to the ZIP
  if (filesResult.files && filesResult.files.length > 0) {
    filesResult.files.forEach((file) => {
      // file.url is expected to be something like "/images/photo1.png"
      // Build the full file path by joining the public directory with the file's URL
      const fullPath = path.join(__dirname, "..", file.url);
      console.log(fullPath);
      // Check if the file actually exists on the server
      if (fs.existsSync(fullPath)) {
        // Add the file to the archive, using its basename (e.g., photo1.png)
        archive.file(fullPath, { name: path.basename(fullPath) });
      }
    });
  }
  // If no files are found, the ZIP will simply contain the Word document.
  // 6. Prepare an array of fields (from the populated document) to display in the Word doc.
  // They will be displayed in this order.
  const populateFields = [
    { key: "sectionId", label: "Section" },
    { key: "cityId", label: "City" },
    { key: "countryId", label: "Country" },
    { key: "governmentId", label: "Government" },
    { key: "regionId", label: "Region" },
    { key: "streetId", label: "Street" },
    { key: "villageId", label: "Village" },
    { key: "events", label: "Events" },
    { key: "parties", label: "Parties" },
    { key: "sources", label: "Sources" },
    { key: "people", label: "People" },
    { key: "coordinates", label: "Coordinates" },
  ];

  // Create an array to hold the paragraphs for the Word document.
  const paragraphs = [];

  // Add a title paragraph.
  paragraphs.push(
    new Paragraph({
      children: [
        new TextRun({
          text: "Security Information Details",
          bold: true,
          size: 32,
        }),
      ],
      spacing: { after: 300 },
    })
  );

  // 7. Loop over each populated field to create a paragraph.
  //    For each field, display only the selected/populated data in a friendly format.
  populateFields.forEach((field) => {
    const value = securityInfo[field.key];
    if (value) {
      let displayValue = "";

      // Check if the value is an array (e.g., events, parties, etc.)
      if (Array.isArray(value)) {
        // Map each item in the array to its formatted string based on the field key.
        displayValue = value
          .map((item) => {
            switch (field.key) {
              // For these fields, display the 'name' property.
              case "sectionId":
              case "cityId":
              case "countryId":
              case "governmentId":
              case "regionId":
              case "streetId":
              case "villageId":
              case "events":
              case "parties":
                return item.name || "";
              case "sources":
                // For sources, display source_name and cridability.
                return `${item.source_name || ""} (${
                  item.source_credibility || ""
                })`;
              case "people":
                // For people, display firstName, fatherName, and surName.
                return `${item.firstName || ""} ${item.fatherName || ""} ${
                  item.surName || ""
                }`.trim();
              case "coordinates":
                // For coordinates, display the coordinates and the note.
                return `Coordinates: ${item.coordinates || ""}, Note: ${
                  item.note || ""
                }`;
              default:
                return "";
            }
          })
          .filter((str) => str) // Remove empty strings.
          .join(", ");
      } else {
        // If not an array, format the single populated object.
        switch (field.key) {
          case "sectionId":
          case "cityId":
          case "countryId":
          case "governmentId":
          case "regionId":
          case "streetId":
          case "villageId":
          case "events":
          case "parties":
            displayValue = value.name || "";
            break;
          case "sources":
            displayValue = `${value.source_name || ""} (${
              value.cridability || ""
            })`;
            break;
          case "people":
            displayValue = `${value.firstName || ""} ${
              value.fatherName || ""
            } ${value.surName || ""}`.trim();
            break;
          case "coordinates":
            displayValue = `Coordinates: ${value.coordinates || ""}, Note: ${
              value.note || ""
            }`;
            break;
          default:
            displayValue = value.toString();
        }
      }

      // Only add a paragraph if there's something to display.
      if (displayValue) {
        paragraphs.push(
          new Paragraph({
            children: [
              new TextRun({ text: `${field.label}: `, bold: true }),
              new TextRun({ text: `${displayValue}` }),
            ],
            spacing: { after: 200 },
          })
        );
      }
    }
  });

  // 8. Append the "note" and "details" fields as the last two paragraphs in that order.
  if (securityInfo.note) {
    paragraphs.push(
      new Paragraph({
        children: [
          new TextRun({ text: "Note: ", bold: true }),
          new TextRun({ text: `${securityInfo.note}` }),
        ],
        spacing: { after: 200 },
      })
    );
  }

  if (securityInfo.details) {
    paragraphs.push(
      new Paragraph({
        children: [
          new TextRun({ text: "Details: ", bold: true }),
          new TextRun({ text: `${securityInfo.details}` }),
        ],
        spacing: { after: 200 },
      })
    );
  }

  // 9. Create the Word document using the assembled paragraphs.
  const doc = new Document({
    sections: [
      {
        properties: {},
        children: paragraphs,
      },
    ],
  });

  // Generate a buffer containing the Word document data.
  const docBuffer = await Packer.toBuffer(doc);

  // 10. Append the generated Word document to the ZIP archive with the filename "information.docx".
  archive.append(docBuffer, { name: "information.docx" });

  // 11. Finalize the archive to send the ZIP file as the response.
  archive.finalize();
};
//----------------------------------------------------------------
const getFilesByInformationId = async (informationId) => {
  try {
    // Find all matching records in each collection
    const images = await Image.find({ informationId });
    const audios = await Audio.find({ informationId });
    const videos = await Video.find({ informationId });
    const documents = await DocumentTable.find({ informationId });

    // Format the file paths
    const basePath = "/public"; // Assuming files are in "public" folder
    const files = [];

    images.forEach((file) =>
      files.push({ type: "image", url: `${basePath}${file.src}` })
    );
    audios.forEach((file) =>
      files.push({ type: "audio", url: `${basePath}${file.src}` })
    );
    videos.forEach((file) =>
      files.push({ type: "video", url: `${basePath}${file.src}` })
    );
    documents.forEach((file) =>
      files.push({ type: "document", url: `${basePath}${file.src}` })
    );

    return { success: true, files };
  } catch (error) {
    console.error("Error fetching files:", error);
    return { success: false, message: error.message };
  }
};

module.exports = downloadInforamtion;
