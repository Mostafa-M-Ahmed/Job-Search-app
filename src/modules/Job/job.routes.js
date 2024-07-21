import { Router } from "express";

import * as jobController from "./job.controller.js";
import { errorHandler } from "../../Middlewares/error-handling.middleware.js";
import { validationMiddleware } from "../../Middlewares/validation.middleware.js";
import { AddJobSchema, UpdateJobSchema, FilterJobsSchema, ApplyJobSchema } from "./job.schema.js";
import { authorize } from "../../Middlewares/authorization.middleware.js";
import { auth } from "../../Middlewares/authentication.middleware.js";
import { roles } from "../../utils/system-roles.utils.js";

const router = Router();

// Apply authentication middleware to all routes in this router
router.use(errorHandler(auth()));

// Define role-based authorization middleware
const authorizeCompanyHR = errorHandler(authorize(roles.COMPANY_HR));
const authorizeUserCompanyHR = errorHandler(authorize(roles.USER_COMPANY_HR));
const authorizeUser = errorHandler(authorize(roles.USER));

// Routes
router.post("/add", authorizeCompanyHR, errorHandler(validationMiddleware(AddJobSchema)), errorHandler(jobController.addJob));

router.put("/update/:jobId", authorizeCompanyHR, errorHandler(validationMiddleware(UpdateJobSchema)), errorHandler(jobController.updateJob));

router.delete("/delete/:jobId", authorizeCompanyHR, errorHandler(jobController.deleteJob));

router.get("/all", authorizeUserCompanyHR, errorHandler(jobController.getAllJobsWithCompanyInfo));

router.get("/company-jobs", authorizeUserCompanyHR, errorHandler(jobController.getJobsForCompany));

router.get("/filter", authorizeUserCompanyHR, errorHandler(validationMiddleware(FilterJobsSchema)), errorHandler(jobController.getFilteredJobs));

router.post("/apply/:jobId", authorizeUser, errorHandler(jobController.applyToJob));

export default router;
