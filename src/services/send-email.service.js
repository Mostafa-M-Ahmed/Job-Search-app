import nodemailer from "nodemailer";

/**
 * @param {object} params - object of email params
 * @returns {Promise} - Promise object represents the info of the sent email
 * @description - Send email service
 */
export const sendEmailService = async ({
  to = "",
  subject = "No Reply",
  textMessage = "",
  htmlMessage = "",
  attachments = [],
} = {}) => {
  // configer email ( transporter)
  const transporter = nodemailer.createTransport({
    host: "localhost", // smtp.gmail.com
    port: 587, //587,25
    secure: false, // true , false
    service: "gmail",
    auth: {
      user: "mostafaoffa45@gmail.com", // app
      pass: "ktpwkwlxmpjvltyq", // app-password
    },
  });
  // configer message ( mail )
  const info = await transporter.sendMail({
    from: "No Reply <mostafaoffa45@gmail.com>",
    to,
    subject,
    text: textMessage,
    html: htmlMessage,
    attachments,
  });
  
  return info;
};
