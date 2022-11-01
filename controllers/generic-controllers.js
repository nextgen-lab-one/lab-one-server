const QueryMethod = require("../utils/query");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const CatchAsync = require("../utils/catch-async");
const ErrorObject = require("../utils/error");
const sendEmail = require("../utils/email");

const { JWT_COOKIE_EXPIRES_IN, JWT_EXPIRES_IN, JWT_SECRET, NODE_ENV } =
  process.env;

const signToken = (id) => {
  return jwt.sign({ id }, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN,
  });
};

const createAndSendToken = CatchAsync(async (user, statusCode, res) => {
  const token = await signToken(user._id);
  const cookieOptions = {
    expires: new Date(Date.now() + JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000),
    httpOnly: true,
  };
  if (NODE_ENV === "production") cookieOptions.secure = true;
  res.cookie("jwt", token, cookieOptions);

  user.password = undefined;
  res.status(statusCode).json({
    status: "success",
    token,
    data: {
      user,
    },
  });
});

exports.signUp = (Model) =>
  CatchAsync(async (req, res, next) => {
    const {
      email,
      firstName,
      password,
      passwordConfirm,
      address,
      location,
      userName,
      lastName,
    } = req.body;
    const user = await Model.create({
      email,
      firstName,
      password,
      passwordConfirm,
      address,
      location,
      userName,
      lastName,
    });

    createAndSendToken(user, 201, res);
  });

exports.signIn = (Model) =>
  CatchAsync(async (req, res, next) => {
    const { email, password } = req.body;
    if (!email || !password) {
      return next(new ErrorObject("Please enter your email and password", 400));
    }
    const user = await Model.findOne({ email }).select("+password");
    const confirmPassword = await bcrypt.compare(password, user.password);
    if (!confirmPassword || !user) {
      return next(new ErrorObject("Invalid email or password", 401));
    }

    createAndSendToken(user, 200, res);
  });

exports.deleteOne = (Model) =>
  CatchAsync(async (req, res, next) => {
    const doc = await Model.findByIdAndDelete(req.params.id, {
      strict: true,
    });
    if (!doc)
      return next(
        new ErrorObject(`Document with the id ${req.params.id} not found`, 404)
      );
    res.status(204).json({
      status: "deleted",
      data: null,
    });
  });

exports.samePerson = (Model) =>
  CatchAsync(async (req, res, next) => {
    if (req.user.id !== req.params.id) {
      return next(
        new ErrorObject(`You're not authorised to perform this action`, 403)
      );
    }
    next();
  });

exports.updateOne = (Model) =>
  CatchAsync(async (req, res, next) => {
    if (req.body.password) {
      return next(new ErrorObject("You can't update password here", 400));
    }
    const updatedData = await Model.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!updatedData)
      return next(
        new ErrorObject(`Document with the id ${req.params.id} not found`, 404)
      );
    res.status(200).json({
      status: "success",
      data: {
        data: updatedData,
      },
    });
  });

exports.createOne = (Model) =>
  CatchAsync(async (req, res, next) => {
    const doc = await Model.create(req.body);

    res.status(201).json({
      status: "success",
      data: {
        data: doc,
      },
    });
  });

exports.getOne = (Model) =>
  CatchAsync(async (req, res, next) => {
    const doc = await Model.findById(req.params.id);

    if (!doc)
      return next(
        new ErrorObject(`Document with the id ${req.params.id} not found`, 404)
      );

    res.status(200).json({
      status: "success",
      data: doc,
    });
  });

exports.getAll = (Model) =>
  CatchAsync(async (req, res) => {
    let filter = req.params.tourId ? { tourRef: req.params.tourId } : {};
    const features = new QueryMethod(Model.find(filter), req.query)
      .sort()
      .limit()
      .paginate()
      .filter();

    const docs = await features.query;
    res.status(200).json({
      status: "success",
      results: docs.length,

      data: docs,
    });
  });

// Authentication
exports.protect = (Model) =>
  CatchAsync(async (req, res, next) => {
    let token;
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];
    }
    if (!token) {
      return next(
        new ErrorObject("You are not logged in. Kindly log in.", 401)
      );
    }
    const decodedToken = await jwt.verify(token, JWT_SECRET);

    const currentUser = await Model.findById(decodedToken.id);

    if (!currentUser) {
      return next(new ErrorObject("You are not authorized", 403));
    }

    req.user = currentUser;
    next();
  });

// Authorization
exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new ErrorObject("You are not authorised to perform this action.", 403)
      );
    }
    next();
  };
};

exports.forgotPassword = (Model) =>
  CatchAsync(async (req, res, next) => {
    // 1. Get User based on email provided
    const user = await Model.findOne({ email: req.body.email });
    if (!user) {
      return next(
        new ErrorObject("There is no user with the provided email address", 404)
      );
    }
    // 2. Generate random reset token
    const resetToken = user.createPasswordResetToken();
    await user.save({ validateBeforeSave: false });

    // 3. Send token to the email addess
    const resetUrl = `${req.protocol}://${req.get(
      "host"
    )}/api/v1/users/reset-password/${resetToken}`;

    const message = `To reset your password click on the link below to submit your new password: ${resetUrl}`;

    try {
      await sendEmail({
        message,
        email: user.email,
        subject: "Your password reset url. It's valid for 10mins",
      });

      res.status(200).json({
        status: "success",
        message: "Token has been sent to your mail",
      });
    } catch (err) {
      user.passwordResetToken = undefined;
      user.passwordTokenExpires = undefined;
      await user.save();
      next(new ErrorObject("Error while sending the token to your mail", 500));
    }
  });

exports.resetPassword = (Model) =>
  CatchAsync(async (req, res, next) => {
    const hashToken = crypto
      .createHash("sha256")
      .update(req.params.token)
      .digest("hex");
    const user = await Model.findOne({
      passwordResetToken: hashToken,
      passwordTokenExpires: { $gt: Date.now() },
    });
    if (!user) {
      return next(new ErrorObject("Token is invalid or it has expired", 400));
    }

    user.password = req.body.password;
    user.passwordConfirm = req.body.passwordConfirm;
    user.passwordResetToken = undefined;
    user.passwordTokenExpires = undefined;
    user.passwordChangedAt = Date.now() - 1000;
    await user.save();

    createAndSendToken(user, 200, res);
  });

exports.updatePassword = (Model) =>
  CatchAsync(async (req, res, next) => {
    const user = await Model.findById(req.user.id).select("+password");
    const { newPassword, newPasswordConfirm } = req.body;
    if (!(await bcrypt.compare(req.body.password, user.password))) {
      return next(new ErrorObject("Your password is incorrect", 401));
    }

    user.password = newPassword;
    user.passwordConfirm = newPasswordConfirm;
    await user.save();

    createAndSendToken(user, 200, res);
  });
