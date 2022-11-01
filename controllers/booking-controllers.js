const Booking = require("../models/booking-model");
const Doctor = require("../models/doctor-model");
const Patient = require("../models/patient-model");
const catchAsync = require("../utils/catch-async");
const sendEmail = require("../utils/email");
const ErrorObject = require("../utils/error");
const { getAll, getOne, updateOne } = require("./generic-controllers");

exports.getAllBooking = getAll(Booking);

exports.getBooking = getOne(Booking);

exports.updateBooking = updateOne(Booking);

exports.createBooking = catchAsync(async (req, res, next) => {
  const { meetingTime, doctorId } = req.body;
  const patientId = req.user.id;
  const doctor = await Doctor.findOne({ _id: doctorId });

  if (!doctor.accessable.includes(req.user.plan)) {
    return next(
      new ErrorObject(
        "You are not authorised to book this doctor based on your plan.",
        403
      )
    );
  }

  const review = await Booking.create({
    patientId,
    doctorId,
    meetingTime,
  });

  const message = `You have been booked for a meeting by ${meetingTime}`;
  try {
    await sendEmail({
      email: doctor.email,
      subject: `You have been booked for a meeting`,
      message,
    });
    res.status(200).json({
      status: "success",
      review,
      message: "message has been sent to your mail",
    });
  } catch (error) {
    res.status(400).json({
      message: "error sending your message to the mail",
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
  if (Date.now() < booking.meetingTime) {
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
