const Booking = require("../models/booking-model");
const Doctor = require("../models/doctor-model");
const Patient = require("../models/patient-model");
const catchAsync = require("../utils/catch-async");
const sendEmail = require("../utils/email");
const ErrorObject = require("../utils/error");
const meetLinkSender = require("../utils/google-calender/calender");
const { getAll, getOne, updateOne } = require("./generic-controllers");

exports.getAllBooking = getAll(Booking);

exports.getBooking = getOne(Booking);

exports.updateBooking = updateOne(Booking);

exports.createBooking = catchAsync(async (req, res, next) => {
  const { doctorId, startTime, endTime } = req.body;
  const patientId = req.user.id;
  const doctor = await Doctor.findById(doctorId);
  const patient = await Patient.findById(patientId);

  if (!doctor.accessable.includes(req.user.plan)) {
    return next(
      new ErrorObject(
        "You are not authorised to book this doctor based on your plan.",
        403
      )
    );
  }

  const booking = await Booking.create({
    patientId,
    doctorId,
    startTime,
    endTime,
  });

  const message = `You have been booked for a meeting by ${startTime}`;
  let emails = [{ email: doctor.email }, { email: patient.email }];

  try {
    await meetLinkSender(emails, req.body.startTime, req.body.endTime, next);
    return res.status(200).json({
      status: "success",
      booking,
      message: "booking has been created",
    });
  } catch (error) {
    res.status(400).json({
      message: "error sending the link to the mail",
    });
  }
});

exports.isBookingCompleted = catchAsync(async (req, res, next) => {
  const booking = await Booking.findById(req.params.id);
  if (booking.patientId.toString() !== req.user.id) {
    return next(
      new ErrorObject("You are not authorised to perform this action", 403)
    );
  }
  if (Date.now() < booking.endTime) {
    return next(new ErrorObject("The meeting is not yet over", 400));
  }
  booking.meetingCompleted = true;
  booking.save();
  res.status(200).json({
    status: "success",
    message: "meeting completed",
    booking,
  });
});
