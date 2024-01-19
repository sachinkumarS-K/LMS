import express from "express"
import dbConnect from "./config/db.js";
import cors from "cors"
const app = express();

app.use(cors());
app.use(express.json());


dbConnect()

export default app;