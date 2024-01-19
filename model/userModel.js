import mongoose from "mongoose";
import bcrypt from "bcrypt"
import Jwt from "jsonwebtoken";
import "dotenv/config.js";
const userSchema = new mongoose.Schema(
  {
    fullName: {
      type: "String",
      required: [true, "Name is required"],
      minLength: [5, "Name must be at leat 5 characters"],
      maxLength: [50, "Name must be less than 20 characters"],
    },
    email: {
      type: "String",
      required: [true, "Email is required"],
      unique: true,
      trim: true,
      match: [/^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/ , "Email is not valid"],
      lowercase: true,
    },
    password: {
      type: "String",
      required: [true, "password is required"],
      minLength: [8, "Name must be at leat 8 characters"],
      maxLength: [20, "Name must be less than 20 characters"],
      select: false,
    },
    role: {
      type: "String",
      enum: ["USER", "ADMIN"],
      default: "USER",
    },
    avatar: {
      public_id: {
        type: "String",
      },
      secure_url: {
        type: "String",
      },
    },
    forgotPasswordToken: String,
    forgotPasswordExpiry: Date,
  },
  {
    timestamps: true,
  }
);

userSchema.pre('save', async (next) => {
 try {
   if (!this.isModified('password')) {
     return next();
   }
   this.password = await bcrypt.hash(this.password, 10);
 } catch (error) {
  
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
    return await bcrypt.compare(pass , this.password)
  }
};

const USER = mongoose.model("USER", userSchema);

export default USER;