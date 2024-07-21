import ExcelJS from "exceljs";
import moment from "moment";

import Company from "../../../DB/models/company.model.js";
import Job from "../../../DB/models/job.model.js";
import Application from "../../../DB/models/application.model.js";
import { ErrorClass } from "../../utils/error-class.utils.js";


/**
 * @description Add a new company
 * @param {Object} req - The request object containing company details.
 * @param {Object} res - The response object.
 * @returns {Object} JSON response with success message and company details.
 */
export const addCompany = async (req, res, next) => {
  try {
    const { companyName, description, industry, address, numberOfEmployees, companyEmail, companyHR } = req.body;

    // Check if the companyHR already owns a company
    const isCompanyHROwnsCompany = await Company.findOne({ companyHR: req.authUser._id });
    if (isCompanyHROwnsCompany) {
      return next(new ErrorClass("CompanyHR already owns a company", 400, "CompanyHR may own only one company", "company.controller.addCompany.isCompanyHROwnsCompany"));
    }

    // Check if the company name or email already exists
    const isCompanyExists = await Company.findOne({ $or: [{ companyName }, { companyEmail }] });
    if (isCompanyExists) {
      return next(new ErrorClass("Company already exists", 400, "Company must have unique Name and Email", "company.controller.addCompany.isCompanyExists"));
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
 * @param {Object} req - The request object containing updated company details.
 * @param {Object} res - The response object.
 * @returns {Object} JSON response with success message and updated company details.
 */
export const updateCompany = async (req, res, next) => {
  const { companyId } = req.params;
  const { companyName, description, industry, address, numberOfEmployees, companyEmail } = req.body;

  try {
    const company = await Company.findById(companyId);

    // Check if the company exists and if the user is the owner
    if (!company || company.companyHR.toString() !== req.authUser._id.toString()) {
      return next(new ErrorClass("Not found or unauthorized", 404, "Not found or unauthorized", "company.controller.updateCompany.companyCheck"));
    }

    if (companyEmail && companyEmail !== company.companyEmail) {
      const isCompanyEmailExists = await Company.findOne({ companyEmail });
      if (isCompanyEmailExists) {
        return next(new ErrorClass("Company Email already exists", 400, "Company Email already exists", "company.controller.updateCompany.companyEmailExists"));
      }
      company.companyEmail = companyEmail;
    }

    if (companyName && companyName !== company.companyName) {
      const isCompanyNameExists = await Company.findOne({ companyName });
      if (isCompanyNameExists) {
        return next(new ErrorClass("Company name already exists", 400, "Company name already exists", "company.controller.updateCompany.companyNameExists"));
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
 * @param {Object} req - The request object containing company ID.
 * @param {Object} res - The response object.
 * @returns {Object} JSON response with success message.
 */
export const deleteCompany = async (req, res, next) => {
  const { companyId } = req.params;

  try {
    const company = await Company.findById(companyId);

    // Check if the company exists and if the user is the owner
    if (!company || company.companyHR.toString() !== req.authUser._id.toString()) {
      return next(new ErrorClass("Not found or unauthorized", 404, "Not found or unauthorized", "company.controller.deleteCompany.companyExists"));
    }

    // Delete all jobs related to this company
    await Job.deleteMany({ addedBy: company._id });

    // Delete the company
    await company.deleteOne();
    res.status(200).json({ message: "Company deleted successfully" });
  } catch (err) {
    next(err);
  }
};

/**
 * @description Get company data along with associated jobs
 * @param {Object} req - The request object containing company ID.
 * @param {Object} res - The response object.
 * @returns {Object} JSON response with company and job details.
 */
export const getCompanyData = async (req, res, next) => {
  const { companyId } = req.params;

  try {
    const company = await Company.findById(companyId).populate('companyHR');

    // Check if the company exists
    if (!company) {
      return next(new ErrorClass("Company not found", 404, "Company not found", "company.controller.getCompany.companyExists"));
    }

    // Get all jobs related to this company
    const jobs = await Job.find({ addedBy: company._id });

    res.status(200).json({ message: "Company data fetched successfully", company, jobs });
  } catch (err) {
    next(err);
  }
};

/**
 * @description Search for a company by name
 * @param {Object} req - The request object containing company name as query parameter.
 * @param {Object} res - The response object.
 * @returns {Object} JSON response with number of companies found and company details.
 */
export const searchCompany = async (req, res, next) => {
  const { companyName } = req.query;

  try {
    const companies = await Company.find({ companyName: { $regex: companyName, $options: 'i' } });

    res.status(200).json({ message: `Number of companies fetched: ${companies.length}`, companies });
  } catch (err) {
    next(err);
  }
};

/**
 * @description Get all applications for a specific job
 * @param {Object} req - The request object containing job ID.
 * @param {Object} res - The response object.
 * @returns {Object} JSON response with number of applications found and application details.
 */
export const getJobApplicationsForSpecificJob = async (req, res, next) => {
  const { jobId } = req.params;

  try {
    const job = await Job.findById(jobId);

    // Check if the job exists and if the user is the owner of the job's company
    if (!job) {
      return next(new ErrorClass("Not found or unauthorized", 404, "Not found or unauthorized", "company.controller.getJobApplications.jobExists"));
    }

    const applications = await Application.find({ jobId }).populate('jobId');

    res.status(200).json({ message: `Number of applications fetched: ${applications.length}`, applications });
  } catch (err) {
    next(err);
  }
};

/**
 * @description Get applications for a specific company on a specific day and create an Excel sheet
 * @param {Object} req - The request object containing company ID and date.
 * @param {Object} res - The response object.
 * @returns {Object} JSON response with success message and updated company details.
 */
export const getApplicationsForCompanyOnDay = async (req, res, next) => {
  const { companyId } = req.params;
  const { date } = req.query;   // format: YYYY-MM-DD

  try {
    const company = await Company.findById(companyId);

    // Check if the company exists and if the user is the owner
    if (!company || company.companyHR.toString() !== req.authUser._id.toString()) {
      return next(new ErrorClass("Not found or unauthorized", 404, "User may search for applications for their own company"));
    }

    // Validate date
    if (!date) {
      return next(new ErrorClass("Date query parameter is required", 400));
    }

    // finding jobs for required company
    const jobs = await Job.find({ addedBy: company._id });

    if (!jobs.length) {
      return next(new ErrorClass("No jobs found for this company", 404));
    }

    const specificDate = moment(date).startOf("day").toDate();
    const applications = await Application.find({
      createdAt: {
        $gte: specificDate,
        $lt: moment(specificDate).endOf("day").toDate(),
      },
    });

    // Create an Excel workbook and worksheet
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Applications');

    // Add header row
    worksheet.columns = [
      { header: 'Application ID', key: 'applicationId', width: 30 },
      { header: 'Job ID', key: 'jobId', width: 30 },
      { header: 'Applicant ID', key: 'userId', width: 30 },
      { header: 'Technical Skills', key: 'technicalSkills', width: 30 },
      { header: 'Soft Skills', key: 'softSkills', width: 30 },
      { header: 'Resume', key: 'resume', width: 30 },
      { header: 'Application Date', key: 'applicationDate', width: 20 }
    ];

    // Add data rows
    applications.forEach(application => {
      worksheet.addRow({
        applicationId: application._id,
        jobId: application.jobId,
        userId: application.userId,
        technicalSkills: application.userTechSkills.join(', '),
        softSkills: application.userSoftSkills.join(', '),
        resume: application.userResume,
        applicationDate: moment(application.createdAt).format('YYYY-MM-DD HH:mm:ss')
      });
    });

    // Write to a buffer
    const buffer = await workbook.xlsx.writeBuffer();

    // Set response headers
    res.setHeader('Content-Disposition', `attachment; filename="applications_${companyId}_${date}.xlsx"`);
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');

    // Send the Excel file
    res.send(buffer);

  } catch (err) {
    next(err);
  }
};
