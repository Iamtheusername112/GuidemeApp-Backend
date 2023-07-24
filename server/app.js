// ℹ️ Gets access to environment variables/settings
// https://www.npmjs.com/package/dotenv
require("dotenv").config();

//Environment variables
// const dotenv = require("dotenv").config();

const cors = require("cors");

// ℹ️ Connects to the database
require("./db");

// Handles http requests (express is node js framework)
// https://www.npmjs.com/package/express
const express = require("express");

// Handles the handlebars
// https://www.npmjs.com/package/hbs
const hbs = require("hbs");

const app = express();

// ℹ️ This function is getting exported from the config folder. It runs most pieces of middleware
require("./config")(app);

// default value for title local
const capitalize = require("./utils/capitalize");
const projectName = "server";

app.locals.appTitle = `${capitalize(projectName)} created with IronLauncher`;

app.use("./images", express.static("public/images"));
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true })); //this and the code directly above it gives us access to data from the req.body

// 👇 Start handling routes here
const indexRoutes = require("./routes/index.routes");
app.use("/", indexRoutes);

// AUthRouter
const authRouter = require("./controllers/authController");
app.use("/auth", authRouter);

// userController Route
const userController = require("./controllers/userController");
app.use("/user", userController);

// postController Route
const postController = require("./controllers/postController");
app.use("/post", postController);

// commentController Route
const commentController = require("./controllers/commentController");
app.use("/comment", commentController);

// commentController Route
const uploadController = require("./controllers/uploadController");
app.use("/upload", uploadController);

// ❗ To handle errors. Routes that don't exist or errors that you handle in specific routes
require("./error-handling")(app);

module.exports = app;
