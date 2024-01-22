import USER from "../model/userModel.js"
import mailSender from "../utils/mailSender.js"
import AppError from "../utils/error.utils.js";
import cloudinary from "cloudinary";
import crypto from "crypto";
import fs from 'fs/promises'
const cookieOption = {
     maxAge: 7 * 24 * 60 * 60 * 1000,
     httpOnly: true,
     secure : true
}
const register = async (req, res , next) => {
     const { fullName, email, password } = req.body;

     const userExists = await USER.findOne({ email });
     if (userExists) return next(new AppError("User already exists", 409));

     const user = await USER.create({
       fullName,
       email,
       password,
       avatar: {
         public_id: email,
         secure_url: `https://api.dicebear.com/5.x/initials/svg?seed=${fullName} K`,
          },
       
     },);
     if (!user) {
          return next(new AppError("User registration failed , please try again" , 400));
     }
     
     if (req.file) {
       try {
         const result = await cloudinary.v2.uploader.upload(req.file.path, {
           folder: "lms",
           width: 250,
           height: 250,
           gravity: "faces",
           crop: "fill",
         });
         if (result) {
           user.avatar.public_id = result.public_id;
              user.avatar.secure_url = result.secure_url;
              fs.rm(`uploads/${req.file.filename}`);
         }
       } catch (error) {
             return next(new AppError("Failed to upload file please try again !! ", 500));
       }
     }


     const token = user.generateJwtToken()
     await user.save();
     user.password = undefined

     return res.cookie('token' , token , cookieOption).status(200).json({
          success: true,
          message: 'User Registered Successfully',
          user
     })

}

const logout = async (req, res) => {
     return res.cookie('token', null, { secure: true, maxAge: 0, httpOnly: true }).status(200).json({
          success: true,
          message : 'User logged out successfully'
})
 };


const getProfile = async (req, res , next) => { 
    try {
      const userId = req.user.id;
      const user = await USER.findById(userId);
         return res.status(200).json({
              success: true,
              message: "USER DETAILS",
              user
     })
    } catch (error) {
     return next(new AppError("Failed to fetch profile" , 500))
    }
};

const login = async (req, res , next) => { 
     try {
          const { email, password } = req.body;
          // if (!email || !password)
          //   return next(new AppError("ALL fields are required", 400));

          const user = await USER.findOne({ email }).select("+password");
        
        const flag = user && (await user.comparePassword(password));
         
          if (!user || !flag ) {
                return next(new AppError("Email password not matched", 400));
          }
          const token = user.generateJwtToken();
          user.password = undefined;

          return res.cookie("token", token, cookieOption).status(200).json({
            success: true,
               message: "User logged in Successfully",
            token,
               user,
            
          });
     } catch (error) {
         return next(new AppError(error.message, 500));
     }

};


const forgetPassword = async (req, res, next) => {
     try {
          const { email } = req.body;
          console.log(email)
       if (!email) return next(new AppError("email is required", 400));

       const user = await USER.findOne({ email });

       if (!user) return next(new AppError("email is not registered!!", 400));

       const resetToken = await user.generateResetPasswordToken();
         
       await user.save();
       const resetPasswordUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;
          try {
               const message = `${resetPasswordUrl}`;
               const subject = "email for Password change ";
         await mailSender(email, subject, message);
         return res.status(200).json({
           success: true,
           message: `Reset password token has been sent to ${email} successfully`,
         });
       } catch (error) {
         (user.forgotPasswordExpiry = undefined),
           (user.forgotPasswordToken = undefined);
         await user.save();
         return next(new AppError(error.message, 500));
       }
     } catch (error) {
          return next(new AppError(error.message, 500));
     }
}

const resetPassword = async (req, res, next) => {
     try {
          const { resetToken } = req.params;
          const pasword = req.body.password;
          
          const forgotPasswordToken = crypto
            .createHash("sha256")
            .update(resetToken)
            .digest("hex");
          const user = await USER.findOne({
               forgotPasswordToken,
               forgotPasswordExpiry: { $gt: Date.now() 
               }
          });

          if (!user) {
               return next("Token is invalid or expired , please try again", 500);
          }
          user.password = pasword 
          user.forgotPasswordExpiry = undefined;
          user.forgotPasswordToken = undefined;
          await user.save();

          return res.status(200).json({
               success: true,
               message: "Password updated successfully",

          })
     } catch (error) {
          return next(new AppError(error.message, 500));
     }
};

const updateUser = async (req, res, next) => {
     try {
       const { fullName } = req.body;
       const id = req.user.id;
       const user = await USER.findById(id);
       if (!user) {
         return next(new AppError("User does not exist please log in"), 400);
          }
          user.fullName = fullName;
       if (req.file) {
         try {
           await cloudinary.v2.uploader.destroy(user.avatar.public_id);
           const result = await cloudinary.v2.uploader.upload(req.file.path, {
             folder: "lms",
             width: 250,
             height: 250,
             gravity: "faces",
             crop: "fill",
           });
           if (result) {
             user.avatar.public_id = result.public_id;
             user.avatar.secure_url = result.secure_url;
             fs.rm(`uploads/${req.file.filename}`);
           }
         } catch (error) {
           return next(
             new AppError("Failed to upload file please try again !! ", 500)
           );
            }
            
          }
          await user.save();

          return res.status(200).json({
               success: true,
               message: "profile updated successfully",
               user
          })
     } catch (error) {
       return next(new AppError(error.message), 400);
     }
}


export {
  register,
  login,
  getProfile,
  logout,
  resetPassword,
  forgetPassword,
  updateUser,
};