import Company from "../../../DB/models/company.model.js";
import Job from "../../../DB/models/job.model.js";
import Application from "../../../DB/models/application.model.js";
import User from "../../../DB/models/user.model.js";
import { ErrorClass } from "../../utils/error-class.utils.js";

/**
 * @description Add a new company
 */
export const addCompany = async (req, res, next) => {
  try {
    const { companyName, description, industry, address, numberOfEmployees, companyEmail, companyHR } = req.body;

    // Check if the user is authorized
    if (req.authUser.role !== "Company_HR") {
      return next(new ErrorClass("Unauthorized", 403, "Unauthorized" ,"company.controller.addCompany.Unauthorized"));
    }

    if (!req.authUser.isConfirmed) {
      return next(new ErrorClass("Unauthorized", 403, "Unauthorized" ,"company.controller.addCompany.Unauthorized"));
    }

    // Check if the company name or email already exists
    const isCompanyExists = await Company.findOne({ $or: [{ companyName }, { companyEmail }] });
    if (isCompanyExists) {
      return next(new ErrorClass("Company already exists", 400, "Company already exists" ,"company.controller.addCompany.isCompanyExists"));
    }

    // Create new company instance
    const companyInstance = new Company({
      companyName,
      description,
      industry,
      address,
      numberOfEmployees,
      companyEmail,
      companyHR: req.authUser._id,
    });

    const newCompany = await companyInstance.save();
    res.status(201).json({ message: "Company added successfully", company: newCompany });
  } catch (err) {
    next(err);
  }
};

/**
 * @description Update company data
 */
export const updateCompany = async (req, res, next) => {
  const { companyId } = req.params;
  const { companyName, description, industry, address, numberOfEmployees, companyEmail } = req.body;

  try {
    // Check if the user is authorized
    if (req.authUser.role !== "Company_HR") {
      return next(new ErrorClass("Unauthorized", 403, "Unauthorized" ,"company.controller.updateCompany.Unauthorized"));
    }

    const company = await Company.findById(companyId);

    // Check if the company exists and if the user is the owner
    if (!company || company.companyHR.toString() !== req.authUser._id.toString()) {
      return next(new ErrorClass("Not found or unauthorized", 404, "Not found or unauthorized", "company.controller.updateCompany.companyCheck"));
    }

    if (companyEmail && companyEmail !== company.companyEmail) {
      const isCompanyEmailExists = await Company.findOne({ companyEmail });
      if (isCompanyEmailExists) {
        return next(new ErrorClass("Company Email already exists", 400, "Company Email already exists" ,"company.controller.updateCompany.companyEmailExists"));
      }
      company.companyEmail = companyEmail;
    }

    if (companyName && companyName !== company.companyName) {
      const isCompanyNameExists = await Company.findOne({ companyName });
      if (isCompanyNameExists) {
        return next(new ErrorClass("Company name already exists", 400, "Company name already exists" ,"company.controller.updateCompany.companyNameExists"));
      }
      company.companyName = companyName;
    }

    // Update company data
    company.companyName = companyName || company.companyName;
    company.description = description || company.description;
    company.industry = industry || company.industry;
    company.address = address || company.address;
    company.numberOfEmployees = numberOfEmployees || company.numberOfEmployees;
    company.companyEmail = companyEmail || company.companyEmail;
    company.version_key += 1;

    const updatedCompany = await company.save();
    res.status(200).json({ message: "Company updated successfully", company: updatedCompany });
  } catch (err) {
    next(err);
  }
};

/**
 * @description Delete company data
 */
export const deleteCompany = async (req, res, next) => {
  const { companyId } = req.params;

  try {
    // Check if the user is authorized
    if (req.authUser.role !== "Company_HR") {
      return next(new ErrorClass("Unauthorized", 403, "Unauthorized" ,"company.controller.deleteCompany.Unauthorized"));
    }

    const company = await Company.findById(companyId);

    // Check if the company exists and if the user is the owner
    if (!company || company.companyHR.toString() !== req.authUser._id.toString()) {
      return next(new ErrorClass("Not found or unauthorized", 404, "Not found or unauthorized" ,"company.controller.deleteCompany.companyExists"));
    }

    await company.deleteOne();
    res.status(200).json({ message: "Company deleted successfully" });
  } catch (err) {
    next(err);
  }
};

/**
 * @description Get company data
 */
export const getCompanyData = async (req, res, next) => {
  const { companyId } = req.params;
  
  try {
    // Check if the user is authorized
    if (req.authUser.role !== "Company_HR") {
      return next(new ErrorClass("Unauthorized", 403, "Unauthorized" ,"company.controller.getCompany.Unauthorized"));
    }

    const company = await Company.findById(companyId).populate('companyHR');

    // Check if the company exists
    if (!company) {
      return next(new ErrorClass("Company not found", 404, "Company not found" ,"company.controller.getCompany.companyExists"));
    }

    // Get all jobs related to this company
    const jobs = await Job.find({ addedBy: company._id });

    res.status(200).json({ message: "Company data fetched successfully", company, jobs });
  } catch (err) {
    next(err);
  }
};

/**
 * @description Search for a company with a name
 */
export const searchCompany = async (req, res, next) => {
  const { companyName } = req.query;

  try {
    // Check if the user is authorized
    if (req.authUser.role !== "Company_HR" && req.authUser.role !== "User") {
      return next(new ErrorClass("Unauthorized", 403, "Unauthorized" ,"company.controller.searchCompany"));
    }

    const companies = await Company.find({ companyName: { $regex: companyName, $options: 'i' } });

    res.status(200).json({ message: `Number of companies fetched: ${companies.length}`, companies });
  } catch (err) {
    next(err);
  }
};

/**
 * @description Get all applications for specific jobs
 */
export const getJobApplicationsForSpecificJob = async (req, res, next) => {
  const { jobId } = req.params;

  try {
    // Check if the user is authorized
    if (req.authUser.role !== "Company_HR") {
      return next(new ErrorClass("Unauthorized", 403, "Unauthorized" ,"company.controller.getJobApplications.Unauthorized"));
    }

    const job = await Job.findById(jobId);

    console.log(job);
    // Check if the job exists and if the user is the owner of the job's company
    if (!job ) {
      return next(new ErrorClass("Not found or unauthorized", 404, "Not found or unauthorized" ,"company.controller.getJobApplications.jobExists"));
    }

    const applications = await Application.find({ jobId }).populate('jobId');
    // const applications = await Application.find({ jobId })

    res.status(200).json({ message: `Number of applications fetched: ${applications.length}`, applications });
  } catch (err) {
    next(err);
  }
};
