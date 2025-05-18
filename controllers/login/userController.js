const APIFeatures = require("../../utils/apiFeatures");
const User = require("../../models/login/user");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const allUsers = async (req, res) => {
  try {
    const features = new APIFeatures(
      User.find().populate("sectionId"),
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

    const [users, numberOfActiveUsers] = await Promise.all([
      features.query,
      User.countDocuments(parsedQuery),
    ]);
    res.status(200).json({
      status: "success",
      numberOfActiveUsers,
      results: users.length,
      users,
    });
  } catch (error) {
    res.status(500).json({
      status: "fail",
      message: error.message,
    });
  }
};
const userById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).populate("sectionId");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json({ status: "success", data: user });
  } catch (error) {
    res.status(500).json({ status: "fail", message: error.message });
  }
};
const createUser = async (req, res) => {
  try {
    const { username, password, role, sectionId } = req.body;

    const existingUser = await User.findOne({
      username,
    });

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create a new user with role and profileId
    const newUser = new User({
      username,
      password: hashedPassword,
      role: role || "user", // Default to 'user' role if no role is provided
      sectionId: sectionId,
    });

    // Save the new user to the database
    await newUser.save();

    // Respond with the created user (excluding the password)
    const userResponse = {
      username: newUser.username,
      role: newUser.role,
      sectionId: newUser.sectionId,
    };

    res.status(201).json({ status: "success", data: userResponse });
  } catch (error) {
    res.status(400).json({
      status: "fail",
      message: error.message,
    });
  }
};

const updateUser = async (req, res) => {
  try {
    const updatedUser = await User.findByIdAndUpdate(req.params.id, req.body, {
      new: true, // Return the updated document
      runValidators: true, // Enforce schema validators
    });
    if (!updatedUser) {
      return res.status(404).json({
        status: "fail",
        message: "User not found",
      });
    }
    res.status(200).json({
      status: "success",
      data: updatedUser,
    });
  } catch (error) {
    res.status(500).json({
      status: "fail",
      message: error.message,
    });
  }
};
const deactivateUser = async (req, res) => {
  try {
    const deactivatedUser = await User.findByIdAndUpdate(
      req.params.id,
      { active: false },
      { new: true, runValidators: true }
    );

    if (!deactivatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({
      status: "success",
      message: "User deactivated successfully",
    });
  } catch (error) {
    res.status(500).json({
      status: "fail",
      message: error.message,
    });
  }
};
const userProfile = async (req, res) => {
  try {
    // Populate the profileId field
    const user = req.user;
    res.status(200).json({ user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const login = async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username }).lean();
    if (!user || user.active === false) {
      return res
        .status(400)
        .json({ message: "Invalid username/email or password" });
    }

    // Compare the entered password with the stored password (hashed)
    const isMatch = await bcrypt.compare(password, user.password);

    console.log(!isMatch);
    if (!isMatch) {
      return res
        .status(400)
        .json({ message: "Invalid username/email or password" });
    }

    // Generate a JWT token
    const token = jwt.sign(
      { userId: user._id },
      process.env.ACCESS_TOKEN_SECRET,
      {
        expiresIn: "10h",
      }
    );

    res.status(200).json({
      message: "Login successful",
      token,
      user,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
module.exports = {
  allUsers,
  userById,
  createUser,
  updateUser,
  deactivateUser,
  userProfile,
  login,
};
