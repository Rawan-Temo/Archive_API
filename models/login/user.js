const mongoose = require("mongoose");
const Joi = require("joi");
const userSchema = new mongoose.Schema(
  {
    username: Joi.string().min(3).max(50).required(),
    password: Joi.string().min(6).max(50).required(),
    role: {
      type: String,
      enum: ["admin", "user"],
      required: true,
      trim: true,
    },
    sectionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Section",
      required: function () {
        return this.role === "user"; // Use function() instead of arrow function
      },
    },
    active: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);
userSchema.index(
  { username: 1 },
  { unique: true, partialFilterExpression: { active: true } }
);

userSchema.pre("findOneAndUpdate", async function (next) {
  const update = this.getUpdate();
  if (update.role === "user" && !update.sectionId) {
    const user = await this.model.findOne(this.getQuery());
    if (user.role === "admin") {
      throw new Error(
        "A sectionId is required when updating an admin to a user."
      );
    }
  }
  next();
});

const User = mongoose.model("User", userSchema);
module.exports = User;
