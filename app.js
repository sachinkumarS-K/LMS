import express from "express"
import dbConnect from "./config/db.js";
import cors from "cors"
import cookieParser from "cookie-parser";
import morgan from "morgan";
import userRoutes from "./routes/userRoutes.js"
import couseRoutes from "./routes/courseRoutes.js"
import errorMiddleWare from "./middleware/error.middleware.js";
const app = express();

app.use(cors({
     origin: [process.env.FRONTEND_URL],
     credentials : true
}));
app.use(express.json());
app.use(cookieParser());
app.use(morgan("dev"));


app.use("/api/v1/user", userRoutes);
app.use("/api/v1/courses", couseRoutes);


dbConnect();

app.get("/hello", (req, res) => {
  res.send(`<h1> Hello from Backend </h1>`);
});




app.use("*", (req , res) => {
     res.status(404).json({
          success: false,
          message : "OOPS!! 404 page not found"
     })
})

app.use(errorMiddleWare);

export default app;