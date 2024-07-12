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
    host: process.env.NODE_MAILER_HOST, // smtp.gmail.com
    port: process.env.NODE_MAILER_PORT, //587,25
    secure: false, // true , false
    service: process.env.NODE_MAILER_SERVICE,
    auth: {
      user: process.env.NODE_MAILER_USER, // app
      pass: process.env.NODE_MAILER_PASS, // app-password
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
