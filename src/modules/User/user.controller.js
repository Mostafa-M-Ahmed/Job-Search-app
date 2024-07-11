import jwt from "jsonwebtoken";
import { compareSync, hashSync } from "bcrypt";
import User from "../../../DB/models/user.model.js";
import { sendEmailService } from "../../services/send-email.service.js";
import { ErrorClass } from "../../utils/error-class.utils.js";

/**
 * @description Sign up a new user.
 * @param {Object} req - The request object containing user details.
 * @param {Object} res - The response object to send the result.
 * @returns {Object} A confirmation message and the created user.
 */
export const signUp = async (req, res, next) => {
  const { firstName, lastName, userName, email, password, recoveryEmail, DOB, mobileNumber, role, status } = req.body;

  try {
    const isEmailExists = await User.findOne({ email });
    if (isEmailExists) {
      return next(new ErrorClass("Email already exists", 400, "Email already exists"));
    }

    const isMobileNumberExists = await User.findOne({ mobileNumber });
    if (isMobileNumberExists) {
      return next(new ErrorClass("Mobile number already exists", 400, "Mobile number already exists"));
    }

    const userInstance = new User({
      firstName,
      lastName,
      userName: `${firstName} ${lastName}`,
      email,
      password: hashSync(password, +process.env.SALT_ROUNDS),
      recoveryEmail,
      DOB,
      mobileNumber,
      role,
      status,
    });

    const token = jwt.sign({ _id: userInstance._id }, process.env.CONFIRMATION_SECRET, { expiresIn: "1h" });
    const confirmationLink = `${req.protocol}://${req.headers.host}/user/confirm-email/${token}`;

    const isEmailSent = await sendEmailService({

      to: userInstance.email,
      subject: 'Confirm Your Account',
      textMessage: `
      Dear ${userInstance.firstName},
      Thank you for signing up with us! To complete your registration, please click the link below to confirm your account:
      ${confirmationLink}
      If you did not sign up for this account, please ignore this email.
      Best regards,
      Job Search app`,
      htmlMessage: `
      <html>
      <body style="font-family: Arial, sans-serif; background-color: #f4f4f4; margin: 0; padding: 0;">
        <div style="background-color: #ffffff; margin: 50px auto; padding: 20px; border-radius: 10px; box-shadow: 0 0 10px rgba(0, 0, 0, 0.1); max-width: 600px;">
          <div style="background-color: #4CAF50; color: white; padding: 10px 0; text-align: center; border-top-left-radius: 10px; border-top-right-radius: 10px;">
            <h1 style="margin: 0;">Welcome to Job Search app</h1>
          </div>
          <div style="padding: 20px;">
            <p>Dear ${userInstance.userName},</p>
            <p>Thank you for signing up with us! To complete your registration, please click the link below to confirm your account:</p>
            <p><a href="${confirmationLink}" style="background-color: #4CAF50; color: white; padding: 15px 25px; text-align: center; text-decoration: none; display: inline-block; border-radius: 5px; margin: 20px 0; font-size: 16px;">Confirm Account</a></p>
            <p>If you did not sign up for this account, please ignore this email.</p>
            <p>Best regards,</p>
            <p>Job Search app</p>
          </div>
          <div style="margin-top: 20px; font-size: 12px; color: #999999; text-align: center;">
            <p>If you have any questions, feel free to <a href="mailto:support@jobSearch.com">contact our support team</a>.</p>
          </div>
        </div>
      </body>
      </html>`
    });

    if (isEmailSent.rejected.length) {
      return res.status(400).json({ message: "Email not sent" });
    }

    const newUser = await userInstance.save();
    res.status(201).json({ confirmation: "A confirmation email has been sent!", message: "User created successfully", user: newUser });
  } catch (err) {
    next(err);
  }

};

/**
 * @description Confirm a user's email.
 * @param {Object} req - The request object containing the token.
 * @param {Object} res - The response object to send the result.
 * @returns {Object} A confirmation message.
 */
export const confirmEmail = async (req, res, next) => {
  const { token } = req.params;

  try {
    const { _id } = jwt.verify(token, process.env.CONFIRMATION_SECRET);
    const user = await User.findOneAndUpdate({ _id, isConfirmed: false }, { isConfirmed: true }, { new: true });

    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    res.status(200).json({ message: "Email confirmed" });
  } catch (err) {
    next(err);
  }
};

/**
 * @description Sign in a user.
 * @param {Object} req - The request object containing credentials.
 * @param {Object} res - The response object to send the result.
 * @returns {Object} A success message and a token.
 */
export const login = async (req, res, next) => {
  const { credential, password } = req.body;

  try {
    const user = await User.findOne({
      $or: [{ email: credential }, { mobileNumber: credential }]
    });

    if (!user) {
      return next(new ErrorClass("Invalid credentials", 400, "Invalid credentials"));
    }

    const isMatch = compareSync(password, user.password);
    if (!isMatch) {
      return next(new ErrorClass("Invalid credentials", 400, "Invalid credentials"));
    }

    const token = jwt.sign({ userId: user._id }, process.env.LOGIN_SECRET);

    // update user status
    user.status = "online";
    await user.save();

    res.status(200).json({ message: "User signed in successfully", token });
  } catch (err) {
    next(err);
  }
};

/**
 * @description Update a user's account.
 * @param {Object} req - The request object containing updated user details.
 * @param {Object} res - The response object to send the result.
 * @returns {Object} A success message and the updated user.
 */
export const updateAccount = async (req, res, next) => {
  const { _id } = req.authUser;
  const { email, mobileNumber, recoveryEmail, DOB, lastName, firstName } = req.body;

  try {
    const user = await User.findById(_id);

    if (!user) {
      return next(new ErrorClass("User not found", 404, "User not found"));
    }

    if (email && email !== user.email) {
      const isEmailExists = await User.findOne({ email });
      if (isEmailExists) {
        return next(new ErrorClass("Email already exists", 400, "Email already exists"));
      }
      user.email = email;
    }

    if (mobileNumber && mobileNumber !== user.mobileNumber) {
      const isMobileNumberExists = await User.findOne({ mobileNumber });
      if (isMobileNumberExists) {
        return next(new ErrorClass("Mobile number already exists", 400, "Mobile number already exists"));
      }
      user.mobileNumber = mobileNumber;
    }

    if (recoveryEmail) user.recoveryEmail = recoveryEmail;
    if (DOB) user.DOB = DOB;
    if (lastName) user.lastName = lastName;
    if (firstName) user.firstName = firstName;
    user.version_key += 1;

    await user.save();
    res.status(200).json({ message: "User updated successfully", user });
  } catch (err) {
    next(err);
  }
};

/**
 * @description Delete a user's account.
 * @param {Object} req - The request object containing the user ID.
 * @param {Object} res - The response object to send the result.
 * @returns {Object} A success message.
 */
export const deleteAccount = async (req, res, next) => {
  const { _id } = req.authUser;

  try {
    const user = await User.findByIdAndDelete(_id);

    if (!user) {
      return next(new ErrorClass("User not found", 404, "User not found"));
    }

    res.status(200).json({ message: "User account deleted successfully" });
  } catch (err) {
    next(err);
  }
};

/**
 * @description Get a user's account data.
 * @param {Object} req - The request object containing the user ID.
 * @param {Object} res - The response object to send the result.
 * @returns {Object} The user's account data.
 */
export const getAccountData = async (req, res, next) => {
  const { _id } = req.authUser;
  try {
    const user = await User.findById(_id).select('-password');

    if (!user) {
      return next(new ErrorClass("User not found", 404, "User not found"));
    }

    res.status(200).json({ message: "User account data fetched successfully", user });
  } catch (err) {
    next(err);
  }
};

/**
 * @description Get profile data for another user.
 * @param {Object} req - The request object containing the user ID.
 * @param {Object} res - The response object to send the result.
 * @returns {Object} The user's profile data.
 */
export const getProfileData = async (req, res, next) => {
  const { _id } = req.params;

  try {
    const user = await User.findById(_id).select('-password');

    if (!user) {
      return next(new ErrorClass("User not found", 404, "User not found"));
    }

    res.status(200).json({ message: "User profile data fetched successfully", user });
  } catch (err) {
    next(err);
  }
};

/**
 * @description Update a user's password.
 * @param {Object} req - The request object containing the old and new passwords.
 * @param {Object} res - The response object to send the result.
 * @returns {Object} A success message.
 */
export const updatePassword = async (req, res, next) => {
  const { _id } = req.authUser;
  const { oldPassword, newPassword } = req.body;

  try {
    const user = await User.findById(_id);

    if (!user) {
      return next(new ErrorClass("User not found", 404, "User not found", "user.controller.updatePassword.user"));
    }

    const isMatch = compareSync(oldPassword, user.password);
    if (!isMatch) {
      return next(new ErrorClass("Invalid old password", 400, "Invalid old password", "user.controller.updatePassword.isMatch"));
    }

    user.password = hashSync(newPassword, +process.env.SALT_ROUNDS);
    user.version_key += 1;
    await user.save();

    res.status(200).json({ message: "Password updated successfully" });
  } catch (err) {
    next(err);
  }
};

/**
 * @description Send a password reset email.
 * @param {Object} req - The request object containing the user's email.
 * @param {Object} res - The response object to send the result.
 * @returns {Object} A success message.
 */
export const forgotPassword = async (req, res, next) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return next(new ErrorClass("User not found", 404, "User not found"));
    }

    const token = jwt.sign({ _id: user._id }, process.env.RESET_PASSWORD_SECRET, { expiresIn: "15m" });
    const resetLink = `${req.protocol}://${req.headers.host}/user/reset-password/${token}`;

    await sendEmailService({
      to: email,
      subject: "Reset Your Password",
      textMessage: `
        Dear ${user.firstName},
        To reset your password, please click the link below:
        ${resetLink}
        If you did not request a password reset, please ignore this email.
        Best regards,
        Job Search app`,
      htmlMessage: `
        <html>
        <body style="font-family: Arial, sans-serif; background-color: #f4f4f4; margin: 0; padding: 0;">
          <div style="background-color: #ffffff; margin: 50px auto; padding: 20px; border-radius: 10px; box-shadow: 0 0 10px rgba(0, 0, 0, 0.1); max-width: 600px;">
            <div style="background-color: #4CAF50; color: white; padding: 10px 0; text-align: center; border-top-left-radius: 10px; border-top-right-radius: 10px;">
              <h1 style="margin: 0;">Reset Your Password</h1>
            </div>
            <div style="padding: 20px;">
              <p>Dear ${user.firstName},</p>
              <p>To reset your password, please click the link below:</p>
              <p><a href="${resetLink}" style="background-color: #4CAF50; color: white; padding: 15px 25px; text-align: center; text-decoration: none; display: inline-block; border-radius: 5px; margin: 20px 0; font-size: 16px;">Reset Password</a></p>
              <p>If you did not request a password reset, please ignore this email.</p>
              <p>Best regards,</p>
              <p>Job Search app</p>
            </div>
            <div style="margin-top: 20px; font-size: 12px; color: #999999; text-align: center;">
              <p>If you have any questions, feel free to <a href="mailto:support@jobSearch.com">contact our support team</a>.</p>
            </div>
          </div>
        </body>
        </html>`
    });

    res.status(200).json({ message: "Password reset email sent" });
  } catch (err) {
    next(err);
  }
};

/**
 * @description Reset a user's password.
 * @param {Object} req - The request object containing the token and new password.
 * @param {Object} res - The response object to send the result.
 * @returns {Object} A success message.
 */
export const resetPassword = async (req, res, next) => {
  const { token } = req.params;
  const { newPassword } = req.body;

  try {
    const { _id } = jwt.verify(token, process.env.RESET_PASSWORD_SECRET);
    const hashedPassword = hashSync(newPassword, +process.env.SALT_ROUNDS);

    const user = await User.findByIdAndUpdate(
      _id,
      { password: hashedPassword },
      { new: true }
    );

    if (!user) {
      return next(new ErrorClass("User not found", 404, "User not found"));
    }

    res.status(200).json({ message: "Password reset successfully" });
  } catch (err) {
    next(err);
  }
};

/**
 * @description Get all accounts associated with a specific recovery email.
 * @param {Object} req - The request object containing the recovery email.
 * @param {Object} res - The response object to send the result.
 * @returns {Object} A message and the list of users.
 */
export const getAccountsByRecoveryEmail = async (req, res, next) => {
  const { recoveryEmail } = req.params;

  try {
    const users = await User.find({ recoveryEmail }).select('-password');

    if (!users.length) {
      return next(new ErrorClass("No accounts found for the provided recovery email", 404, "No accounts found", "user.controller.getAccountsByRecoveryEmail"));
    }

    res.status(200).json({ message: users.length + " accounts fetched successfully", users });
  } catch (err) {
    next(err);
  }
};