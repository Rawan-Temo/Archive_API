const APIFeatures = require("../../utils/apiFeatures");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const Document = require("../../models/media/document"); // Assuming you have a `document` model similar to the other media models
//----------------------------------------------------------------
//----------------------------------------------------------------
// Document Handling
//----------------------------------------------------------------
//----------------------------------------------------------------

// Get all documents
const allDocuments = async (req, res) => {
  try {
    // Create a filtered query object for counting active documents
    const queryObj = { ...req.query };
    const excludedFields = ["page", "sort", "limit", "fields"];
    excludedFields.forEach((el) => delete queryObj[el]);

    // Parse the query string to convert operators like gte/gt/lte/lt into MongoDB equivalents
    let queryStr = JSON.stringify(queryObj);
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);
    const parsedQuery = JSON.parse(queryStr);

    // Apply the parsed filter for querying and counting
    const features = new APIFeatures(Document.find(), req.query)
      .filter()
      .sort()
      .limitFields()
      .paginate();
    const [documentsList, totalDocumentsCount] = await Promise.all([
      features.query, // Get paginated documents results
      Document.countDocuments(parsedQuery), // Count total matching documents
    ]);

    res.status(200).json({
      status: "success",
      results: documentsList.length, // Number of results in this response
      totalDocumentsCount, // Total count of matching documents
      data: documentsList, // The documents data
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Multer configuration for document uploads
const documentStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, "..", "..", "public", "documents"); // Store in "documents" folder
    cb(null, uploadPath); // Correct path to save document files
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, `${uniqueSuffix}-${file.originalname}`);
  },
});

const documentFileFilter = (req, file, cb) => {
  const validMimeTypes = [
    "application/pdf", 
    "application/msword", 
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document", 
    "application/zip", 
    "application/x-rar-compressed",
  ]; // Specify allowed document types
  if (validMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Only document files are allowed!"), false);
  }
};

const documentUploads = multer({
  storage: documentStorage,
  fileFilter: documentFileFilter,
  limits: {
    fileSize: 50 * 1024 * 1024, // 20MB per document file
  },
});

const uploadDocuments = documentUploads.array("documents", 10); // Allow up to 10 documents

// Function to handle document uploads and save them to the database
const handleDocuments = async (req, res) => {
  try {
    const { informationId } = req.body; // Extract the informationId from the request body

    if (!informationId) {
      return res.status(400).json({ error: "informationId is required" });
    }

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: "No document files uploaded" });
    }

    const documentRecords = [];

    // Loop through the uploaded files and save them to the database
    for (const file of req.files) {
      const documentSrc = `/documents/${file.filename}`;
      const newDocument = new Document({
        informationId,
        src: documentSrc,
      });

      const savedDocument = await newDocument.save();
      documentRecords.push(savedDocument);
    }

    res.status(200).json({
      message: "Document files uploaded and saved successfully!",
      documents: documentRecords,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

// Delete documents
const deleteDocuments = async (req, res) => {
  try {
    const { documentIds } = req.body; // Assuming you pass an array of document IDs to delete

    if (!documentIds || documentIds.length === 0) {
      return res.status(400).json({ error: "No document IDs provided for deletion" });
    }

    // Find documents by their IDs
    const documentsToDelete = await Document.find({ _id: { $in: documentIds } });

    if (documentsToDelete.length === 0) {
      return res.status(404).json({ error: "No documents found to delete" });
    }

    // Delete each document file from the file system
    for (const document of documentsToDelete) {
      const documentPath = path.join(__dirname, "..", "..", "public", document.src); // Path to the document file
      if (fs.existsSync(documentPath)) {
        fs.unlinkSync(documentPath); // Delete the document file from the server
      }
    }

    // Delete the documents from the database
    await Document.deleteMany({ _id: { $in: documentIds } });

    res.status(200).json({
      message: "Documents deleted successfully from both database and file system.",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

// Update document
const updateDocument = async (req, res) => {
  try {
    const { id } = req.params; // The ID of the document to update

    // Find the existing document document in the database
    const existingDocument = await Document.findById(id);

    if (!existingDocument) {
      return res.status(404).json({ error: "Document not found" });
    }

    // Determine the new document path (if any)
    const newDocumentPath = req.files[0]
      ? `/documents/${req.files[0].filename}` // New document path
      : existingDocument.src; // If no new document, keep the old one

    // If an old document exists and a new one is uploaded, delete the old one
    if (existingDocument.src && req.files[0]) {
      const oldDocumentPath = path.join(
        __dirname,
        "..",
        "..",
        "public",
        existingDocument.src
      ); // Absolute path to the old document
      if (fs.existsSync(oldDocumentPath)) {
        fs.unlinkSync(oldDocumentPath); // Delete old document file
      }
    }

    // Update the document document in the database
    const updatedDocument = await Document.findByIdAndUpdate(
      id,
      { src: newDocumentPath }, // Update the document path
      { new: true, runValidators: true } // Return the updated document and validate
    );

    // Return a success response with the updated document
    res.status(200).json({
      message: "Document updated successfully",
      updatedDocument,
    });
  } catch (error) {
    console.error(error);
    res.status(400).json({ message: error.message });
  }
};

module.exports = {
  handleDocuments,
  allDocuments,
  uploadDocuments,
  deleteDocuments,
  updateDocument,
};
