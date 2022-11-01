const express = require("express");
const { protectAdmin } = require("../controllers/admin-controllers");
const { protectDoctor } = require("../controllers/doctor-controllers");
const {
  createRecord,
  getAllRecord,
  getRecord,
} = require("../controllers/record-controllers");

const router = express.Router();

router
  .route("/")
  .post(protectDoctor, createRecord)
  .get(protectAdmin, getAllRecord);

router.route("/:id").get(getRecord);

module.exports = router;
