const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema(
  {
    bookingId: {
      type: mongoose.Schema.ObjectId,
      ref: "Booking",
      required: [true, "A booking Id is required"],
    },
    doctorId: {
      type: mongoose.Schema.ObjectId,
      ref: "Doctor",
      required: [true, "A doctor Id is required"],
    },
    patientId: {
      type: mongoose.Schema.ObjectId,
      ref: "Patient",
      required: [true, "A patient Id is required"],
    },
    message: {
      type: String,
      required: [true, "A message is required"],
    },
    ratings: {
      type: Number,
      min: [1, "ratings can't be lower than 1"],
      max: [5, "ratings can't be higher than 5"],
    },
    createdAt: {
      type: Date,
      default: Date.now(),
    },
    updatedAt: Date,
  },
  {
    toObject: {
      virtuals: true,
    },
    toJSON: {
      virtuals: true,
    },
  }
);

const Review = mongoose.model("Review", reviewSchema);

module.exports = Review;
