const express = require("express");
const bcrypt = require("bcrypt");
const mongoose = require("mongoose");
const verifyToken = require("../middlewares/verifyToken");
const User = require("../models/User.model");
const Post = require("../models/Post");

const userController = express.Router();

// Get suggested users
userController.get("/find/suggestedUsers", verifyToken, async (req, res) => {
  try {
    const currentUser = await User.findById(req.user.id);
    const users = await User.find({}).select("-password");

    let suggestedUsers = users.filter(
      (user) =>
        !currentUser.followings.includes(user._id) &&
        user._id.toString() !== currentUser._id.toString()
    );

    // Return the first 5 users only
    suggestedUsers = suggestedUsers.slice(0, 5);

    return res.status(200).json(suggestedUsers);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

// Get friends
userController.get("/find/friends", verifyToken, async (req, res) => {
  try {
    const currentUser = await User.findById(req.user.id);
    const friends = await Promise.all(
      currentUser.followings.map((friendId) =>
        User.findById(friendId).select("-password")
      )
    );

    return res.status(200).json(friends);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

// Get one/individual user
userController.get("/find/:userId", verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);

    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }

    const { password, ...others } = user._doc;

    return res.status(200).json(others);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

// Get all users (without sensitive info)
userController.get("/findAll", async (req, res) => {
  try {
    const users = await User.find({}).select("username email _id createdAt");

    return res.status(200).json(users);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

// Update user
userController.put("/updateUser/:userId", verifyToken, async (req, res) => {
  try {
    const { userId } = req.params;

    if (userId !== req.user.id) {
      return res
        .status(403)
        .json({ msg: "You can only update your own profile" });
    }

    if (req.body.password) {
      req.body.password = await bcrypt.hash(req.body.password, 10);
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $set: req.body },
      { new: true }
    );

    return res.status(200).json({ msg: "Successfully updated the user" });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

// Delete user
userController.delete("/deleteUser/:userId", verifyToken, async (req, res) => {
  try {
    const { userId } = req.params;

    if (userId !== req.user.id) {
      return res
        .status(403)
        .json({ msg: "You can only delete your own profile" });
    }

    await User.findByIdAndDelete(userId);
    return res.status(200).json({ msg: "User successfully deleted" });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

// Follow and unfollow users
userController.put(
  "/toggleFollow/:otherUserId",
  verifyToken,
  async (req, res) => {
    try {
      const { otherUserId } = req.params;
      const currentUserId = req.user.id;

      if (currentUserId === otherUserId) {
        return res.status(400).json({ msg: "You can't follow yourself" });
      }

      const currentUser = await User.findById(currentUserId);
      const otherUser = await User.findById(otherUserId);

      const toggleFollowUser = async (user, userId) => {
        user.followings.includes(userId)
          ? user.followings.pull(userId)
          : user.followings.push(userId);

        await user.save();
      };

      await Promise.all([
        toggleFollowUser(currentUser, otherUserId),
        toggleFollowUser(otherUser, currentUserId),
      ]);

      return res.status(200).json({ msg: "Toggle follow success" });
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }
);

// Bookmark a post
userController.put("/bookmark/:postId", verifyToken, async (req, res) => {
  try {
    const post = await Post.findById(req.params.postId).populate(
      "user",
      "-password"
    );

    if (!post) {
      return res.status(404).json({ msg: "Post not found" });
    }

    const currentUser = await User.findById(req.user.id);
    const { bookmarkedPosts } = currentUser;

    const postIndex = bookmarkedPosts.findIndex(
      (post) => post._id.toString() === req.params.postId
    );

    if (postIndex !== -1) {
      bookmarkedPosts.splice(postIndex, 1);
    } else {
      bookmarkedPosts.push(post);
    }

    await currentUser.save();
    return res.status(200).json({ msg: "Toggle bookmark success" });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

module.exports = userController;
