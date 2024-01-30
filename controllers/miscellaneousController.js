import USER from "../model/userModel.js";
import AppError from "../utils/error.utils.js";

export async function contactUs(req, res, next) {
  try {
    const { name, email, message } = req.body;

    if (!name || !email || !message) {
      return next(new AppError("All fields are required", 400));
    }
    const user = await USER.findById(req.user.id);

    user.message = [...user.message, { name, email, message }];
    await user.save();

    return res.json({
      success: true,
      message: "Message sent successfully",
      user,
    });
  } catch (error) {
    console.log(error);
    return next(new AppError(error.message, 500));
  }
}
