import { Router } from "express";
import {
  allPayments,
  buySubscription,
  cancelSubscription,
  getRazorpayApiKey,
  verifySubscription,
} from "../controllers/paymentController.js";
import {
  authorizedRoles,
  authorizedSubscriber,
  isLoggedIn,
} from "../middleware/auth.middleware.js";

const router = Router();

router.route("/razorpay-key").get(isLoggedIn, getRazorpayApiKey);
router
  .route("/subscribe")
  .post(isLoggedIn, authorizedRoles("USER"), buySubscription);
router.route("/verify").post(isLoggedIn, verifySubscription);
router
  .route("/unSubscribe")
  .post(isLoggedIn, authorizedSubscriber, cancelSubscription);

router.route("/").get(isLoggedIn, authorizedRoles("ADMIN"), allPayments);

export default router;
