import Jwt from "jsonwebtoken";
import AppError from "../utils/error.utils.js";

const isLoggedIn = async(req, res, next) => {
  const { token } = req.cookies;
  if (!token) {
    return next(new AppError("Un authenticated ! please login again ", 401));
     }
     const userDetails = Jwt.verify(token, process.env.JWT_SECRET);
     req.user = userDetails;
     next()
};

export default isLoggedIn