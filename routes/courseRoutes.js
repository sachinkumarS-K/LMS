import { Router } from "express";

import isLoggedIn from "../middleware/auth.middleware.js";
import {
  getAllCourses,
  getLectureByCourseId,
  createCourse,
  updateCourse,
  deleteCourse,
} from "../controllers/courseController.js";
import validate from "../middleware/validate.middleware.js";
import { createCourseSchema } from "../validator/authValidator.js";

const router = Router();

router.route("/")
     .get(getAllCourses)
     .post(validate(createCourseSchema),createCourse);

router.route("/:id")
     .get(isLoggedIn, getLectureByCourseId)
     .put(updateCourse)
     .delete(deleteCourse);


export default router;
