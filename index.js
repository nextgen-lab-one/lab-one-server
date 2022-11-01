const express = require("express");
const morgan = require("morgan");
const fs = require("fs");
const path = require("path");
const doctorRoutes = require("./routes/doctor-routes");
const patientRoutes = require("./routes/patient-routes");
const adminRoutes = require("./routes/admin-routes");
const bookingRouter = require("./routes/booking-routes");
const recordRouter = require("./routes/record-routes");
const reviewRouter = require("./routes/review-routes");
const ErrorHandler = require("./controllers/error-controllers");
const ErrorObject = require("./utils/error");
const { PORT } = process.env;

const app = express();

const accessLogStream = fs.createWriteStream(
  path.join(__dirname, "access.log"),
  { flags: "a" }
);

// Middlewares

// body parser
app.use(express.json());

// Using Static files
app.use(express.static(`${__dirname}/public`));

// setup the logger
app.use(morgan("combined", { stream: accessLogStream }));

// Routes
app.use("/api/v1/doctors", doctorRoutes);
app.use("/api/v1/patients", patientRoutes);
app.use("/api/v1/admins", adminRoutes);
app.use("/api/v1/bookings", bookingRouter);
app.use("/api/v1/reviews", reviewRouter);
app.use("/api/v1/records", recordRouter);
app.all("*", (req, res, next) => {
  const err = new ErrorObject(
    `http://localhost:${PORT}${req.url} not found`,
    404
  );
  next(err);
});

// Error Handling
app.use(ErrorHandler);

module.exports = app;
