import { Router } from "express";

import * as userController from "./user.controller.js";
import { errorHandler } from "../../Middlewares/error-handling.middleware.js";
import { validationMiddleware } from "../../Middlewares/validation.middleware.js";
import { SignUpSchema, SignInSchema, UpdateUserSchema, UpdatePasswordSchema, ForgotPasswordSchema, ResetPasswordSchema } from "./user.schema.js";
import { authorize } from "../../Middlewares/authorization.middleware.js";
import { auth } from "../../Middlewares/authentication.middleware.js";
import { roles } from "../../utils/system-roles.utils.js";

const router = Router();

// Define role-based authorization middleware
const authorizeUserCompanyHR = errorHandler(authorize(roles.USER_COMPANY_HR));

// Routes
router.post("/sign-up", errorHandler(validationMiddleware(SignUpSchema)), errorHandler(userController.signUp));

router.get("/confirm-email/:token", errorHandler(userController.confirmEmail));

router.post("/login", errorHandler(validationMiddleware(SignInSchema)), errorHandler(userController.login));

router.put("/update", errorHandler(auth()), authorizeUserCompanyHR, errorHandler(validationMiddleware(UpdateUserSchema)), errorHandler(userController.updateAccount));

router.delete("/delete", errorHandler(auth()), authorizeUserCompanyHR, errorHandler(userController.deleteAccount));

router.get("/account", errorHandler(auth()), authorizeUserCompanyHR, errorHandler(userController.getAccountData));

router.get("/profile/:_id", errorHandler(userController.getProfileData));

router.put("/update-password", errorHandler(auth()), authorizeUserCompanyHR, errorHandler(validationMiddleware(UpdatePasswordSchema)), errorHandler(userController.updatePassword));

router.post("/forgot-password", errorHandler(validationMiddleware(ForgotPasswordSchema)), errorHandler(userController.forgotPassword));

router.post("/reset-password/:token", errorHandler(validationMiddleware(ResetPasswordSchema)), errorHandler(userController.resetPassword));

router.get("/recovery-email-accounts/:recoveryEmail",  errorHandler(userController.getAccountsByRecoveryEmail));

export default router;
