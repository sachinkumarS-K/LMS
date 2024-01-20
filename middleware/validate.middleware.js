import AppError from "../utils/error.utils.js";


const validate = (schema) => async (req, res, next) => {
     try {
          const parsedBody = await schema.parseAsync(req.body);
          req.body = parsedBody
          next()
     } catch (error) {
           return next(new AppError(error.issues[0].message, 400));
     }
}

export default validate