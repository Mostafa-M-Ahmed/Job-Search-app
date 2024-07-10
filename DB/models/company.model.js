import mongoose from "mongoose";
const { Schema, model } = mongoose;

const companySchema = new Schema(
  {
    companyName: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    industry: {
      type: String,
      trim: true,
    },
    address: {
      type: String,
      trim: true,
    },
    numberOfEmployees: {
      type: String,
      required: true,
      enum: [
        '1-10',
        '11-20',
        '21-50',
        '51-100',
        '101-200',
        '201-500',
        '501-1000',
        '1000+',
      ],
    },
    companyEmail: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    companyHR: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
  },
  { timestamps: true, versionKey: "version_key" }
);

const Company = model("Company", companySchema);
export default Company;
