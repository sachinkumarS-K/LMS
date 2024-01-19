
import mongoose from "mongoose";
import "dotenv/config.js";

mongoose.set('strictQuery', false);

export default async function dbConnect() {
     try {
          const { connection } = await mongoose.connect(process.env.MONGO_URL);
          console.log("Database connection established : ", connection.host);

     } catch (error) {
          console.log("Issue while connecting to database");
          console.log(error.message);
          process.exit(1);
     }
}