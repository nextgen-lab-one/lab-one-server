const Flutterwave = require("flutterwave-node-v3");
const { FLW_ENCRYPTION_KEY, FLW_PUBLIC_KEY, FLW_SECRET_KEY } = process.env;

const flw = new Flutterwave(FLW_PUBLIC_KEY, FLW_SECRET_KEY);

// Initiating the transaction

const chargeCard = async (req, user) => {
  try {
    const payload = {
      card_number: req.card_number,
      cvv: req.cvv,
      expiry_month: req.expiry_month,
      expiry_year: req.expiry_year,
      currency: "NGN",
      amount: req.amount,
      fullname: `${user.lastName} ${user.firstName}`,
      email: user.email,
      phone_number: req.phone_number,
      enckey: FLW_ENCRYPTION_KEY,
      tx_ref: `${user.lastName}-${Date.now()}-${req.amount}`,
    };

    const response = await flw.Charge.card(payload);
    // Authorizing transactions
    // For PIN transactions
    if (response.meta.authorization.mode === "pin") {
      let payload2 = payload;
      payload2.authorization = {
        mode: "pin",
        fields: ["pin"],
        pin: req.pin,
      };
      const reCallCharge = await flw.Charge.card(payload2);

      // Add the OTP to authorize the transaction
      const callValidate = await flw.Charge.validate({
        otp: "12345",
        flw_ref: reCallCharge.data.flw_ref,
      });
    }
    return response;
  } catch (error) {
    return error;
  }
};

module.exports = chargeCard;
