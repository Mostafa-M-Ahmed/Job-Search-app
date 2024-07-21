import Job from "../../../DB/models/job.model.js";
import Company from "../../../DB/models/company.model.js";
import Application from "../../../DB/models/application.model.js";
import { ErrorClass } from "../../utils/error-class.utils.js";

/**
 * @description Add a new job
 * @param {Object} req - The request object containing job details.
 * @param {Object} res - The response object.
 * @returns {Object} JSON response with success message and job details.
 */
export const addJob = async (req, res, next) => {
  const { jobTitle, jobLocation, workingTime, seniorityLevel, jobDescription, technicalSkills, softSkills, addedBy } = req.body;

  try {
    const mainCompany = await Company.findOne({ companyHR: req.authUser._id })

    const jobInstance = new Job({
      jobTitle,
      jobLocation,
      workingTime,
      seniorityLevel,
      jobDescription,
      technicalSkills,
      softSkills,
      addedBy: mainCompany,
    });


    const newJob = await jobInstance.save();
    res.status(201).json({ message: "Job added successfully", job: newJob });
  } catch (err) {
    next(err);
  }
};

/**
 * @description Update job data
 * @param {Object} req - The request object containing updated job details.
 * @param {Object} res - The response object.
 * @returns {Object} JSON response with success message and updated job details.
 */
export const updateJob = async (req, res, next) => {
  const { jobId } = req.params;
  const { jobTitle, jobLocation, workingTime, seniorityLevel, jobDescription, technicalSkills, softSkills } = req.body;

  try {
    const job = await Job.findById(jobId);

    // Check if the job exists and if the user is the owner
    if (!job || job.addedBy.toString() !== req.authUser._id.toString()) {
      return next(new ErrorClass("Not found or unauthorized", 404, "Not found or unauthorized"));
    }

    // Update job data
    job.jobTitle = jobTitle || job.jobTitle;
    job.jobLocation = jobLocation || job.jobLocation;
    job.workingTime = workingTime || job.workingTime;
    job.seniorityLevel = seniorityLevel || job.seniorityLevel;
    job.jobDescription = jobDescription || job.jobDescription;
    job.technicalSkills = technicalSkills || job.technicalSkills;
    job.softSkills = softSkills || job.softSkills;
    job.version_key += 1;

    const updatedJob = await job.save();
    res.status(200).json({ message: "Job updated successfully", job: updatedJob });
  } catch (err) {
    next(err);
  }
};

/**
 * @description Delete job data
 * @param {Object} req - The request object containing job ID.
 * @param {Object} res - The response object.
 * @returns {Object} JSON response with success message.
 */
export const deleteJob = async (req, res, next) => {
  const { jobId } = req.params;

  try {
    const job = await Job.findById(jobId);

    // Check if the job exists and if the user is the owner
    if (!job || job.addedBy.toString() !== req.authUser._id.toString()) {
      return next(new ErrorClass("Not found or unauthorized", 404, "Not found or unauthorized"));
    }

    // Delete all applications related to this job
    await Application.deleteMany({ jobId: job._id });

    // Delete the job
    await job.deleteOne();

    res.status(200).json({ message: "Job deleted successfully" });
  } catch (err) {
    next(err);
  }
};

/**
 * @description Get all jobs with their company's information
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @returns {Object} JSON response with the number of jobs and job details.
 */
export const getAllJobsWithCompanyInfo = async (req, res, next) => {
  try {
    const jobs = await Job.find().populate('addedBy');

    res.status(200).json({ message: `Number of jobs fetched: ${jobs.length}`, jobs });
  } catch (err) {
    next(err);
  }
};

/**
 * @description Get all jobs for a specific company
 * @param {Object} req - The request object containing company name query parameter.
 * @param {Object} res - The response object.
 * @returns {Object} JSON response with the number of jobs and job details.
 */
export const getJobsForCompany = async (req, res, next) => {
  const { companyName } = req.query;

  try {
    const company = await Company.findOne({ companyName });

    if (!company) {
      return next(new ErrorClass("Company not found", 404, "Company not found"));
    }

    const jobs = await Job.find({ addedBy: company._id });

    res.status(200).json({ message: `Number of jobs fetched: ${jobs.length}`, jobs });
  } catch (err) {
    next(err);
  }
};

/**
 * @description Get all jobs that match the filters
 * @param {Object} req - The request object containing job filters as query parameters.
 * @param {Object} res - The response object.
 * @returns {Object} JSON response with the number of jobs and job details.
 */
export const getFilteredJobs = async (req, res, next) => {
  const { workingTime, jobLocation, seniorityLevel, jobTitle, technicalSkills } = req.query;

  try {
    const filters = {};
    if (workingTime) filters.workingTime = workingTime;
    if (jobLocation) filters.jobLocation = jobLocation;
    if (seniorityLevel) filters.seniorityLevel = seniorityLevel;
    if (jobTitle) filters.jobTitle = { $regex: jobTitle, $options: 'i' };
    if (technicalSkills) filters.technicalSkills = { $in: technicalSkills.split(',') };

    const jobs = await Job.find(filters).populate('addedBy');

    res.status(200).json({ message: `Number of jobs fetched: ${jobs.length}`, jobs });
  } catch (err) {
    next(err);
  }
};

/**
 * @description Apply to a job
 * @param {Object} req - The request object containing application details.
 * @param {Object} res - The response object.
 * @returns {Object} JSON response with success message and application details.
 */
export const applyToJob = async (req, res, next) => {
  const { jobId } = req.params;
  const { userTechSkills, userSoftSkills, userResume } = req.body;

  try {
    const isJobExists = await Job.findById(jobId)
    // Check if the user is authorized
    if (!isJobExists) {
      return next(new ErrorClass("Job Not exists", 404, "Job Not exists"));

    }

    const applicationInstance = new Application({
      jobId,
      userId: req.authUser._id,
      userTechSkills,
      userSoftSkills,
      userResume,
    });

    const newApplication = await applicationInstance.save();
    res.status(201).json({ message: "Application submitted successfully", application: newApplication });
  } catch (err) {
    next(err);
  }
};
