const Patient = require("../models/patient-model");
const catchAsync = require("../utils/catch-async");
const sendEmail = require("../utils/email");
const ErrorObject = require("../utils/error");
const chargeCard = require("../utils/payment");
const {
  signUp,
  signIn,
  getAll,
  getOne,
  updateOne,
  deleteOne,
  forgotPassword,
  resetPassword,
  updatePassword,
  protect,
  samePerson,
} = require("./generic-controllers");

exports.patientSignUp = signUp(Patient);

exports.patientSignIn = signIn(Patient);

exports.getAllPatient = getAll(Patient);

exports.getPatient = getOne(Patient);

exports.updatePatient = updateOne(Patient);

exports.deletePatient = deleteOne(Patient);

exports.patientForgotPassword = forgotPassword(Patient);

exports.resetPatientPassword = resetPassword(Patient);

exports.updatePatientPassword = updatePassword(Patient);

exports.protectPatient = protect(Patient);

exports.samePatient = samePerson(Patient);

exports.planSubscribtion = catchAsync(async (req, res, next) => {
  if (!req.user.profileCompleted) {
    return next(
      new ErrorObject(
        "You've not completed your profile, please do before subscribing",
        400
      )
    );
  }
  let request = req.body;
  let users = req.user;
  const payment = await chargeCard(request, users);

  if (payment.status !== "success") {
    return next(new ErrorObject("Error processing payment", 400));
  }
  const user = await Patient.findById(req.user.id);
  user.plan = req.body.plan;
  user.planExpires = new Date(Date.now() + 30 * 60 * 60 * 24 * 1000);
  await user.save();
  const date = `${user.planExpires.getFullYear()}/${
    user.planExpires.getMonth() + 1
  }/${user.planExpires.getDate()}`;
  const time = `${user.planExpires.getHours()}:${user.planExpires.getMinutes()}`;
  const message = `You have successfully subscribe for the ${user.plan} plan for a
  fee of ${req.body.amount}. Your plan would be expiring on ${date} at ${time}
  `;
  try {
    await sendEmail({
      email: user.email,
      subject: `You have successfully subscribe for the ${user.plan} plan`,
      message,
    });
    res.status(200).json({
      status: "success",
      payment,
      message: "message has been sent to your mail",
    });
  } catch (error) {
    res.status(400).json({
      message: "error sending your message to the mail",
    });
  }
});

exports.isProfileCompleted = catchAsync(async (req, res, next) => {
  const patient = req.user;
  if (!patient.sex || !patient.age || !patient.occupation) {
    return next(new ErrorObject("Please kindly complete your profile", 400));
  }
  const user = await Patient.findById(patient.id);
  user.profileCompleted = true;
  await user.save();
  req.user = user;

  next();
});

exports.isPlanStillOn = catchAsync(async (req, res, next) => {
  if (req.user.plan === "none") {
    return next(new ErrorObject("Please subscribe for a plan", 400));
  }
  const hasExpired = Date.now() > req.user.planExpires;
  if (hasExpired) {
    const user = await Patient.findById(req.user.id);
    (user.plan = "none"), (user.planExpires = undefined);
    user.save();
    return next(
      new ErrorObject(
        "Please subscribe for a new plan, your previous plan has expired",
        400
      )
    );
  }
  next();
});
