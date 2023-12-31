const mongoose = require("mongoose");

const PostSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    photo: {
      type: String,
      default: "",
    },

    description: {
      type: String,
      default: "",
    },
    likes: {
      type: [String],
      default: [],
    },
    location: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Post", PostSchema);
