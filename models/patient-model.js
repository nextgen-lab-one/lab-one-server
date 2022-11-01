const { default: mongoose } = require("mongoose");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const User = require("../utils/user");

const patient = {
  location: {
    type: String,
    required: true,
  },
  occupation: {
    type: String,
  },
  description: {
    type: String,
  },
  role: {
    type: String,
    default: "patient",
  },
  plan: {
    type: String,
    enum: ["none", "basic", "standard", "premium"],
    default: "none",
  },
  planExpires: {
    type: Date,
  },
  profileCompleted: {
    type: Boolean,
    default: false,
  },
  age: Number,
  sex: {
    type: String,
    enum: ["male", "female"],
  },
};

const patientSchema = new mongoose.Schema(
  {
    ...User,
    ...patient,
  },
  {
    timeStamps: true,
    toObject: {
      virtuals: true,
    },
    toJSON: {
      virtuals: true,
    },
  }
);

patientSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  let salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  this.passwordConfirm = undefined;
  next();
});

patientSchema.methods.createPasswordResetToken = function () {
  const resetToken = crypto.randomBytes(32).toString("hex");

  this.passwordResetToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");
  this.passwordTokenExpires = Date.now() + 10 * 60 * 1000;
  return resetToken;
};

patientSchema.methods.changePasswordAfter = function (JWTTimestamp) {
  if (this.passwordChangedAt) {
    console.log(JWTTimestamp < this.passwordChangedAt);
    return JWTTimestamp < this.passwordChangedAt;
  }
  return false;
};

const Patient = mongoose.model("Patient", patientSchema);

module.exports = Patient;
