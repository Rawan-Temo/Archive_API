const mongoose = require("mongoose");
const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      minlength: 3,
      maxlength: 50,
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
      trim: true,
    },

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
