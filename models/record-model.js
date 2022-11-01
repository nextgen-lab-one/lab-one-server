const mongoose = require("mongoose");

const recordSchema = new mongoose.Schema(
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
    comment: {
      type: String,
      required: [true, "A comment is required"],
    },
    prescription: {
      type: String,
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

const Record = mongoose.model("Record", recordSchema);

module.exports = Record;
