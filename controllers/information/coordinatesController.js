const Coordinate = require("../../models/information/coordinate");
const APIFeatures = require("../../utils/apiFeatures");
const { ObjectId } = require("mongoose").Types;
const { search } = require("../../utils/serach");

// Get all coordinates
const allCoordinates = async (req, res) => {
  if (req.query.search) {
    await search(
      Coordinate,
      ["coordinates"],
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
        Coordinate.find({ sectionId }).populate([
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
        Coordinate.find()
          .populate([
            { path: "sectionId", select: "name" },
            { path: "cityId", select: "name" },
            { path: "countryId", select: "name" },
            { path: "governorateId", select: "name" },
            { path: "countyId", select: "name" },
            { path: "regionId", select: "name" },
            { path: "streetId", select: "name" },
            { path: "villageId", select: "name" },
            { path: "sources", select: "source_name" },
          ])
          .lean(),
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
    if (role === "user") {
      parsedQuery.sectionId = sectionId;
    }
    const [coordinates, numberOfActiveCoordinates] = await Promise.all([
      features.query,
      Coordinate.countDocuments(parsedQuery),
    ]);

    res.status(200).json({
      status: "success",
      numberOfActiveCoordinates,
      results: coordinates.length,
      data: coordinates,
    });
  } catch (error) {
    res.status(500).json({
      status: "fail",
      message: error.message,
    });
  }
};

// Add new coordinates
const addCoordinates = async (req, res) => {
  try {
    const role = req.user.role;
    const sectionId = new ObjectId(req.user.sectionId);

    // If the user is a regular user, add the sectionId to the request body
    if (role === "user") {
      req.body.sectionId = sectionId;
    }

    const newCoordinates = await Coordinate.create(req.body);

    res.status(201).json({
      status: "success",
      data: newCoordinates,
    });
  } catch (error) {
    res.status(400).json({
      status: "fail",
      message: error.message,
    });
  }
};

// Get coordinates by ID
const getCoordinatesById = async (req, res) => {
  try {
    const role = req.user.role;
    let coordinate;
    if (role === "user") {
      coordinate = await Coordinate.findOne({
        _id: req.params.id,
        sectionId: req.user.sectionId,
        active: true, // Ensure only active coordinates are returned
      })
        .populate([
          { path: "sectionId", select: "name" },
          { path: "cityId", select: "name" },
          { path: "countryId", select: "name" },
          { path: "governorateId", select: "name" },
          { path: "countyId", select: "name" },
          { path: "regionId", select: "name" },
          { path: "streetId", select: "name" },
          { path: "villageId", select: "name" },
          { path: "sources", select: "source_name" },
        ])
        .lean();
      // Fetch the main information document by ID with populated fields
    } else {
      coordinate = await Coordinate.findOne({
        _id: req.params.id,
        active: true, // Ensure only active coordinates are returned
      })
        .populate([
          { path: "sectionId", select: "name" },
          { path: "cityId", select: "name" },
          { path: "countryId", select: "name" },
          { path: "governorateId", select: "name" },
          { path: "countyId", select: "name" },
          { path: "regionId", select: "name" },
          { path: "streetId", select: "name" },
          { path: "villageId", select: "name" },
          { path: "sources", select: "source_name" },
        ])
        .lean();
    }

    if (!coordinate) {
      return res.status(404).json({ message: "Coordinates not found" });
    }

    res.status(200).json({
      status: "success",
      data: coordinate,
    });
  } catch (error) {
    res.status(500).json({
      status: "fail",
      message: error.message,
    });
  }
};

// Update coordinates by ID
const updateCoordinates = async (req, res) => {
  try {
    const role = req.user.role;
    const sectionId = new ObjectId(req.user.sectionId);
    const query = { _id: req.params.id };

    // If the user is a regular user, ensure the sectionId matches
    if (role === "user") {
      req.body.sectionId = sectionId;
      query.sectionId = sectionId;
    }

    const updatedCoordinates = await Coordinate.findOneAndUpdate(
      query,
      req.body,
      {
        new: true, // Return the updated document
        runValidators: true, // Enforce schema validators
      }
    );

    if (!updatedCoordinates) {
      return res.status(404).json({ message: "Coordinates not found" });
    }

    res.status(200).json({
      status: "success",
      data: updatedCoordinates,
    });
  } catch (error) {
    res.status(500).json({
      status: "fail",
      message: error.message,
    });
  }
};

// Deactivate coordinates by ID
const deactivateCoordinates = async (req, res) => {
  try {
    const role = req.user.role;
    const sectionId = new ObjectId(req.user.sectionId);

    // If the user is a regular user, ensure the sectionId matches
    const query = { _id: req.params.id };
    if (role === "user") {
      query.sectionId = sectionId;
    }

    const deactivatedCoordinates = await Coordinate.findOneAndUpdate(
      query,
      { active: false },
      {
        new: true,
        runValidators: true,
      }
    );

    if (!deactivatedCoordinates) {
      return res.status(404).json({ message: "Coordinates not found" });
    }

    res.status(200).json({
      status: "success",
      message: "Coordinates deactivated successfully",
      data: deactivatedCoordinates,
    });
  } catch (error) {
    res.status(500).json({
      status: "fail",
      message: error.message,
    });
  }
};

module.exports = {
  allCoordinates,
  addCoordinates,
  getCoordinatesById,
  updateCoordinates,
  deactivateCoordinates,
};
