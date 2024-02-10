import Course from "../model/courseModel.js";
import AppError from "../utils/error.utils.js";
import fs from "fs/promises";
import cloudinary from "cloudinary";
const getAllCourses = async (req, res, next) => {
  try {
    const courses = await Course.find({}).select("-lecture");

    res.status(200).json({
      succss: true,
      message: "All courses ",
      courses,
    });
  } catch (error) {
    return next(new AppError("Coun't find course details ", 500));
  }
};

const getLectureByCourseId = async (req, res, next) => {
  try {
    const { id } = req.params;

    const course = await Course.findById(id);
    if (!course) {
      return next(new AppError("Course not found !!", 500));
    }
    return res.status(200).json({
      succss: true,
      message: "Lecture fetched successfully",
      lectures: course.lecture,
    });
  } catch (error) {
    return next(new AppError(error.message, 500));
  }
};

const createCourse = async (req, res, next) => {
  try {
    const { title, description, category, createdBy } = req.body;
    const course = await Course.create({
      title,
      description,
      category,
      createdBy,
    });
    if (!course) {
      return next(
        new AppError("Course could not be created Please try again !!", 500)
      );
    }
    if (req.file) {
      const result = await cloudinary.v2.uploader.upload(req.file.path, {
        folder: "lms",
      });

      if (result) {
        course.thumbnail.public_id = result.public_id;
        course.thumbnail.secure_url = result.secure_url;
      }
      fs.rm(`uploads/${req.file.filename}`);
    }
    await course.save();

    return res.status(200).json({
      success: true,
      message: "Course created Successfully",
      course,
    });
  } catch (error) {
    return next(new AppError(error.message, 500));
  }
};
const updateCourse = async (req, res, next) => {
  try {
    const { id } = req.params;
    const course = await Course.findByIdAndUpdate(
      id,
      { $set: req.body },
      { runValidators: true, new: true } // Combine options into a single object
    );

    if (!course) {
      return next(new AppError("Course not found with the given id.", 500));
    }

    return res.status(200).json({
      success: true,
      message: "Course updated successfully",
      course,
    });
  } catch (error) {
    return next(new AppError(error.message, 500));
  }
};
const deleteCourse = async (req, res, next) => {
  try {
    const { id } = req.params;
    const course = await Course.findByIdAndDelete(id);
    if (!course) {
      return next(new AppError("Course does not find with given id !!", 500));
    }

    return res.status(200).json({
      success: true,
      message: "Course deleted successfully",
      course,
    });
  } catch (error) {
    return next(new AppError(error.message, 500));
  }
};

const addLectureToCourseById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { title, description } = req.body;
    if (!title || !description) {
      return next(new AppError("All fields are required", 400));
    }
    const course = await Course.findById(id);

    if (!course) {
      return next(new AppError("Course does not exists with given id", 400));
    }
    const lecture = {
      title,
      description,
      lecture: {},
    };
    if (req.file) {
      const result = await cloudinary.v2.uploader.upload(req.file.path, {
        resource_type: "video",
        folder: "lms",
      });

      if (result) {
        console.log(result);
        lecture.lecture.public_id = result.public_id;
        lecture.lecture.secure_url = result.secure_url;
      }
      fs.rm(`uploads/${req.file.filename}`);
    }
    course.lecture.push(lecture);
    course.numberOfLectures = course.lecture.length;
    await course.save();

    return res.status(200).json({
      success: true,
      message: "Lecture added successfully",
      course,
    });
  } catch (error) {
    console.log(error);
    next(new AppError("Unable to add lecture Please try again !", 400));
  }
};

const deleteLecture = async (req, res, next) => {
  try {
    const { courseId, lectureId } = req.query;
    console.log(courseId, lectureId);
    if (!courseId || !lectureId) {
      return next(new AppError("CourseId not found!", 400));
    }

    const course = await Course.findById(courseId);
    if (!course) {
      return next(new AppError("Unable to find Course!", 400));
    }

    const lectureIndex = course.lecture.findIndex((l) => l._id == lectureId);
    if (lectureIndex === -1) {
      return next(new AppError("Unable to find Lecture!", 400));
    }

    const public_id = course.lecture[lectureIndex].lecture.public_id;
    console.log(public_id);
    cloudinary.v2.uploader.destroy(
      public_id,
      { resource_type: "video" },
      (error, result) => {
        if (error) {
          console.error("Error deleting video:", error);
          return next(
            new AppError("Unable to delete video from Cloudinary", 500)
          );
        } else {
          console.log(result);
          course.lecture.splice(lectureIndex, 1);
          course.numberOfLectures--;
        }
      }
    );

    await course.save();
    return res.json({
      course,
    });
  } catch (error) {
    console.error("Error:", error);
    next(new AppError("Unable to remove lecture. Please try again!", 400));
  }
};

export {
  getAllCourses,
  getLectureByCourseId,
  createCourse,
  updateCourse,
  deleteCourse,
  addLectureToCourseById,
  deleteLecture,
};
