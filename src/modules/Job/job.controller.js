import Job from "../../../DB/models/job.model.js";
import Company from "../../../DB/models/company.model.js";
import Application from "../../../DB/models/application.model.js";
import { ErrorClass } from "../../utils/error-class.utils.js";

/**
 * @description Add a new job
 */
export const addJob = async (req, res, next) => {
  const { jobTitle, jobLocation, workingTime, seniorityLevel, jobDescription, technicalSkills, softSkills, addedBy } = req.body;

  try {
    // Check if the user is authorized
    if (req.authUser.role !== "Company_HR") {
      return next(new ErrorClass("Unauthorized", 403, "Unauthorized"));
    }

    const jobInstance = new Job({
      jobTitle,
      jobLocation,
      workingTime,
      seniorityLevel,
      jobDescription,
      technicalSkills,
      softSkills,
      addedBy: req.authUser._id,
    });

    
    const newJob = await jobInstance.save();
    res.status(201).json({ message: "Job added successfully", job: newJob });
  } catch (err) {
    next(err);
  }
};

/**
 * @description Update job data
 */
export const updateJob = async (req, res, next) => {
  const { jobId } = req.params;
  const { jobTitle, jobLocation, workingTime, seniorityLevel, jobDescription, technicalSkills, softSkills } = req.body;

  try {
    // Check if the user is authorized
    if (req.authUser.role !== "Company_HR") {
      return next(new ErrorClass("Unauthorized", 403, "Unauthorized"));
    }

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
 */
export const deleteJob = async (req, res, next) => {
  const { jobId } = req.params;

  try {
    // Check if the user is authorized
    if (req.authUser.role !== "Company_HR") {
      return next(new ErrorClass("Unauthorized", 403, "Unauthorized"));
    }

    const job = await Job.findById(jobId);

    // Check if the job exists and if the user is the owner
    if (!job || job.addedBy.toString() !== req.authUser._id.toString()) {
      return next(new ErrorClass("Not found or unauthorized", 404, "Not found or unauthorized"));
    }

    await job.deleteOne();
    res.status(200).json({ message: "Job deleted successfully" });
  } catch (err) {
    next(err);
  }
};

/**
 * @description Get all jobs with their company's information
 */
export const getAllJobsWithCompanyInfo = async (req, res, next) => {
  try {
    // Check if the user is authorized

    if (req.authUser.role !== "User" && req.authUser.role !== "Company_HR") {
      return next(new ErrorClass("Unauthorized", 403, "Unauthorized"));
    }

    const jobs = await Job.find().populate('addedBy');

    res.status(200).json({ message:`Number of jobs fetched: ${jobs.length}`, jobs });
  } catch (err) {
    next(err);
  }
};

/**
 * @description Get all jobs for a specific company
 */
export const getJobsForCompany = async (req, res, next) => {
  const { companyName } = req.query;

  try {
    // Check if the user is authorized
    if (req.authUser.role !== "User" && req.authUser.role !== "Company_HR") {
      return next(new ErrorClass("Unauthorized", 403, "Unauthorized"));
    }

    const company = await Company.findOne({ companyName });

    if (!company) {
      return next(new ErrorClass("Company not found", 404, "Company not found"));
    }

    const jobs = await Job.find({ addedBy: company._id });

    res.status(200).json({ message:`Number of jobs fetched: ${jobs.length}`, jobs });
  } catch (err) {
    next(err);
  }
};

/**
 * @description Get all jobs that match the filters
 */
export const getFilteredJobs = async (req, res, next) => {
  const { workingTime, jobLocation, seniorityLevel, jobTitle, technicalSkills } = req.query;

  try {
    // Check if the user is authorized
    if (req.authUser.role !== "User" && req.authUser.role !== "Company_HR") {
      return next(new ErrorClass("Unauthorized", 403, "Unauthorized"));
    }

    const filters = {};
    if (workingTime) filters.workingTime = workingTime;
    if (jobLocation) filters.jobLocation = jobLocation;
    if (seniorityLevel) filters.seniorityLevel = seniorityLevel;
    if (jobTitle) filters.jobTitle = { $regex: jobTitle, $options: 'i' };
    if (technicalSkills) filters.technicalSkills = { $in: technicalSkills.split(',') };

    const jobs = await Job.find(filters).populate('addedBy');

    res.status(200).json({ message:`Number of jobs fetched: ${jobs.length}`, jobs });
  } catch (err) {
    next(err);
  }
};

/**
 * @description Apply to a job
 */
export const applyToJob = async (req, res, next) => {
  const { jobId } = req.params;
  const { userTechSkills, userSoftSkills, userResume } = req.body;

  try {
    // Check if the user is authorized
    if (req.authUser.role !== "User") {
      return next(new ErrorClass("Unauthorized", 403, "Unauthorized"));
    }

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
