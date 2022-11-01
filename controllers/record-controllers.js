const Booking = require("../models/booking-model");
const Record = require("../models/record-model");
const catchAsync = require("../utils/catch-async");
const ErrorObject = require("../utils/error");
const { getAll, getOne } = require("./generic-controllers");

exports.createRecord = catchAsync(async (req, res, next) => {
  const { patientId, comment, prescription, bookingId } = req.body;
  const doctorId = req.user.id;
  const booking = await Booking.findById(bookingId);
  if (
    booking.patientId.toString() !== patientId ||
    booking.doctorId.toString() !== doctorId
  ) {
    return next(
      new ErrorObject("You are not authorised to perform this action", 403)
    );
  }
  const record = await Record.create({
    bookingId,
    comment,
    patientId,
    doctorId,
    prescription,
  });

  res.status(201).json({
    status: "success",
    record,
  });
});

exports.getAllRecord = getAll(Record);

exports.getRecord = getOne(Record);
