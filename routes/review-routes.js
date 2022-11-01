const express = require("express");
const { protectPatient } = require("../controllers/patient-controllers");
const {
  getAllReview,
  createReview,
  getReview,
  updateReview,
} = require("../controllers/review-controllers");

const router = express.Router();

router.route("/").get(getAllReview).post(protectPatient, createReview);
router.route("/:id").get(getReview).patch(protectPatient, updateReview);

module.exports = router;
