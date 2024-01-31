import express from "express";
import dbConnect from "./config/db.js";
import cors from "cors";
import cookieParser from "cookie-parser";
import morgan from "morgan";
import userRoutes from "./routes/userRoutes.js";
import couseRoutes from "./routes/courseRoutes.js";
import miscellaneousRoute from "./routes/miscellaneousRoutes.js";
import paymentRoute from "./routes/paymentRoute.js";
import errorMiddleWare from "./middleware/error.middleware.js";
import { cloudinaryConnect } from "./config/cloudinary.js";
import Razorpay from "razorpay";
const app = express();

app.use(
  cors({
    origin: ["http://localhost:5173", "https://lms-swart-eta.vercel.app"],
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(morgan("dev"));

app.use("/api/v1/user", userRoutes);
app.use("/api/v1/courses", couseRoutes);
app.use("/api/v1/payments", paymentRoute);
app.use("/api/v1", miscellaneousRoute);

dbConnect();
cloudinaryConnect();

app.get("/", (req, res) => {
  res.send(`<h1> Hello from Backend </h1>`);
});

app.use("*", (req, res) => {
  res.status(404).json({
    success: false,
    message: "OOPS!! 404 page not found",
  });
});

app.use(errorMiddleWare);

export const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_SECRET,
});

export default app;
