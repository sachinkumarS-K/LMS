import { z } from 'zod'

const registerSchema = z.object({
  fullName: z
    .string({ required_error: "Name is required" })
    .trim()
    .max(100, { message: "Name must not be more than 100 characters" })
    .min(3, { message: "Name must not be at least  3 characters" }),
  email: z
    .string({ required_error: "Email is required" })
    .trim()
    .email({ message: "Invalid email address" })
    .max(100, { message: "email must not be more than 100 characters" }),
    
  password: z
    .string({ required_error: "Email is required" })
    .trim()
    .max(100, { message: "password must not be more than 100 characters" })
    .min(3, { message: "password must  be at least  5 characters" }),
});
const loginSchema = z.object({
  email: z
    .string({ required_error: "Email is required" })
    .trim()
    .email({ message: "Invalid email address" })
    .max(100, { message: "email must not be more than 100 characters" }),
    
  password: z
    .string({ required_error: "Email is required" })
    .trim()
    .max(100, { message: "password must not be more than 100 characters" })
    .min(3, { message: "password must  be at least  5 characters" }),
});
const createCourseSchema = z.object({
  title: z
    .string({ required_error: "Title is required" })
    .trim()
    .max(100, { message: "Title must not be more than 100 characters" }),
  description: z
    .string({ required_error: "description is required" })
    .trim()
    .min(20, { message: "description must be atleast 20 characters" })
    .max(500, { message: "description must not be more than 500 characters" }),
  category: z
    .string({ required_error: "category is required" })
    .trim()
    .min(10, { message: "category must be atleast 10 characters" })
    .max(500, { message: "category must not be more than 500 characters" }),
  createdBy: z
    .string({ required_error: "createdBy is required" })
    .trim()
    .min(3, { message: "category must be atleast 3 characters" })
    
});

export { registerSchema, loginSchema, createCourseSchema };