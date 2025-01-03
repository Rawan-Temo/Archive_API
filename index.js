require("dotenv").config();
const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const helmet = require("helmet"); // For security enhancements
const app = express();
const port = process.env.PORT || 8000;
const path = require("path");

// Import routers
//ADDRESS ROUTES
const countryRouter = require("./routes/Address/contryRouter.js");
const governmentRouter = require("./routes/Address/governmentRouter.js");
const cityRouter = require("./routes/Address/cityRouter.js");
const streetRouter = require("./routes/Address/streetRouter.js");
const regionRouter = require("./routes/Address/regionRouter.js");
const villageRouter = require("./routes/Address/villageRouter.js");
//ADDRESS ROUTES
//DETAILS ROUTES

const sourceRouter = require("./routes/details/sourceRouter.js");
const eventRouter = require("./routes/details/eventRouter.js");
const partyRouter = require("./routes/details/partyRouter.js");
const sectionRouter = require("./routes/details/sectionRouter.js");

//DETAILS ROUTES
//INFORMATION ROUTES

const personRouter = require("./routes/information/personRouter.js");
const securityInformationRouter = require("./routes/information/securityInformationRouter.js");

//INFORMATION ROUTES
//MEDIA ROUTES
const imageRouter = require("./routes/media/imageRouter.js");
const videoRouter = require("./routes/media/videoRouter.js");
const audioRouter = require("./routes/media/audioRouter.js");
const documentRouter = require("./routes/media/documentRouter.js");

//MEDIA ROUTES

// Import and initialize database connection
const connection = require("./db.js");
connection();

// Middleware

app.use(express.json()); // Built-in JSON parser
app.use(cors());
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}
app.use(helmet()); // Security middleware
app.use(express.static(path.join(__dirname, "public")));
// API Routes

//ADDRESS

app.use("/api/Countries", countryRouter);
app.use("/api/Governments", governmentRouter);
app.use("/api/Cities", cityRouter);
app.use("/api/Streets", streetRouter);
app.use("/api/Regions", regionRouter);
app.use("/api/Villages", villageRouter);

//ADDRESS

//DETAILS

app.use("/api/Sources", sourceRouter);
app.use("/api/Events", eventRouter);
app.use("/api/Parties", partyRouter);
app.use("/api/Sections", sectionRouter);

//DETAILS

//IFORMATION

app.use("/api/People", personRouter);
app.use("/api/Information", securityInformationRouter);

//IFORMATION

//MEDIA
app.use("/api/media/images", imageRouter);
app.use("/api/media/videos", videoRouter);
app.use("/api/media/audios", audioRouter);
app.use("/api/media/documents", documentRouter);

//MEDIA

// API Routes Ends
// 404 Handler
app.use((req, res, next) => {
  res.status(404).json({ status: "fail", message: "Route not found" });
});

// Global Error Handling Middleware
app.use((err, req, res, next) => {
  console.error(err.stack);

  res.status(500).json({ status: "error", message: "Something went wrong" });
});

// Start the server
app.listen(port, () => {
  console.log("Listening on port:", port);
});
