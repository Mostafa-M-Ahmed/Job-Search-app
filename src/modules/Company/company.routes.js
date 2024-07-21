import { Router } from "express";

import * as companyController from "./company.controller.js";
import { errorHandler } from "../../Middlewares/error-handling.middleware.js";
import { validationMiddleware } from "../../Middlewares/validation.middleware.js";
import { AddCompanySchema, UpdateCompanySchema } from "./company.schema.js";
import { authorize } from "../../Middlewares/authorization.middleware.js";
import { auth } from "../../Middlewares/authentication.middleware.js";
import { roles } from "../../utils/system-roles.utils.js";

const router = Router();

// Apply authentication middleware to all routes in this router
router.use(errorHandler(auth()));

// Define role-based authorization middleware
const authorizeCompanyHR = errorHandler(authorize(roles.COMPANY_HR));
const authorizeUserCompanyHR = errorHandler(authorize(roles.USER_COMPANY_HR));

// Routes
router.post("/add", authorizeCompanyHR, errorHandler(validationMiddleware(AddCompanySchema)), errorHandler(companyController.addCompany));

router.put("/update/:companyId", authorizeCompanyHR, errorHandler(validationMiddleware(UpdateCompanySchema)), errorHandler(companyController.updateCompany));

router.delete("/delete/:companyId", authorizeCompanyHR, errorHandler(companyController.deleteCompany));

router.get("/data/:companyId", authorizeCompanyHR, errorHandler(companyController.getCompanyData));

router.get("/search", authorizeUserCompanyHR, errorHandler(companyController.searchCompany));

router.get("/applications/:jobId", authorizeCompanyHR, errorHandler(companyController.getJobApplicationsForSpecificJob));

router.get('/applications-company/:companyId', authorizeCompanyHR, errorHandler(companyController.getApplicationsForCompanyOnDay));

export default router;