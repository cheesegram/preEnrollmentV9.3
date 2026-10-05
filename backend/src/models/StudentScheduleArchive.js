import mongoose from "mongoose";

const studentScheduleArchiveSchema = new mongoose.Schema(
  {
    studentNumber: { type: String, required: true, trim: true },
    schoolYear: { type: String, trim: true },
    year: { type: String, trim: true },
    section: { type: String, trim: true },
    irregularYear: { type: [String] },
    irregularSection: { type: [String] },
    semester: { type: String, trim: true },
    status: { type: String, trim: true },
    firstName: { type: String, trim: true },
    middleName: { type: String, trim: true },
    lastName: { type: String, trim: true },
    suffix: { type: String, trim: true },
    classes: { type: Array, required: true },
  },
  { timestamps: { createdAt: true, updatedAt: false }, collection: "studentarchive" }
);

export default mongoose.model("StudentScheduleArchive", studentScheduleArchiveSchema);