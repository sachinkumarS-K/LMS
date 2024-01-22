import mongoose from "mongoose";
import bcrypt from "bcrypt"
import Jwt from "jsonwebtoken";
import "dotenv/config.js";
import crypto from 'crypto'
const userSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: true
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: true,
      select: false,
    },
    role: {
      type: String,
      enum: ["USER", "ADMIN"],
      default: "USER",
    },
    avatar: {
      public_id: {
        type: String,
      },
      secure_url: {
        type: String,
      },
    },
    subscription: {
      id: String,
      status : String
    },
    forgotPasswordToken: String,
    forgotPasswordExpiry: Date, 
  },
  {
    timestamps: true,
  }
);

userSchema.pre("save", async function (next) {
  try {
    // Check if the password field is modified before hashing
    if (!this.isModified("password")) {
      return next();
    }

    // Hash the password
    this.password = await bcrypt.hash(this.password, 10);
    next();
  } catch (error) {
    console.error("Error in pre-save hook:", error);
    next(error); // Pass the error to the next middleware or callback
  }
});

userSchema.methods = {
  generateJwtToken: function () {
    try {
      const token = Jwt.sign(
        {
          id: this._id,
          email: this.email,
          // subscription: this.subscription,
          role: this.role,
        },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRY }
      );

      return token;
    } catch (error) {
      console.error("Error generating JWT token:", error);
      throw error;
    }
  },
  comparePassword: async function (pass) {
    console.log(pass);
    const flag = await bcrypt.compare(pass, this.password);
    console.log(flag);
    return flag;
  },
  generateResetPasswordToken:  async function (){
    try {
      const token = crypto.randomBytes(20).toString("hex");
     
      this.forgotPasswordToken = crypto
        .createHash("sha256")
        .update(token)
        .digest("hex");
      this.forgotPasswordExpiry = Date.now() + 15 * 60 * 1000; //15 mins
      return token;
    } catch (error) {
      console.log(error)
    }
  },
};

const USER = mongoose.model("USER", userSchema);

export default USER;