import mongoose from "mongoose";

const studentSchema = new mongoose.Schema(
  {
    id: {
      type: String,
      required: true,
      unique: true,
      index: true
    },
    name: {
      type: String,
      required: true,
      trim: true
    },
    className: {
      type: String,
      required: true,
      trim: true
    },
    attendance: {
      type: Number,
      required: true,
      min: 0,
      max: 100
    },
    scores: {
      Math: { type: Number, required: true, min: 0, max: 100 },
      Science: { type: Number, required: true, min: 0, max: 100 },
      English: { type: Number, required: true, min: 0, max: 100 },
      Computer: { type: Number, required: true, min: 0, max: 100 },
      Social: { type: Number, required: true, min: 0, max: 100 }
    }
  },
  {
    timestamps: true,
    versionKey: false
  }
);

studentSchema.set("toJSON", {
  transform: (_document, returnedObject) => {
    delete returnedObject._id;
    delete returnedObject.createdAt;
    delete returnedObject.updatedAt;
    return returnedObject;
  }
});

export const Student = mongoose.model("Student", studentSchema);
