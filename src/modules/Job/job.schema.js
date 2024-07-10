import Joi from "joi";


export const AddJobSchema = {
  body: Joi.object({
    jobTitle: Joi.string().min(3).max(100).required().messages({
      "string.base": "Job title should be a type of string",
      "string.empty": "Job title cannot be an empty field",
      "string.min": "Job title should have a minimum length of 3",
      "string.max": "Job title should have a maximum length of 100",
      "any.required": "Job title is required",
    }),
    jobLocation: Joi.string().valid('onsite', 'remotely', 'hybrid').required().messages({
      "any.only": "Job location must be one of 'onsite', 'remotely', or 'hybrid'",
      "any.required": "Job location is required",
    }),
    workingTime: Joi.string().valid('part-time', 'full-time').required().messages({
      "any.only": "Working time must be either 'part-time' or 'full-time'",
      "any.required": "Working time is required",
    }),
    seniorityLevel: Joi.string().valid('Junior', 'Mid-Level', 'Senior', 'Team-Lead', 'CTO').required().messages({
      "any.only": "Seniority level must be one of 'Junior', 'Mid-Level', 'Senior', 'Team-Lead', or 'CTO'",
      "any.required": "Seniority level is required",
    }),
    jobDescription: Joi.string().min(10).max(1000).required().messages({
      "string.base": "Job description should be a type of string",
      "string.empty": "Job description cannot be an empty field",
      "string.min": "Job description should have a minimum length of 10",
      "string.max": "Job description should have a maximum length of 1000",
      "any.required": "Job description is required",
    }),
    technicalSkills: Joi.array().items(Joi.string().min(1)).required().messages({
      "array.base": "Technical skills should be an array of strings",
      "array.includes": "Technical skills should not be empty",
      "any.required": "Technical skills are required",
    }),
    softSkills: Joi.array().items(Joi.string().min(1)).required().messages({
      "array.base": "Soft skills should be an array of strings",
      "array.includes": "Soft skills should not be empty",
      "any.required": "Soft skills are required",
    }),
    addedBy: Joi.string().messages({
      "string.base": "AddedBy should be a type of string",
      "string.empty": "AddedBy cannot be an empty field",
      "any.required": "AddedBy is required",
    }),
  })
};

export const UpdateJobSchema = {
  body: Joi.object({
    jobTitle: Joi.string().min(3).max(100).messages({
      "string.base": "Job title should be a type of string",
      "string.empty": "Job title cannot be an empty field",
      "string.min": "Job title should have a minimum length of 3",
      "string.max": "Job title should have a maximum length of 100",
    }),
    jobLocation: Joi.string().valid('onsite', 'remotely', 'hybrid').messages({
      "any.only": "Job location must be one of 'onsite', 'remotely', or 'hybrid'",
    }),
    workingTime: Joi.string().valid('part-time', 'full-time').messages({
      "any.only": "Working time must be either 'part-time' or 'full-time'",
    }),
    seniorityLevel: Joi.string().valid('Junior', 'Mid-Level', 'Senior', 'Team-Lead', 'CTO').messages({
      "any.only": "Seniority level must be one of 'Junior', 'Mid-Level', 'Senior', 'Team-Lead', or 'CTO'",
    }),
    jobDescription: Joi.string().min(10).max(1000).messages({
      "string.base": "Job description should be a type of string",
      "string.empty": "Job description cannot be an empty field",
      "string.min": "Job description should have a minimum length of 10",
      "string.max": "Job description should have a maximum length of 1000",
    }),
    technicalSkills: Joi.array().items(Joi.string().min(1)).messages({
      "array.base": "Technical skills should be an array of strings",
      "array.includes": "Technical skills should not be empty",
    }),
    softSkills: Joi.array().items(Joi.string().min(1)).messages({
      "array.base": "Soft skills should be an array of strings",
      "array.includes": "Soft skills should not be empty",
    }),
  }).or('jobTitle', 'jobLocation', 'workingTime', 'seniorityLevel', 'jobDescription', 'technicalSkills', 'softSkills').messages({
    "object.missing": "At least one field must be updated",
  }),
};

export const FilterJobsSchema = {
  query: Joi.object({
    workingTime: Joi.string().valid('part-time', 'full-time').messages({
      "any.only": "Working time must be either 'part-time' or 'full-time'",
    }),
    jobLocation: Joi.string().valid('onsite', 'remotely', 'hybrid').messages({
      "any.only": "Job location must be one of 'onsite', 'remotely', or 'hybrid'",
    }),
    seniorityLevel: Joi.string().valid('Junior', 'Mid-Level', 'Senior', 'Team-Lead', 'CTO').messages({
      "any.only": "Seniority level must be one of 'Junior', 'Mid-Level', 'Senior', 'Team-Lead', or 'CTO'",
    }),
    jobTitle: Joi.string().min(3).max(100).messages({
      "string.base": "Job title should be a type of string",
      "string.min": "Job title should have a minimum length of 3",
      "string.max": "Job title should have a maximum length of 100",
    }),
    technicalSkills: Joi.string(),
  }).or('workingTime', 'jobLocation', 'seniorityLevel', 'jobTitle', 'technicalSkills').messages({
    "object.missing": "At least one filter must be applied",
  }),
};

export const ApplyJobSchema = {
  body: Joi.object({
    jobId: Joi.string().required().messages({
      "string.base": "Job ID should be a type of string",
      "string.empty": "Job ID cannot be an empty field",
      "any.required": "Job ID is required",
    }),
    applicantId: Joi.string().required().messages({
      "string.base": "Applicant ID should be a type of string",
      "string.empty": "Applicant ID cannot be an empty field",
      "any.required": "Applicant ID is required",
    }),
  }).options({ presence: "required" }),
};
