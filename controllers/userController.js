import USER from "../model/userModel.js"
import AppError from "../utils/error.utils.js";

const cookieOption = {
     maxAge: 7 * 24 * 60 * 60 * 1000,
     httpOnly: true,
     secure : true
}


const register = async (req, res , next) => {
     const { fullName, email, password } = req.body;

     if (!fullName || !email || !password) {
          return next(new AppError("ALL fields are required", 400));
     }

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
          if (!email || !password)
            return next(new AppError("ALL fields are required", 400));

          const user = await USER.findOne({ email }).select("+password");

          if (!user || !user.comparePassword(password))
            return next(new AppError("Email password not matched", 400));

          const token = user.generateJwtToken();
          user.password = undefined;

          return res.cookie("token", token, cookieOption).status(200).json({
            success: true,
               message: "User logged in Successfully",
            token,
               user,
            
          });
     } catch (error) {
         return next(new AppError(e.message , 500))
     }

};

export {
     register,
     login,
     getProfile,
     logout
}