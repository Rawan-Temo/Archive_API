const Export = require("../../models/exports/export");
const APIFeatures = require("../../utils/apiFeatures");
const { search } = require("../../utils/serach");

// Get all exports
const getAllExports = async (req, res) => {
  if (req.query.search) {
    await search(
      Export,
      ["code"],
      [{ path: "questions", populate: { path: "informationId" } }],
      req,
      res
    );
    return;
  }

  try {
    const features = new APIFeatures(
      Export.find().populate([
        { path: "questions", populate: { path: "informationId" } },
      ]),
      req.query
    )
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

    const [exportsList, total] = await Promise.all([
      features.query.lean(),
      Export.countDocuments(parsedQuery),
    ]);

    res.status(200).json({
      status: "success",
      results: exportsList.length,
      total,
      data: exportsList,
    });
  } catch (error) {
    res.status(500).json({
      status: "fail",
      message: error.message,
    });
  }
};

// Create new export
const createExport = async (req, res) => {
  try {
    const newExport = await Export.create(req.body);
    res.status(201).json({
      status: "success",
      data: newExport,
    });
  } catch (error) {
    res.status(400).json({
      status: "fail",
      message: error.message,
    });
  }
};

// Get export by ID
const getExportById = async (req, res) => {
  try {
    const exportDoc = await Export.findById(req.params.id)
      .populate([{ path: "questions", populate: { path: "informationId" } }])
      .lean();
    if (!exportDoc) {
      return res
        .status(404)
        .json({ status: "fail", message: "Export not found" });
    }
    res.status(200).json({
      status: "success",
      data: exportDoc,
    });
  } catch (error) {
    res.status(500).json({
      status: "fail",
      message: error.message,
    });
  }
};

// Update export
const updateExport = async (req, res) => {
  try {
    const updatedExport = await Export.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true,
      }
    );
    if (!updatedExport) {
      return res
        .status(404)
        .json({ status: "fail", message: "Export not found" });
    }
    res.status(200).json({
      status: "success",
      data: updatedExport,
    });
  } catch (error) {
    res.status(500).json({
      status: "fail",
      message: error.message,
    });
  }
};

// Deactivate export
const deactivateExport = async (req, res) => {
  try {
    const updated = await Export.findByIdAndUpdate(
      req.params.id,
      { active: false },
      { new: true, runValidators: true }
    );

    if (!updated) {
      return res
        .status(404)
        .json({ status: "fail", message: "Export not found" });
    }

    res.status(200).json({
      status: "success",
      message: "Export deactivated successfully",
      data: updated,
    });
  } catch (error) {
    res.status(500).json({
      status: "fail",
      message: error.message,
    });
  }
};
//  afunction that checks if any of the current exports are expired and returns their id
const expiredExports = async (req, res) => {
  try {
    const results = await Export.aggregate([
      {
        $match: {
          active: true,
          expirationDate: { $lte: new Date() },
        },
      },
      {
        $lookup: {
          from: "questions",
          localField: "questions",
          foreignField: "_id",
          as: "questionsDetails",
        },
      },
      {
        $addFields: {
          answeredCount: {
            $size: {
              $filter: {
                input: "$questionsDetails",
                as: "q",
                cond: {
                  $gt: [{ $strLenCP: { $ifNull: ["$$q.answer", ""] } }, 0],
                },
              },
            },
          },
        },
      },
      {
        $match: {
          $expr: {
            $or: [
              { $eq: [{ $size: "$questionsDetails" }, 0] },
              { $eq: ["$answeredCount", 0] },
            ],
          },
        },
      },
      {
        $project: {
          code: 1,
           expirationDate: 1,
          active: 1,
          questionsDetails: 1,
        },
      },
    ]);

    res.status(200).json({
      status: "success",
      results: results.length,
      data: results,
    });
  } catch (error) {
    res.status(500).json({
      status: "fail",
      message: error.message,
    });
  }
};
const countExpiredUnansweredExports = async (req, res) => {
  try {
    const result = await Export.aggregate([
      {
        $match: {
          active: true,
          expirationDate: { $lte: new Date() },
        },
      },
      {
        $lookup: {
          from: "questions",
          localField: "questions",
          foreignField: "_id",
          as: "questionsDetails",
        },
      },
      {
        $addFields: {
          answeredCount: {
            $size: {
              $filter: {
                input: "$questionsDetails",
                as: "q",
                cond: {
                  $gt: [{ $strLenCP: { $ifNull: ["$$q.answer", ""] } }, 0],
                },
              },
            },
          },
        },
      },
      {
        $match: {
          $expr: {
            $or: [
              { $eq: [{ $size: "$questionsDetails" }, 0] },
              { $eq: ["$answeredCount", 0] },
            ],
          },
        },
      },
      {
        $count: "expiredUnansweredCount",
      },
    ]);

    const count = result.length > 0 ? result[0].expiredUnansweredCount : 0;

    res.status(200).json({
      status: "success",
      count,
    });
  } catch (error) {
    res.status(500).json({
      status: "fail",
      message: error.message,
    });
  }
};
module.exports = {
  getAllExports,
  createExport,
  getExportById,
  updateExport,
  deactivateExport,
  expiredExports,
  countExpiredUnansweredExports,
};
