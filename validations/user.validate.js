import { body } from "express-validator";

export const registerUserValidator = [
    body("user_name")
        .trim()
        .notEmpty().withMessage("Full Name is required")
        .isLength({ min: 2, max: 50 }).withMessage("Full Name must be 2-50 characters"),

    body("email")
        .trim()
        .notEmpty().withMessage("Email is required")
        .isEmail().withMessage("Invalid email format"),

    body("phone")
        .trim()
        .notEmpty().withMessage("Phone number is required")
        .matches(/^[+]*[(]?[0-9]{1,4}[)]?[-\s./0-9]*$/)
        .withMessage("Invalid phone number format"),

    body("password")
        .notEmpty().withMessage("Password is required")
        .isLength({ min: 6 }).withMessage("Password must be at least 6 characters"),

    body("address")
        .optional()
        .trim()
        .isLength({ min: 3, max: 100 }).withMessage("Address must be 3-100 characters"),

    body("gender")
        .optional()
        .isIn(["male", "female", "other"]).withMessage("Invalid gender"),

    body("bio")
        .optional()
        .trim()
        .isLength({ max: 255 }).withMessage("Bio can't exceed 255 characters")
];


export const updateUserValidator = [
    body("user_name")
        .trim()
        .notEmpty().withMessage("User Name is required")
        .isLength({ min: 2, max: 32 }).withMessage("User Name must be 2-32 characters"),

    body("email")
        .trim()
        .notEmpty().withMessage("Email is required")
        .isEmail().withMessage("Invalid email format"),

    body("address")
        .optional()
        .trim()
        .isLength({ min: 3, max: 32 }).withMessage("Address must be 3-32 characters"),

    body("gender")
        .optional()
        .isIn(["male", "female", "other"]).withMessage("Invalid gender"),

    body("bio")
        .optional()
        .trim()
        .isLength({ max: 255 }).withMessage("Bio can't exceed 32 characters")
];