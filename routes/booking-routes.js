const express = require("express");
const { protectAdmin } = require("../controllers/admin-controllers");
const {
  getAllBooking,
  createBooking,
  getBooking,
  isBookingCompleted,
} = require("../controllers/booking-controllers");
const {
  protectPatient,
  samePatient,
} = require("../controllers/patient-controllers");

const router = express.Router();

router
  .route("/")
  .get(protectAdmin, getAllBooking)
  .post(protectPatient, createBooking);
router.route("/:id").get(getBooking).patch(protectPatient, isBookingCompleted);

module.exports = router;
