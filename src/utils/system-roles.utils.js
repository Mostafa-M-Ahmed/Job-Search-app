export const systemRoles = {
  USER: "User",
  COMPANY_HR: "Company_HR"
};

const { USER, COMPANY_HR } = systemRoles;

export const roles = {
  USER: [USER],
  COMPANY_HR: [COMPANY_HR],
  USER_COMPANY_HR: [USER, COMPANY_HR]
};
