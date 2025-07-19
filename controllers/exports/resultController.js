const Result = require("../../models/exports/result");
const APIFeatures = require("../../utils/apiFeatures");
const { search } = require("../../utils/serach");
const Image = require("../../models/media/image");
const Video = require("../../models/media/video");
const Document = require("../../models/media/document");
const Audio = require("../../models/media/audio");
// Get all Results
const getAllResults = async (req, res) => {
  if (req.query.search) {
    await search(Result, ["code"], [], req, res);
    return;
  }

  try {
    const features = new APIFeatures(Result.find(), req.query)
      .filter()
      .sort()
      .limitFields()
      .paginate();

    const queryObj = { ...req.query };
    const excludedFields = ["page", "sort", "limit", "fields"];
    excludedFields.forEach((el) => delete queryObj[el]);

    let queryStr = JSON.stringify(queryObj);
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);
    const parsedQuery = JSON.parse(queryStr);

    const [resultList, total] = await Promise.all([
      features.query.lean(),
      Result.countDocuments(parsedQuery),
    ]);

    res.status(200).json({
      status: "success",
      results: resultList.length,
      total,
      data: resultList,
    });
  } catch (error) {
    res.status(500).json({
      status: "fail",
      message: error.message,
    });
  }
};

// Create new Result
const createResult = async (req, res) => {
  try {
    const newResult = await Result.create(req.body);
    res.status(201).json({
      status: "success",
      data: newResult,
    });
  } catch (error) {
    res.status(400).json({
      status: "fail",
      message: error.message,
    });
  }
};

// Get Result by ID

const getResultById = async (req, res) => {
  try {
    const role = req.user.role;
    let result;

    const baseQuery = {
      _id: req.params.id,
      active: true,
    };

    if (role === "user") {
      baseQuery.sectionId = req.user.sectionId;
    }

    result = await Result.findOne(baseQuery);

    if (!result) {
      return res.status(404).json({ message: "Result not found" });
    }

    const mediaTypes = [Image, Video, Document, Audio];
    const mediaPromises = mediaTypes.map((Model) =>
      Model.find({ parentId: result._id })
    );
    const [images, videos, documents, audios] = await Promise.all(
      mediaPromises
    );

    const resultWithMedia = {
      ...result.toObject(),
      media: {
        images: images.map((i) => ({ _id: i._id, src: i.src })),
        videos: videos.map((v) => ({ _id: v._id, src: v.src })),
        documents: documents.map((d) => ({ _id: d._id, src: d.src })),
        audios: audios.map((a) => ({ _id: a._id, src: a.src })),
      },
    };

    res.status(200).json({
      status: "success",
      data: resultWithMedia,
    });
  } catch (error) {
    res.status(500).json({
      status: "fail",
      message: error.message,
    });
  }
};

// Update Result
const updateResult = async (req, res) => {
  try {
    const updatedResult = await Result.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true,
      }
    );
    if (!updatedResult) {
      return res
        .status(404)
        .json({ status: "fail", message: "Result not found" });
    }
    res.status(200).json({
      status: "success",
      data: updatedResult,
    });
  } catch (error) {
    res.status(500).json({
      status: "fail",
      message: error.message,
    });
  }
};

// Deactivate Result
const deactivateResult = async (req, res) => {
  try {
    const updated = await Result.findByIdAndUpdate(
      req.params.id,
      { active: false },
      { new: true, runValidators: true }
    );

    if (!updated) {
      return res
        .status(404)
        .json({ status: "fail", message: "Result not found" });
    }

    res.status(200).json({
      status: "success",
      message: "Result deactivated successfully",
      data: updated,
    });
  } catch (error) {
    res.status(500).json({
      status: "fail",
      message: error.message,
    });
  }
};

module.exports = {
  getAllResults,
  createResult,
  getResultById,
  updateResult,

  deactivateResult,
};
