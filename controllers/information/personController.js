const Person = require("../../models/information/person");
const APIFeatures = require("../../utils/apiFeatures");
const multer = require("multer");
const path = require("path");
const { ObjectId } = require("mongoose").Types;
const { search } = require("../../utils/serach");

// Get all people
const allPeople = async (req, res) => {
  if (req.query.search) {
    await search(
      Person,
      ["firstName", "surName", "fatherName"],
      [
        { path: "sectionId", select: "name" },
        { path: "cityId", select: "name" },
        { path: "countryId", select: "name" },
        { path: "governorateId", select: "name" },
        { path: "countyId", select: "name" },
        { path: "regionId", select: "name" },
        { path: "streetId", select: "name" },
        { path: "villageId", select: "name" },
        { path: "sources", select: "source_name" },
      ],
      req,
      res
    );
    return;
  }
  try {
    const role = req.user.role;
    const sectionId = new ObjectId(req.user.sectionId);
    let features;
    if (role === "user") {
      features = new APIFeatures(
        Person.find({ sectionId }).populate([
          { path: "sectionId", select: "name" },
          { path: "cityId", select: "name" },
          { path: "countryId", select: "name" },
          { path: "governorateId", select: "name" },
          { path: "countyId", select: "name" },
          { path: "regionId", select: "name" },
          { path: "streetId", select: "name" },
          { path: "villageId", select: "name" },
          { path: "sources", select: "source_name" },
        ]),
        req.query
      )
        .filter()
        .sort()
        .limitFields()
        .paginate();
    } else {
      features = new APIFeatures(
        Person.find().populate([
          { path: "sectionId", select: "name" },
          { path: "cityId", select: "name" },
          { path: "countryId", select: "name" },
          { path: "governorateId", select: "name" },
          { path: "countyId", select: "name" },
          { path: "regionId", select: "name" },
          { path: "streetId", select: "name" },
          { path: "villageId", select: "name" },
          { path: "sources", select: "source_name" },
        ]),
        req.query
      )
        .filter()
        .sort()
        .limitFields()
        .paginate();
    }

    const queryObj = { ...req.query };
    const excludedFields = ["page", "sort", "limit", "fields"];
    excludedFields.forEach((el) => delete queryObj[el]);

    let queryStr = JSON.stringify(queryObj);
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);
    const parsedQuery = JSON.parse(queryStr);

    // Add sectionId to the parsed query if the user is not an admin
    if (role === "user") {
      parsedQuery.sectionId = sectionId;
    }

    const [people, numberOfActivePeople] = await Promise.all([
      features.query,
      Person.countDocuments(parsedQuery),
    ]);
    res.status(200).json({
      status: "success",
      results: people.length,
      numberOfActivePeople,
      people,
    });
  } catch (error) {
    res.status(500).json({
      error: error.message,
    });
  }
};

// Create a new person
const createPerson = async (req, res) => {
  try {
    const role = req.user.role;
    const sectionId = new ObjectId(req.user.sectionId);

    // If the user is a regular user, add the sectionId to the request body
    if (role === "user") {
      req.body.sectionId = sectionId;
    }
    if (req.file) {
      req.body.image = `/images/profileImages/${req.file.filename}`;
    }

    const newPerson = await Person.create(req.body);
    res.status(201).json({
      status: "success",
      data: newPerson,
    });
  } catch (error) {
    res.status(400).json({
      status: "fail",
      message: error.message,
    });
  }
};

// Get a person by ID
const getPersonById = async (req, res) => {
  try {
    const role = req.user.role;
    const sectionId = new ObjectId(req.user.sectionId);
    let person;
    if (role === "user") {
      person = await Person.findOne({
        _id: req.params.id,
        sectionId: req.user.sectionId, // Ensure sectionId matches the logged-in user
        active: true, // Ensure only active persons are returned
      }).populate([
        { path: "sectionId", select: "name" },
        { path: "cityId", select: "name" },
        { path: "countryId", select: "name" },
        { path: "governorateId", select: "name" },
        { path: "countyId", select: "name" },
        { path: "regionId", select: "name" },
        { path: "streetId", select: "name" },
        { path: "villageId", select: "name" },
        { path: "sources", select: "source_name" },
      ]);
    } else {
      person = await Person.findOne({
        _id: req.params.id,
        active: true, // Ensure only active persons are returned
      }).populate([
        { path: "sectionId", select: "name" },
        { path: "cityId", select: "name" },
        { path: "countryId", select: "name" },
        { path: "governorateId", select: "name" },
        { path: "countyId", select: "name" },
        { path: "regionId", select: "name" },
        { path: "streetId", select: "name" },
        { path: "villageId", select: "name" },
        { path: "sources", select: "source_name" },
      ]);
    }

    if (!person) {
      return res.status(404).json({ message: "Person not found" });
    }

    res.status(200).json({
      status: "success",
      data: person,
    });
  } catch (error) {
    res.status(500).json({
      status: "fail",
      message: error.message,
    });
  }
};

// Update a person by ID
const updatePerson = async (req, res) => {
  try {
    const role = req.user.role;
    const sectionId = new ObjectId(req.user.sectionId);
    const query = { _id: req.params.id };
    // If the user is a regular user, ensure the sectionId matches
    if (role === "user") {
      req.body.sectionId = sectionId;
      query.sectionId = sectionId;
    }

    // If a file is uploaded, add the file path to the `image` field
    if (req.file) {
      req.body.image = `/images/profileImages/${req.file.filename}`;
    }

    const updatedPerson = await Person.findOneAndUpdate(query, req.body, {
      new: true, // Return the updated document
      runValidators: true, // Enforce schema validators
    });

    if (!updatedPerson) {
      return res.status(404).json({ message: "Person not found" });
    }

    res.status(200).json({
      status: "success",
      data: updatedPerson,
    });
  } catch (error) {
    res.status(500).json({
      status: "fail",
      message: error.message,
    });
  }
};

// Deactivate a person by ID
const deactivatePerson = async (req, res) => {
  try {
    const role = req.user.role;
    const sectionId = new ObjectId(req.user.sectionId);

    // If the user is a regular user, ensure the sectionId matches
    const query = { _id: req.params.id };
    if (role === "user") {
      query.sectionId = sectionId;
    }

    const deactivatedPerson = await Person.findOneAndUpdate(
      query,
      { active: false },
      { new: true, runValidators: true }
    );

    if (!deactivatedPerson) {
      return res.status(404).json({ message: "Person not found" });
    }

    res.status(200).json({
      status: "success",
      message: "Person deactivated successfully",
      data: deactivatedPerson,
    });
  } catch (error) {
    res.status(500).json({
      status: "fail",
      message: error.message,
    });
  }
};

const allJobs = async (req, res) => {
  try {
    // Fetch distinct occupations
    const jobs = await Person.distinct("occupation", {
      occupation: { $ne: null },
    });

    res.status(200).json({
      status: "success",
      jobs,
    });
  } catch (error) {
    console.error("Error retrieving distinct jobs:", error);
    res.status(500).json({
      status: "error",
      message: "Error retrieving distinct jobs",
    });
  }
};

// Multer storage configuration
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, "../../public/images/profileImages")); // Save files to the desired folder
  },
  filename: function (req, file, cb) {
    // Generate a unique file name with timestamp
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(
      null,
      `${file.fieldname}-${uniqueSuffix}${path.extname(file.originalname)}`
    );
  },
});

// Multer file filter for validating image uploads
const fileFilter = (req, file, cb) => {
  const allowedFileTypes = /jpeg|jpg|png/;
  const mimeType = allowedFileTypes.test(file.mimetype);
  const extName = allowedFileTypes.test(
    path.extname(file.originalname).toLowerCase()
  );

  if (mimeType && extName) {
    return cb(null, true);
  }
  cb(new Error("Only .jpeg, .jpg, and .png file formats are allowed!"));
};

// Multer instance
const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // Limit file size to 5MB
  fileFilter: fileFilter,
});

module.exports = {
  allPeople,
  createPerson,
  getPersonById,
  updatePerson,
  deactivatePerson,
  allJobs,
  upload,
};
