const express = require("express");
const {
  adminSignUp,
  adminSignIn,
  getAllAdmin,
  getAdmin,
  updateAdmin,
  adminForgotPassword,
  resetAdminPassword,
  updateAdminPassword,
  protectAdmin,
  sameAdmin,
} = require("../controllers/admin-controllers");
const { verifyDoctor } = require("../controllers/doctor-controllers");

const router = express.Router();

router.post("/signup", adminSignUp);

router.post("/signin", adminSignIn);

router.get("/", protectAdmin, getAllAdmin);

router
  .route("/:id")
  .get(protectAdmin, getAdmin)
  .patch(protectAdmin, sameAdmin, updateAdmin);

router.post("/forgot-password", adminForgotPassword);

router.patch("/reset-password/:token", resetAdminPassword);

router.patch("/update-password/:id", protectAdmin, updateAdminPassword);

router.patch("/verify-doctor/:id", protectAdmin, verifyDoctor);

module.exports = router;
