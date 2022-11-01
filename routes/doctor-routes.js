const express = require("express");
const {
  doctorSignUp,
  doctorSignIn,
  getAllDoctors,
  getDoctor,
  updateDoctor,
  deleteDoctor,
  doctorForgotPassword,
  resetDoctorPassword,
  updateDoctorPassword,
  protectDoctor,
  sameDoctor,
  completeProfile,
  uploadDoctorsCertificate,
  certFormatter,
} = require("../controllers/doctor-controllers");

const router = express.Router();

router.post("/signup", doctorSignUp);

router.post("/signin", doctorSignIn);

router.get("/", getAllDoctors);

router
  .route("/:id")
  .get(getDoctor)
  .patch(protectDoctor, sameDoctor, updateDoctor)
  .delete(protectDoctor, sameDoctor, deleteDoctor);

router.post("/forgot-password", doctorForgotPassword);

router.patch("/reset-password/:token", resetDoctorPassword);

router.patch("/update-password/:id", protectDoctor, updateDoctorPassword);

router.patch(
  "/complete-profile/:id",
  protectDoctor,
  sameDoctor,
  uploadDoctorsCertificate,
  certFormatter,
  completeProfile
);

module.exports = router;
