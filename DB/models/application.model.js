import mongoose from "mongoose";
const { Schema, model } = mongoose;

const applicationSchema = new Schema(
  {
    jobId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Job',
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    userTechSkills: {
      type: [String],
      default: [],
    },
    userSoftSkills: {
      type: [String],
      default: [],
    },
    userResume: {
      type: String,
      required: true,
    },
  },
  { timestamps: true, versionKey: "version_key" }
);

const Application = model("Application", applicationSchema);
export default Application;
