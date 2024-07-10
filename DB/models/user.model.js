import mongoose from "mongoose";
import { systemRoles } from "../../src/utils/system-roles.utils.js";
const { Schema, model } = mongoose;

const userSchema = new Schema(
  {
    firstName: {
      type: String,
      trim: true,
      required: true,
      lowercase: true,
      minLength: 3,
    },
    lastName: {
      type: String,
      trim: true,
      required: true,
      lowercase: true,
      minLength: 3,
    },
    userName: {
      type: String,
      default: function() {
        return `${this.firstName}${this.lastName}`;
      },
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
    },
    recoveryEmail: {
      type: String,
      trim: true,
    },
    DOB: {
      type: Date,
      required: true,
    },
    mobileNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    isConfirmed: {
      type: Boolean,
      default: false,
    },
    role: {
      type: String,
      default: "User",
      enum: Object.values(systemRoles).concat(['User', 'Company_HR']),
    },
    status: {
      type: String,
      enum: ['online', 'offline'],
      default: 'offline',
    },
  },
  { timestamps: true, versionKey: "version_key" }
);

const User = model("User", userSchema);
export default User;
