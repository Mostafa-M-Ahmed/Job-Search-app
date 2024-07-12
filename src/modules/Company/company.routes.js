import { Router } from "express";
import * as companyController from "./company.controller.js";
import { errorHandler } from "../../Middlewares/error-handling.middleware.js";
import { validationMiddleware } from "../../Middlewares/validation.middleware.js";
import { AddCompanySchema, UpdateCompanySchema } from "./company.schema.js";
import { authorize } from "../../Middlewares/authorization.middleware.js";
import { auth } from "../../Middlewares/authentication.middleware.js";
import { roles } from "../../utils/system-roles.utils.js";

const router = Router();

router.post("/add", errorHandler(auth()), errorHandler(authorize(roles.COMPANY_HR)), errorHandler(validationMiddleware(AddCompanySchema)), errorHandler(companyController.addCompany));

router.put("/update/:companyId", errorHandler(auth()), errorHandler(authorize(roles.COMPANY_HR)), errorHandler(validationMiddleware(UpdateCompanySchema)), errorHandler(companyController.updateCompany));

router.delete("/delete/:companyId", errorHandler(auth()), errorHandler(authorize(roles.COMPANY_HR)), errorHandler(companyController.deleteCompany));

router.get("/data/:companyId", errorHandler(auth()), errorHandler(authorize(roles.COMPANY_HR)), errorHandler(companyController.getCompanyData));

router.get("/search", errorHandler(auth()), errorHandler(authorize(roles.USER_COMPANY_HR)), errorHandler(companyController.searchCompany));

router.get("/applications/:jobId", errorHandler(auth()), errorHandler(authorize(roles.COMPANY_HR)), errorHandler(companyController.getJobApplicationsForSpecificJob));

router.get('/applications-company/:companyId', errorHandler(auth()), errorHandler(authorize(roles.COMPANY_HR)), errorHandler(companyController.getApplicationsForCompanyOnDay));

export default router;
