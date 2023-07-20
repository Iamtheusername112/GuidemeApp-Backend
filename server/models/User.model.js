const { Schema, model } = require("mongoose");

const UserSchema = new Schema(
  {
    username: {
      type: String,
      unique: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
      min: 6,
    },
    profileImg: {
      type: String,
      default: "",
    },
    followings: {
      type: String,
      default: "",
    },
    followers: {
      type: String,
      default: [],
    },
    bio: {
      type: String,
      default: "",
    },
    BookmarkedPosts: {
      type: Array,
      default: [],
    },
  },
  {
    // this second object adds extra properties: `createdAt` and `updatedAt`
    timestamps: true,
  }
);

const User = model("User", UserSchema);

module.exports = User;
