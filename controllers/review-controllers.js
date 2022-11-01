const Booking = require("../models/booking-model");
const Review = require("../models/review-model");
const catchAsync = require("../utils/catch-async");
const ErrorObject = require("../utils/error");
const { getAll, getOne } = require("./generic-controllers");

exports.getAllReview = getAll(Review);

exports.getReview = getOne(Review);

exports.createReview = catchAsync(async (req, res, next) => {
  const { message, doctorId, ratings, bookingId } = req.body;
  const patientId = req.user.id;
  const booking = await Booking.findById(bookingId);
  if (!booking.meetingCompleted) {
    return next(new ErrorObject("Booking can't be reviewed now", 400));
  }
  const review = await Review.create({
    bookingId,
    message,
    patientId,
    doctorId,
    ratings,
  });

  res.status(201).json({
    status: "success",
    review,
  });
});

exports.updateReview = catchAsync(async (req, res, next) => {
  const review = await Review.findById(req.params.id);
  if (req.user.id !== review.patientId.toString()) {
    return next(new ErrorObject("You are not authorised to perform this", 403));
  }
  const update = { ...req.body, updatedAt: Date.now() };
  const updatedReview = await Review.findByIdAndUpdate(req.params.id, update, {
    new: true,
    runValidators: true,
  });
  if (!updatedReview)
    return next(
      new ErrorObject(`Document with the id ${req.params.id} not found`, 404)
    );
  res.status(200).json({
    status: "success",
    updatedReview,
  });
});
