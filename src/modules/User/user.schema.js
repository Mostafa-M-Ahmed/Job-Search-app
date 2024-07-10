import Joi from "joi";
import { roles } from "../../utils/system-roles.utils.js";
import { systemRoles } from "../../utils/system-roles.utils.js";

const roleValues = Object.values(systemRoles).concat(['User', 'Company_HR']);

export const SignUpSchema = {
  body: Joi.object({
    firstName: Joi.string().min(3).max(30).alphanum().required(),
    lastName: Joi.string().min(3).max(30).alphanum().required(),
    email: Joi.string().required().email({
      minDomainSegments: 2,
      maxDomainSegments: 4,
      tlds: { allow: ["com", "net", "org"] },
    }),
    password: Joi.string()
      .pattern(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[$!%*?&])[A-Za-z\d$!%*?&]{8,}$/
      )
      .required()
      .messages({
        "string.pattern.base":
          "Password must have at least one lowercase letter, one uppercase letter, one number and one special character",
        "any.required": "You need to provide a password",
        "string.min": "Password should have a minimum length of 3 characters",
      }),
    recoveryEmail: Joi.string().email({
      minDomainSegments: 2,
      maxDomainSegments: 4,
      tlds: { allow: ["com", "net", "org"] },
    }),
    DOB: Joi.date()
      .iso()
      .less('now')
      .required()
      .messages({
        'date.base': 'Date of Birth must be a valid date',
        'date.less': 'Date of Birth must be in the past',
        'any.required': 'Date of Birth is required'
      }),
    mobileNumber: Joi.string()
      .pattern(/^\+?[0-9\s\-()]{7,15}$/)
      .required()
      .messages({
        'string.pattern.base': 'Mobile Number must be a valid phone number',
        'string.min': 'Mobile Number must be at least 7 characters long',
        'string.max': 'Mobile Number must be at most 15 characters long',
        'any.required': 'Mobile Number is required'
      }),
      role: Joi.string().valid(...roleValues).default('User')
  }),
};

export const SignInSchema = {
  body: Joi.object({
    credential: Joi.alternatives().try(
      Joi.string().email(),
      Joi.string().pattern(/^\+?[0-9\s\-()]{7,15}$/)
    ).required(),
    password: Joi.string().required(),
  })
};


export const UpdateUserSchema = {
  body: Joi.object({
    email: Joi.string().email(),
    mobileNumber: Joi.string().pattern(/^\+?[1-9]\d{1,14}$/),
    recoveryEmail: Joi.string().email(),
    DOB: Joi.date(),
    lastName: Joi.string().min(3).max(30).alphanum(),
    firstName: Joi.string().min(3).max(30).alphanum(),
  }).or('email', 'mobileNumber', 'recoveryEmail', 'DOB', 'lastName', 'firstName')
};

export const UpdatePasswordSchema = {
  body: Joi.object({
    oldPassword: Joi.string().required(),
    newPassword: Joi.string()
      .pattern(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[$!%*?&])[A-Za-z\d$!%*?&]{8,}$/
      )
      .required()
      .messages({
        "string.pattern.base": "Password must have at least one lowercase letter, one uppercase letter, one number and one special character",
        "any.required": "You need to provide a password",
        "string.min": "Password should have a minimum length of 3 characters",
      }),
  })
};

export const ForgotPasswordSchema = {
  body: Joi.object({
    email: Joi.string().email({
      minDomainSegments: 2,
      maxDomainSegments: 4,
      tlds: { allow: ["com", "net", "org"] },
    }),
  })
};

export const ResetPasswordSchema = Joi.object({
  newPassword: Joi.string().min(6).required(),
});