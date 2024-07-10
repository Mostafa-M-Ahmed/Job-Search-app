import { Router } from "express";
import * as jobController from "./job.controller.js";
import { errorHandler } from "../../Middlewares/error-handling.middleware.js";
import { validationMiddleware } from "../../Middlewares/validation.middleware.js";
import { AddJobSchema, UpdateJobSchema, FilterJobsSchema, ApplyJobSchema } from "./job.schema.js";
import { authorize } from "../../Middlewares/authorization.middleware.js";
import { auth } from "../../Middlewares/authentication.middleware.js";
import { roles } from "../../utils/system-roles.utils.js";

const router = Router();

router.post("/add", errorHandler(auth()), errorHandler(authorize(roles.COMPANY_HR)), errorHandler(validationMiddleware(AddJobSchema)), errorHandler(jobController.addJob));

router.put("/update/:jobId", errorHandler(auth()), errorHandler(authorize(roles.COMPANY_HR)), errorHandler(validationMiddleware(UpdateJobSchema)), errorHandler(jobController.updateJob));

router.delete("/delete/:jobId", errorHandler(auth()), errorHandler(authorize(roles.COMPANY_HR)), errorHandler(jobController.deleteJob));

router.get("/all", errorHandler(auth()), errorHandler(authorize(roles.USER_COMPANY_HR)), errorHandler(jobController.getAllJobsWithCompanyInfo));

router.get("/company-jobs", errorHandler(auth()), errorHandler(authorize(roles.USER_COMPANY_HR)), errorHandler(jobController.getJobsForCompany));

router.get("/filter", errorHandler(auth()), errorHandler(authorize(roles.USER_COMPANY_HR)), errorHandler(validationMiddleware(FilterJobsSchema)), errorHandler(jobController.getFilteredJobs));

router.post("/apply/:jobId", errorHandler(auth()), errorHandler(authorize(roles.USER)), errorHandler(jobController.applyToJob));

export default router;
