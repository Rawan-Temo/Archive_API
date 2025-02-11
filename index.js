require("dotenv").config();
const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const helmet = require("helmet"); // For security enhancements
const app = express();
const port = process.env.PORT || 8000;
const path = require("path");
const rateLimit = require("express-rate-limit");
const mongoSanitize = require("express-mongo-sanitize");
const xss = require("xss-clean");
// Import and initialize database connection
const connection = require("./db.js");
connection();
// Initialize task scheduler
require("./utils/taskScheduler");

// Middleware

app.use(express.json()); // Built-in JSON parser
app.use(express.urlencoded({ extended: true }));
app.use(cors());
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}
app.use(express.static(path.join(__dirname, "public")));

app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'", "trusted-cdn.com"],
        styleSrc: ["'self'", "trusted-cdn.com"],
        imgSrc: ["'self'", "data:", "trusted-cdn.com"],
      },
    },
  })
);

// Rate limiting to prevent abuse
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per window
  message: "Too many requests, please try again later.",
});
app.use("/api", apiLimiter);
const authLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 5,
  message: "Too many login attempts, please try again later.",
});
app.use("/api/Users/login", authLimiter);
// Data sanitization against NoSQL injection
app.use(mongoSanitize());
// Data sanitization against XSS attacks
app.use(xss());

// API Routes

// Dynamically import routers
const routers = {
  "/api/Countries": "./routes/Address/contryRouter.js",
  "/api/Governments": "./routes/Address/governmentRouter.js",
  "/api/Cities": "./routes/Address/cityRouter.js",
  "/api/Streets": "./routes/Address/streetRouter.js",
  "/api/Regions": "./routes/Address/regionRouter.js",
  "/api/Villages": "./routes/Address/villageRouter.js",
  "/api/Sources": "./routes/details/sourceRouter.js",
  "/api/Events": "./routes/details/eventRouter.js",
  "/api/Parties": "./routes/details/partyRouter.js",
  "/api/Sections": "./routes/details/sectionRouter.js",
  "/api/People": "./routes/information/personRouter.js",
  "/api/Information": "./routes/information/informationRouter.js",
  "/api/Coordinates": "./routes/information/coordinatesRouter.js",
  "/api/media/images": "./routes/media/imageRouter.js",
  "/api/media/videos": "./routes/media/videoRouter.js",
  "/api/media/audios": "./routes/media/audioRouter.js",
  "/api/media/documents": "./routes/media/documentRouter.js",
  "/api/Users": "./routes/login/userRouter.js",
  "/api/backup": "./routes/backUp/backupRouter.js",
};

for (const [route, routerPath] of Object.entries(routers)) {
  try {
    const router = require(routerPath);
    if (router) app.use(route, router);
  } catch (err) {
    console.warn(`Skipping ${routerPath}: ${err.message}`);
  }
}
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
