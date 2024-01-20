import Course from "../model/courseModel.js";
import AppError from "../utils/error.utils.js";

const getAllCourses = async (req, res, next) => {
     try {
          const courses = await Course.find({}).select("-lecture");
          res.status(200).json({
               succss: true,
               message: "All courses ",
               courses
          })
     } catch (error) {
          return next(new AppError("Coun't find course details " , 500))
     }
}

const getLectureByCourseId = async (req, res, next) => {
     try {
          const { id } = req.params;
          
          const course = await Course.findById( id );
          if (!course) {
                return next(new AppError("Course not found !!", 500));
          }
          return res.status(200).json({
               succss: true,
               message: "Lecture fetched successfully",
               lectures: course.lecture
          });
     } catch (error) {
          return next(new AppError(error.message , 500))
  }
};

const createCourse = async (req, res, next) => {
     
}
const updateCourse = async (req, res, next) => {
     
}
const deleteCourse = async (req, res, next) => {
     
}

export {
  getAllCourses,
  getLectureByCourseId,
  createCourse,
  updateCourse,
  deleteCourse,
};