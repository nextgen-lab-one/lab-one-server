const multer = require("multer");
const sharp = require("sharp");
const Doctor = require("../models/doctor-model");
const catchAsync = require("../utils/catch-async");
const sendEmail = require("../utils/email");
const ErrorObject = require("../utils/error");
const {
  signUp,
  getAll,
  getOne,
  deleteOne,
  updateOne,
  signIn,
  forgotPassword,
  resetPassword,
  updatePassword,
  protect,
  samePerson,
} = require("./generic-controllers");

const { ADMIN_EMAIL } = process.env;

exports.doctorSignUp = signUp(Doctor);

exports.getAllDoctors = getAll(Doctor);

exports.getDoctor = getOne(Doctor);

exports.deleteDoctor = deleteOne(Doctor);

exports.updateDoctor = updateOne(Doctor);

exports.doctorSignIn = signIn(Doctor);

exports.doctorForgotPassword = forgotPassword(Doctor);

exports.resetDoctorPassword = resetPassword(Doctor);

exports.updateDoctorPassword = updatePassword(Doctor);

exports.protectDoctor = protect(Doctor);

exports.sameDoctor = samePerson(Doctor);

const multerStorage = multer.memoryStorage();

const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image")) {
    cb(null, true);
  } else {
    return "Please upload only an image file";
  }
};

const uploadCertificate = multer({
  storage: multerStorage,
  fileFilter: multerFilter,
});

exports.uploadDoctorsCertificate = uploadCertificate.single("certificate");

exports.certFormatter = catchAsync(async (req, res, next) => {
  if (req.file) {
    let timeStamp = Date.now();
    let id = req.params.id;
    const doctor = await Doctor.findById(id);
    if (!doctor) {
      return next(
        new ErrorObject(`There is no doctor with the ${req.params.id}`, 400)
      );
    }
    let certificate = `${doctor.lastName}-${timeStamp}.jpeg`;

    req.body.certificate = certificate;

    await sharp(req.file.buffer)
      .resize(320, 240)
      .toFormat("jpeg")
      .jpeg({ quality: 80 })
      .toFile(`public/doctor/certificates/${certificate}`);
  }
  next();
});

exports.completeProfile = catchAsync(async (req, res, next) => {
  // Upload required information and document
  const doctor = await Doctor.findById(req.params.id);
  if (!doctor) {
    return next(new ErrorObject("Doctor with the requested ID not found", 400));
  }

  const certificate =
    req.body.certificate === undefined
      ? doctor.certificate
      : req.body.certificate;
  const yearsOfExperience =
    req.body.yearsOfExperience === undefined
      ? doctor.yearsOfExperience
      : req.body.yearsOfExperience;
  const setAvailableTime =
    req.body.setAvailableTime === undefined
      ? doctor.setAvailableTime
      : req.body.setAvailableTime;

  const update = { certificate, yearsOfExperience, setAvailableTime };
  const updatedProfile = await Doctor.findByIdAndUpdate(req.params.id, update, {
    new: true,
  });

  // Send Mail to the admin with a url that gets the particular doctor

  try {
    await sendEmail({
      email: ADMIN_EMAIL,
      subject: "Certificate Upload Notification",
      message:
        `Certificate Uploaded from ${doctor.firstName} ${doctor.lastName} \n Email : ${doctor.email}` +
        "\n" +
        updatedProfile,
    });
    res.status(200).json({
      status: "success",
      updatedProfile,
      message: "message has been sent to your mail",
    });
  } catch (error) {
    res.status(400).json({
      message: "error sending your message to the mail",
    });
  }
});

exports.verifyDoctor = catchAsync(async (req, res, next) => {
  const doctor = await Doctor.findById(req.params.id);
  if (!doctor) {
    return next(new ErrorObject("Doctor with the requested ID not found", 400));
  }

  doctor.accessable = req.body.accessable;
  doctor.verified = true;

  await doctor.save();
  res.status(200).json({
    status: "success",
    doctor,
  });
});
