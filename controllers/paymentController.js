import { razorpay } from "../app.js";
import USER from "../model/userModel.js";
import AppError from "../utils/error.utils.js"
import crypto from 'crypto'
import Payment from '../model/paymentModel.js'
const getRazorpayApiKey = async (req, res, next) => {
     try {     
          return res.status(200).json({
               success: true,
               message: "RazorPay Api Key",
               key: process.env.RAZORPAY_KEY_ID
          })
     } catch (error) {
          return next(new AppError(error.message, 500));
     }
}
const buySubscription = async (req, res, next) => {
     try {
          const { id } = req.user;
          const user = await USER.findById( id );
          if (!user) {
               return next(new AppError('Unauthorized please login !!', 500));
          }
          if (user.role === 'ADMIN') {
                return next(new AppError("ADMIN connot purchase a subscription !!", 500));
          }

          const subscription = razorpay.subscriptions.create({
               plan_id: process.env.RAZORPAY_PLAN_ID,
               customer_notify: 1
          });

          user.subscription.id = subscription.id;
          user.subscription.status = subscription.status;

          await USER.save();

          return res.status(200).json({
               success: true,
               message: "Subscribed Successfully",
               subscription_id : subscription.id
          })
     } catch (error) {
            return next(new AppError(error.message, 500));
     }
}
const verifySubscription = async (req, res, next) => {
     try {
          const { id } = req.user;
          const { razorpay_payment_id, razorpay_signature, razorpay_subscription_id } = req.body;
          const user = await USER.findById(id);
          const subscriptionId = user.subscription.id;
          const generatedSignature = crypto
               .createHmac('sha256', process.env.RAZORPAY_SECRET)
               .update(`${razorpay_payment_id}|${subscriptionId}`)
               .digest('hex');
          
          if (generatedSignature !== razorpay_signature) {
                return next(new AppError("Payment not verified , Please try again ", 500));
          }
          await Payment.create({
               razorpay_payment_id,
               razorpay_signature,
               razorpay_subscription_id
          });

          user.subscription.status = 'active';
          await user.save();
          return res.status(200).json({
               success: true,
               message: "Payment Created and verified Successfully"
          });

     } catch (error) {
            return next(new AppError(error.message, 500));
     }
}
const cancelSubscription = async (req, res, next) => {
     try {
          const id = req.user.id;
          const user = await USER.findById(id);
          const subscriptionId = user.subscription.id;
          const subscription = razorpay.subscriptions.cancel(subscriptionId);
          user.subscription.status = subscription.status;
          await user.save()

     } catch (error) {
            return next(new AppError(error.message, 500));
     }
}
const allPayments = async (req, res, next) => {
     try {
          const { count } = req.query;
          const subscriptions = await razorpay.subscriptions.all({
               count: count || 10
          });
          console.log(subscriptions)
          return res.status(200).json({
               message: "All payments",
               subscriptions
         })
     } catch (error) {
            return next(new AppError(error.message, 500));
     }
}

export {allPayments,verifySubscription,cancelSubscription,buySubscription,getRazorpayApiKey}
