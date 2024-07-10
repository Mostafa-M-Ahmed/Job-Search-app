export const systemRoles = {
  USER: "User",
  COMPANY_HR: "Company_HR",
  ADMIN: "admin",
};

const { USER, COMPANY_HR, ADMIN } = systemRoles;

export const roles = {
  USER: [USER],
  COMPANY_HR: [COMPANY_HR],
  ADMIN: [ADMIN],
  USER_ADMIN: [USER, ADMIN],
  USER_COMPANY_HR: [USER, COMPANY_HR],
  COMPANY_HR_ADMIN: [COMPANY_HR, ADMIN],
  GET_ALL_ROLES: [USER, COMPANY_HR, ADMIN]
};
