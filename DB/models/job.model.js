import mongoose from "mongoose";
const { Schema, model } = mongoose;

const jobSchema = new Schema(
  {
    jobTitle: {
      type: String,
      required: true,
      trim: true,
    },
    jobLocation: {
      type: String,
      enum: ["onsite", "remotely", "hybrid"],
      default: "onsite",
    },
    workingTime: {
      type: String,
      enum: ["part-time", "full-time"],
      default: "full-time",
    },
    seniorityLevel: {
      type: String,
      enum: ["Junior", "Mid-Level", "Senior", "Team-Lead", "CTO"],
    },
    jobDescription: {
      type: String,
      required: true,
      trim: true,
    },
    technicalSkills: {
      type: [String],
      default: [],
    },
    softSkills: {
      type: [String],
      default: [],
    },
    addedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Company',
      required: true
    },
  },
  { timestamps: true, versionKey: "version_key" }
);

const Job = model("Job", jobSchema);
export default Job;
