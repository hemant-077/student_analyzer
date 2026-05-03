import cors from "cors";
import express from "express";
import { buildAnalytics, enrichStudent } from "./analytics.js";
import { connectDatabase, seedStudentsIfEmpty } from "./db.js";
import { subjects } from "./data.js";
import { Student } from "./models/Student.js";

const app = express();
const port = process.env.PORT || 5001;
const host = process.env.HOST || "127.0.0.1";

app.use(cors());
app.use(express.json());

const publicStudentFields = "-_id -createdAt -updatedAt";

function validateStudentPayload(payload) {
  const { name, className, attendance, scores } = payload;

  if (!name || !className || attendance === undefined || !scores) {
    return { error: "Name, class, attendance, and subject scores are required." };
  }

  const parsedAttendance = Number(attendance);
  if (Number.isNaN(parsedAttendance) || parsedAttendance < 0 || parsedAttendance > 100) {
    return { error: "Attendance must be between 0 and 100." };
  }

  const normalizedScores = {};
  for (const subject of subjects) {
    const score = Number(scores[subject]);
    if (Number.isNaN(score) || score < 0 || score > 100) {
      return { error: `${subject} score must be between 0 and 100.` };
    }
    normalizedScores[subject] = score;
  }

  return {
    value: {
      name: name.trim(),
      className: className.trim(),
      attendance: parsedAttendance,
      scores: normalizedScores
    }
  };
}

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", database: "mongodb" });
});

app.get("/api/students", async (req, res, next) => {
  const { search = "", className = "all", status = "all" } = req.query;
  const normalizedSearch = search.toString().trim().toLowerCase();

  try {
    const studentRecords = await Student.find().select(publicStudentFields).lean();
    const result = studentRecords
      .map(enrichStudent)
      .filter((student) => {
        const matchesSearch =
          student.name.toLowerCase().includes(normalizedSearch) ||
          student.id.toLowerCase().includes(normalizedSearch);
        const matchesClass = className === "all" || student.className === className;
        const matchesStatus = status === "all" || student.status === status;
        return matchesSearch && matchesClass && matchesStatus;
      })
      .sort((a, b) => b.averageScore - a.averageScore);

    res.json(result);
  } catch (error) {
    next(error);
  }
});

app.get("/api/analytics", async (_req, res, next) => {
  try {
    const studentRecords = await Student.find().select(publicStudentFields).lean();
    res.json(buildAnalytics(studentRecords, subjects));
  } catch (error) {
    next(error);
  }
});

app.get("/api/options", async (_req, res, next) => {
  try {
    const studentRecords = await Student.find().select(publicStudentFields).lean();
    res.json({
      subjects,
      classes: [...new Set(studentRecords.map((student) => student.className))]
    });
  } catch (error) {
    next(error);
  }
});

app.post("/api/students", async (req, res, next) => {
  const validation = validateStudentPayload(req.body);
  if (validation.error) {
    return res.status(400).json({ message: validation.error });
  }

  const newStudent = {
    id: `STU-${Date.now().toString().slice(-6)}`,
    ...validation.value
  };

  try {
    const createdStudent = await Student.create(newStudent);
    res.status(201).json(enrichStudent(createdStudent.toJSON()));
  } catch (error) {
    next(error);
  }
});

app.put("/api/students/:id", async (req, res, next) => {
  const validation = validateStudentPayload(req.body);
  if (validation.error) {
    return res.status(400).json({ message: validation.error });
  }

  try {
    const updatedStudent = await Student.findOneAndUpdate({ id: req.params.id }, validation.value, {
      new: true,
      runValidators: true,
      projection: publicStudentFields
    }).lean();

    if (!updatedStudent) {
      return res.status(404).json({ message: "Student not found." });
    }

    res.json(enrichStudent(updatedStudent));
  } catch (error) {
    next(error);
  }
});

app.delete("/api/students/:id", async (req, res, next) => {
  try {
    const deletedStudent = await Student.findOneAndDelete({ id: req.params.id });

    if (!deletedStudent) {
      return res.status(404).json({ message: "Student not found." });
    }

    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

app.use((error, _req, res, _next) => {
  console.error(error);
  res.status(500).json({ message: "Server error. Please check the backend logs." });
});

async function startServer() {
  await connectDatabase();
  await seedStudentsIfEmpty();

  app.listen(port, host, () => {
    console.log(`Student Performance Analyzer API running on http://${host}:${port}`);
  });
}

startServer().catch((error) => {
  console.error("Failed to start server:", error.message);
  process.exit(1);
});
