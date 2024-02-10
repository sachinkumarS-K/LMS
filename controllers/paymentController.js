import { razorpay } from "../app.js";
import USER from "../model/userModel.js";
import AppError from "../utils/error.utils.js";
import crypto from "crypto";
import Payment from "../model/paymentModel.js";
const getRazorpayApiKey = async (req, res, next) => {
  try {
    return res.status(200).json({
      success: true,
      message: "RazorPay Api Key",
      key: process.env.RAZORPAY_KEY_ID,
    });
  } catch (error) {
    return next(new AppError(error.message, 500));
  }
};

const buySubscription = async (req, res, next) => {
  try {
    const { id } = req.user;

    // Assuming USER is your Mongoose model
    const user = await USER.findById(id);

    if (!user) {
      return next(new AppError("Unauthorized, please login!", 401));
    }

    if (user.role === "ADMIN") {
      return next(new AppError("Admin cannot purchase a subscription!", 403));
    }

    // Assuming you have set up Razorpay properly
    const subscription = await razorpay.subscriptions.create({
      plan_id: process.env.RAZORPAY_PLAN_ID,
      customer_notify: 1,
      total_count: 12,
    });

    (user.subscription.id = subscription.id), await user.save();

    return res.status(200).json({
      success: true,
      message: "Subscribed Successfully",
      subscription_id: subscription.id,
    });
  } catch (error) {
    console.error(error);
    return next(new AppError("Internal Server Error", 500));
  }
};

const verifySubscription = async (req, res, next) => {
  try {
    const { id } = req.user;
    const {
      razorpay_payment_id,
      razorpay_signature,
      razorpay_subscription_id,
    } = req.body;
    const user = await USER.findById(id);
    const subscriptionId = user.subscription.id;

    const generatedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_SECRET)
      .update(`${razorpay_payment_id}|${subscriptionId}`)
      .digest("hex");

    if (generatedSignature !== razorpay_signature) {
      return next(
        new AppError("Payment not verified , Please try again ", 500)
      );
    }
    await Payment.create({
      razorpay_payment_id,
      razorpay_signature,
      razorpay_subscription_id,
    });

    user.subscription.status = "ACTIVE";
    await user.save();

    return res.status(200).json({
      success: true,
      message: "Payment Created and verified Successfully",
      user,
    });
  } catch (error) {
    return next(new AppError(error.message, 500));
  }
};
const cancelSubscription = async (req, res, next) => {
  try {
    // Extract user ID from the request
    const id = req.user.id;
    const user = await USER.findById(id);
    const subscriptionId = user.subscription.id;

    const subscription = await razorpay.subscriptions.cancel(subscriptionId);

    user.subscription.status = subscription.status;
    await user.save();

    res
      .status(200)
      .json({ success: true, message: "Subscription canceled successfully" });
  } catch (error) {
    // Handle errors and pass them to the next middleware
    return next(new AppError(error.message, 500));
  }
};

const allPayments = async (req, res, next) => {
  try {
    const { count } = req.query;
    const subscriptions = await razorpay.subscriptions.all({
      count: count || 10,
    });
    // console.log(subscriptions);
    return res.status(200).json({
      message: "All payments",
      subscriptions,
    });
  } catch (error) {
    return next(new AppError(error.message, 500));
  }
};

export {
  allPayments,
  verifySubscription,
  cancelSubscription,
  buySubscription,
  getRazorpayApiKey,
};
