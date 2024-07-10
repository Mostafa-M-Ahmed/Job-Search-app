import Joi from 'joi';

export const AddCompanySchema = {
  body: Joi.object({
    companyName: Joi.string().required().messages({
      'any.required': 'Company name is required',
    }),
    description: Joi.string().required().messages({
      'any.required': 'Description is required',
    }),
    industry: Joi.string().required().messages({
      'any.required': 'Industry is required',
    }),
    address: Joi.string().required().messages({
      'any.required': 'Address is required',
    }),
    numberOfEmployees: Joi.string().valid(
      '1-10', '11-20', '21-50', '51-100', '101-200', '201-500', '501-1000', '100+'
    ).required().messages({
      'any.required': 'Number of employees is required',
      'any.only': 'Number of employees must be one of the allowed ranges'
    }),
    companyEmail: Joi.string().email().required().messages({
      'any.required': 'Company email is required',
      'string.email': 'Company email must be a valid email address'
    })
  }).options({ presence: 'required' }),
};

export const UpdateCompanySchema = {
  body: Joi.object({
    companyName: Joi.string(),
    description: Joi.string(),
    industry: Joi.string(),
    address: Joi.string(),
    companyHR: Joi.string(),
    numberOfEmployees: Joi.string().valid(
      '1-10', '11-20', '21-50', '51-100', '101-200', '201-500', '501-1000', '1001-5000', '5000+'
    ),
    companyEmail: Joi.string().email(),
  }).or('companyName', 'description', 'industry', 'address', 'numberOfEmployees', 'companyEmail', 'companyHR')
};

export const SearchCompanySchema = {
  query: Joi.object({
    companyName: Joi.string().required().messages({
      'any.required': 'Company name is required for search'
    })
  })
};

export const GetCompanySchema = {
  params: Joi.object({
    companyId: Joi.string().required().messages({
      'any.required': 'Company ID is required'
    })
  })
};
