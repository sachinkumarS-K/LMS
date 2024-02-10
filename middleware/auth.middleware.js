import Jwt from "jsonwebtoken";
import AppError from "../utils/error.utils.js";
import USER from "../model/userModel.js";

const isLoggedIn = async (req, res, next) => {
  try {
    const { token } = req.cookies;

    if (!token) {
      return next(new AppError("Un authenticated ! please login again ", 401));
    }
    const userDetails = Jwt.verify(token, process.env.JWT_SECRET);

    req.user = userDetails;
    next();
  } catch (error) {
    return next(new AppError(error.message, 401));
  }
};

const authorizedRoles =
  (...roles) =>
  async (req, res, next) => {
    const currentUserRoles = req.user.role;
    if (!roles.includes(currentUserRoles)) {
      return next(
        new AppError("You are not authorized for this action !!", 403)
      );
    }
    next();
  };

const authorizedSubscriber = async (req, res, next) => {
  const user = await USER.findById(req.user.id);

  if (user.role.status !== "ACTIVE") {
    return next(new AppError("You are not authorized for this action !!", 403));
  }
  next();
};

export { isLoggedIn, authorizedRoles, authorizedSubscriber };
