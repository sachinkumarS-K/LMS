import express from "express"
import dbConnect from "./config/db.js";
import cors from "cors"
const app = express();

app.use(cors());
app.use(express.json());


app.use("/api/v1/user" , userRouter)

dbConnect()

export default app;