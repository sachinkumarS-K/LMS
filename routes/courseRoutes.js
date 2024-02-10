import { Router } from "express";

import { authorizedRoles, isLoggedIn } from "../middleware/auth.middleware.js";
import {
  getAllCourses,
  getLectureByCourseId,
  createCourse,
  updateCourse,
  deleteCourse,
  addLectureToCourseById,
  deleteLecture,
} from "../controllers/courseController.js";
import validate from "../middleware/validate.middleware.js";
import { createCourseSchema } from "../validator/authValidator.js";
import { upload } from "../middleware/multer.middleware.js";

const router = Router();

router
  .route("/")
  .get(getAllCourses)
  .post(
    isLoggedIn,
    authorizedRoles("ADMIN"),
    upload.single("thumbnail"),
    validate(createCourseSchema),
    createCourse
  )
  .delete(isLoggedIn, authorizedRoles("ADMIN"), deleteLecture);

router
  .route("/:id")
  .get(isLoggedIn, authorizedRoles("ADMIN"), getLectureByCourseId)
  .post(
    isLoggedIn,
    authorizedRoles("ADMIN"),
    upload.single("lecture"),
    addLectureToCourseById
  )
  .put(isLoggedIn, authorizedRoles("ADMIN"), updateCourse)
  .delete(isLoggedIn, authorizedRoles("ADMIN"), deleteCourse);

export default router;
