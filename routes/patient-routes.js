const express = require("express");
const { protectAdmin } = require("../controllers/admin-controllers");
const {
  patientSignUp,
  patientSignIn,
  getAllPatient,
  getPatient,
  updatePatient,
  deletePatient,
  patientForgotPassword,
  resetPatientPassword,
  updatePatientPassword,
  protectPatient,
  planSubscribtion,
  samePatient,
  isProfileCompleted,
} = require("../controllers/patient-controllers");

const router = express.Router();

router.post("/signup", patientSignUp);

router.post("/signin", patientSignIn);

router.get("/", protectAdmin, getAllPatient);

router
  .route("/:id")
  .get(protectPatient, samePatient, getPatient)
  .patch(protectPatient, samePatient, updatePatient)
  .delete(protectPatient, samePatient, deletePatient);

router.post("/forgot-password", patientForgotPassword);

router.patch("/reset-password/:token", resetPatientPassword);

router.patch("/update-password/:id", protectPatient, updatePatientPassword);

router.post("/subscribe", protectPatient, isProfileCompleted, planSubscribtion);

module.exports = router;
