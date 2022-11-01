const Admin = require("../models/admin-model");
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

exports.adminSignUp = signUp(Admin);

exports.adminSignIn = signIn(Admin);

exports.getAllAdmin = getAll(Admin);

exports.getAdmin = getOne(Admin);

exports.updateAdmin = updateOne(Admin);

exports.deleteAdmin = deleteOne(Admin);

exports.adminForgotPassword = forgotPassword(Admin);

exports.resetAdminPassword = resetPassword(Admin);

exports.updateAdminPassword = updatePassword(Admin);

exports.protectAdmin = protect(Admin);

exports.sameAdmin = samePerson(Admin);
