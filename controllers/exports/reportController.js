const Report = require("../../models/exports/report");
const APIFeatures = require("../../utils/apiFeatures");
const { search } = require("../../utils/serach");
const Image = require("../../models/media/image");
const Video = require("../../models/media/video");
const Document = require("../../models/media/document");
const Audio = require("../../models/media/audio");
// Get all Reports
const getAllReports = async (req, res) => {
  if (req.query.search) {
    await search(Report, ["title", "subject", "number"], [], req, res);
    return;
  }

  try {
    const features = new APIFeatures(Report.find(), req.query)
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

    const [reports, total] = await Promise.all([
      features.query.lean(),
      Report.countDocuments(parsedQuery),
    ]);

    res.status(200).json({
      status: "success",
      results: reports.length,
      total,
      data: reports,
    });
  } catch (error) {
    res.status(500).json({
      status: "fail",
      message: error.message,
    });
  }
};

// Create a new Report
const createReport = async (req, res) => {
  try {
    const newReport = await Report.create(req.body);
    res.status(201).json({
      status: "success",
      data: newReport,
    });
  } catch (error) {
    res.status(400).json({
      status: "fail",
      message: error.message,
    });
  }
};

// Get a Report by ID

const getReportById = async (req, res) => {
  try {
    const role = req.user.role;
    let report;

    const baseQuery = {
      _id: req.params.id,
      active: true,
    };

    if (role === "user") {
      baseQuery.sectionId = req.user.sectionId;
    }

    report = await Report.findOne(baseQuery);

    if (!report) {
      return res.status(404).json({ message: "Report not found" });
    }

    const mediaTypes = [Image, Video, Document, Audio];
    const mediaPromises = mediaTypes.map((Model) =>
      Model.find({ parentId: report._id })
    );
    const [images, videos, documents, audios] = await Promise.all(
      mediaPromises
    );

    const reportWithMedia = {
      ...report.toObject(),
      media: {
        images: images.map((i) => ({ _id: i._id, src: i.src })),
        videos: videos.map((v) => ({ _id: v._id, src: v.src })),
        documents: documents.map((d) => ({ _id: d._id, src: d.src })),
        audios: audios.map((a) => ({ _id: a._id, src: a.src })),
      },
    };

    res.status(200).json({
      status: "success",
      data: reportWithMedia,
    });
  } catch (error) {
    res.status(500).json({
      status: "fail",
      message: error.message,
    });
  }
};
// Update a Report
const updateReport = async (req, res) => {
  try {
    const updatedReport = await Report.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true,
      }
    );

    if (!updatedReport) {
      return res.status(404).json({
        status: "fail",
        message: "Report not found",
      });
    }

    res.status(200).json({
      status: "success",
      data: updatedReport,
    });
  } catch (error) {
    res.status(500).json({
      status: "fail",
      message: error.message,
    });
  }
};

// Deactivate a Report (soft delete)
const deactivateReport = async (req, res) => {
  try {
    const updated = await Report.findByIdAndUpdate(
      req.params.id,
      { active: false },
      { new: true, runValidators: true }
    );

    if (!updated) {
      return res.status(404).json({
        status: "fail",
        message: "Report not found",
      });
    }

    res.status(200).json({
      status: "success",
      message: "Report deactivated successfully",
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
  getAllReports,
  createReport,
  getReportById,
  updateReport,
  deactivateReport,
};
