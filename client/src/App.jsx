import { useCallback, useEffect, useMemo, useState } from "react";
import { createStudent, deleteStudent, getAnalytics, getOptions, getStudents, updateStudent } from "./api";

const defaultScores = {
  Math: 70,
  Science: 70,
  English: 70,
  Computer: 70,
  Social: 70
};

function StatCard({ label, value, hint }) {
  return (
    <section className="stat-card">
      <span>{label}</span>
      <strong>{value}</strong>
      <small>{hint}</small>
    </section>
  );
}

function BarList({ items, labelKey, valueKey, max = 100 }) {
  return (
    <div className="bar-list">
      {items.map((item) => (
        <div className="bar-row" key={item[labelKey]}>
          <div className="bar-meta">
            <span>{item[labelKey]}</span>
            <strong>{item[valueKey]}{valueKey === "count" ? "" : "%"}</strong>
          </div>
          <div className="bar-track" aria-hidden="true">
            <div className="bar-fill" style={{ width: `${Math.min((item[valueKey] / max) * 100, 100)}%` }} />
          </div>
        </div>
      ))}
    </div>
  );
}

function StudentForm({ subjects, onAdd, editingStudent, onUpdate, onCancelEdit }) {
  const [form, setForm] = useState({
    name: "",
    className: "10-A",
    attendance: 85,
    scores: defaultScores
  });
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (editingStudent) {
      setForm({
        name: editingStudent.name,
        className: editingStudent.className,
        attendance: editingStudent.attendance,
        scores: editingStudent.scores
      });
      setMessage("");
    }
  }, [editingStudent]);

  function resetForm() {
    setForm({
      name: "",
      className: "10-A",
      attendance: 85,
      scores: defaultScores
    });
  }

  function updateScore(subject, value) {
    setForm((current) => ({
      ...current,
      scores: {
        ...current.scores,
        [subject]: value
      }
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setMessage("");

    try {
      if (editingStudent) {
        await onUpdate(editingStudent.id, form);
        setMessage("Student updated successfully.");
      } else {
        await onAdd(form);
        setMessage("Student added successfully.");
      }
      resetForm();
    } catch (error) {
      setMessage(error.message);
    }
  }

  return (
    <form className="panel form-panel" onSubmit={handleSubmit}>
      <div className="panel-heading">
        <div>
          <p className="eyebrow">{editingStudent ? "Update record" : "New record"}</p>
          <h2>{editingStudent ? "Edit Student" : "Add Student"}</h2>
        </div>
        <div className="button-pair">
          {editingStudent ? (
            <button className="secondary-button" type="button" onClick={onCancelEdit}>
              Cancel
            </button>
          ) : null}
          <button className="primary-button" type="submit">
            {editingStudent ? "Save" : "Add"}
          </button>
        </div>
      </div>

      <label>
        Student name
        <input
          value={form.name}
          onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
          placeholder="Enter full name"
          required
        />
      </label>

      <div className="field-grid">
        <label>
          Class
          <select
            value={form.className}
            onChange={(event) => setForm((current) => ({ ...current, className: event.target.value }))}
          >
            <option>10-A</option>
            <option>10-B</option>
            <option>10-C</option>
            <option>11-A</option>
            <option>11-B</option>
          </select>
        </label>
        <label>
          Attendance %
          <input
            type="number"
            min="0"
            max="100"
            value={form.attendance}
            onChange={(event) => setForm((current) => ({ ...current, attendance: event.target.value }))}
            required
          />
        </label>
      </div>

      <div className="score-grid">
        {subjects.map((subject) => (
          <label key={subject}>
            {subject}
            <input
              type="number"
              min="0"
              max="100"
              value={form.scores[subject]}
              onChange={(event) => updateScore(subject, event.target.value)}
              required
            />
          </label>
        ))}
      </div>

      {message ? <p className="form-message">{message}</p> : null}
    </form>
  );
}

function StudentTable({ students, onDelete, onEdit, onSelect }) {
  return (
    <section className="panel table-panel">
      <div className="panel-heading">
        <div>
          <p className="eyebrow">Ranked list</p>
          <h2>Student Performance</h2>
        </div>
        <span className="record-count">{students.length} records</span>
      </div>
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Student</th>
              <th>Class</th>
              <th>Average</th>
              <th>Grade</th>
              <th>Attendance</th>
              <th>Status</th>
              <th>Focus</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {students.map((student) => (
              <tr key={student.id}>
                <td>
                  <button className="link-button" type="button" onClick={() => onSelect(student)}>
                    {student.name}
                  </button>
                  <span>{student.id}</span>
                </td>
                <td>{student.className}</td>
                <td>{student.averageScore}%</td>
                <td>{student.grade}</td>
                <td>{student.attendance}%</td>
                <td>
                  <span className={`status ${student.status.toLowerCase().replaceAll(" ", "-")}`}>
                    {student.status}
                  </span>
                </td>
                <td>{student.weakestSubject}</td>
                <td>
                  <div className="row-actions">
                    <button className="text-button" type="button" onClick={() => onEdit(student)}>
                      Edit
                    </button>
                    <button className="icon-button" type="button" onClick={() => onDelete(student.id)} title="Delete">
                      x
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function DetailPanel({ student }) {
  if (!student) {
    return (
      <section className="panel detail-panel">
        <p className="eyebrow">Student profile</p>
        <h2>Select a Student</h2>
        <p className="muted">Click a student name in the table to see subject scores and recommendations.</p>
      </section>
    );
  }

  return (
    <section className="panel detail-panel">
      <p className="eyebrow">Student profile</p>
      <div className="detail-header">
        <div>
          <h2>{student.name}</h2>
          <p>{student.id} | {student.className}</p>
        </div>
        <span className={`status ${student.status.toLowerCase().replaceAll(" ", "-")}`}>{student.status}</span>
      </div>
      <div className="mini-stats">
        <span>Avg <strong>{student.averageScore}%</strong></span>
        <span>Grade <strong>{student.grade}</strong></span>
        <span>Attendance <strong>{student.attendance}%</strong></span>
      </div>
      <BarList items={Object.entries(student.scores).map(([subject, score]) => ({ subject, score }))} labelKey="subject" valueKey="score" />
      <div className="recommendations">
        <h3>Recommendations</h3>
        {(student.recommendations?.length ? student.recommendations : ["Keep the current learning rhythm going."]).map(
          (item) => (
            <p key={item}>{item}</p>
          )
        )}
      </div>
    </section>
  );
}

function exportStudents(students) {
  const headers = ["ID", "Name", "Class", "Average", "Grade", "Attendance", "Status", "Weakest Subject"];
  const rows = students.map((student) => [
    student.id,
    student.name,
    student.className,
    student.averageScore,
    student.grade,
    student.attendance,
    student.status,
    student.weakestSubject
  ]);
  const csv = [headers, ...rows]
    .map((row) => row.map((value) => `"${String(value).replaceAll('"', '""')}"`).join(","))
    .join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "student-performance.csv";
  link.click();
  URL.revokeObjectURL(url);
}

export default function App() {
  const [students, setStudents] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [options, setOptions] = useState({ subjects: Object.keys(defaultScores), classes: [] });
  const [filters, setFilters] = useState({ search: "", className: "all", status: "all" });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [editingStudent, setEditingStudent] = useState(null);

  const classOptions = useMemo(() => ["all", ...options.classes], [options.classes]);
  const distributionMax = useMemo(() => Math.max(1, ...(analytics?.distribution ?? []).map((item) => item.count)), [analytics]);

  const loadData = useCallback(async (nextFilters) => {
    setError("");
    const [studentData, analyticsData, optionData] = await Promise.all([
      getStudents(nextFilters),
      getAnalytics(),
      getOptions()
    ]);
    setStudents(studentData);
    setAnalytics(analyticsData);
    setOptions(optionData);
    
    // Ensure selected student matches the search or set to the first one
    setSelectedStudent((current) => 
      studentData.find((student) => student.name.includes(nextFilters.search)) ?? studentData[0] ?? null
    );
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      loadData(filters)
        .catch((caughtError) => setError(caughtError.message))
        .finally(() => setLoading(false));
    }, 250);

    return () => window.clearTimeout(timer);
  }, [filters, loadData]);

  async function handleAdd(payload) {
    await createStudent(payload);
    await loadData(filters);
  }

  async function handleUpdate(id, payload) {
    await updateStudent(id, payload);
    setEditingStudent(null);
    await loadData(filters);
  }

  async function handleDelete(id) {
    await deleteStudent(id);
    if (selectedStudent?.id === id) setSelectedStudent(null);
    if (editingStudent?.id === id) setEditingStudent(null);
    await loadData(filters);
  }

  return (
    <main>
      <header className="app-header">
        <div>
          <p className="eyebrow">Academic dashboard</p>
          <h1>Student Performance Analyzer</h1>
        </div>
        <div className="header-actions">
          <input
            aria-label="Search students"
            value={filters.search}
            onChange={(event) => setFilters((current) => ({ ...current, search: event.target.value }))}
            placeholder="Search by name or ID"
          />
          <select
            aria-label="Filter class"
            value={filters.className}
            onChange={(event) => setFilters((current) => ({ ...current, className: event.target.value }))}
          >
            {classOptions.map((className) => (
              <option key={className} value={className}>
                {className === "all" ? "All classes" : className}
              </option>
            ))}
          </select>
          <select
            aria-label="Filter status"
            value={filters.status}
            onChange={(event) => setFilters((current) => ({ ...current, status: event.target.value }))}
          >
            <option value="all">All status</option>
            <option value="Excellent">Excellent</option>
            <option value="On Track">On Track</option>
            <option value="At Risk">At Risk</option>
          </select>
          <button className="secondary-button" type="button" onClick={() => exportStudents(students)}>
            Export CSV
          </button>
        </div>
      </header>

      {error ? <div className="error-banner">{error}</div> : null}

      {loading || !analytics ? (
        <div className="loading">Loading dashboard...</div>
      ) : (
        <>
          <section className="stats-grid">
            <StatCard label="Students" value={analytics.totalStudents} hint="Total records in MongoDB" />
            <StatCard label="Class Average" value={`${analytics.classAverage}%`} hint="Across all subjects" />
            <StatCard label="Attendance" value={`${analytics.attendanceAverage}%`} hint="Overall average" />
            <StatCard label="At Risk" value={analytics.atRiskCount} hint="Need intervention" />
          </section>

          <section className="dashboard-grid advanced-grid">
            <section className="panel">
              <div className="panel-heading">
                <div>
                  <p className="eyebrow">Subject insight</p>
                  <h2>Average Scores</h2>
                </div>
              </div>
              <BarList items={analytics.subjectAverages} labelKey="subject" valueKey="average" />
            </section>

            <section className="panel">
              <div className="panel-heading">
                <div>
                  <p className="eyebrow">Performance bands</p>
                  <h2>Score Distribution</h2>
                </div>
              </div>
              <BarList items={analytics.distribution} labelKey="label" valueKey="count" max={distributionMax} />
            </section>

            <section className="panel intervention-panel">
              <p className="eyebrow">Intervention queue</p>
              <h2>Priority Students</h2>
              {analytics.interventionList.length ? (
                analytics.interventionList.map((student) => (
                  <button className="queue-item" key={student.id} type="button" onClick={() => setSelectedStudent(student)}>
                    <span>{student.name}</span>
                    <strong>{student.averageScore}% | {student.attendance}% att.</strong>
                  </button>
                ))
              ) : (
                <p className="muted">No priority students right now.</p>
              )}
            </section>

            <section className="panel top-student">
              <p className="eyebrow">Top performer</p>
              <h2>{analytics.topStudent.name}</h2>
              <div className="score-ring">
                <span>{analytics.topStudent.averageScore}%</span>
              </div>
              <p>
                Strongest in <strong>{analytics.topStudent.strongestSubject}</strong> with{" "}
                <strong>{analytics.topStudent.attendance}%</strong> attendance.
              </p>
            </section>
          </section>

          <section className="workspace-grid advanced-workspace">
            <div className="side-stack">
              <StudentForm
                subjects={options.subjects}
                onAdd={handleAdd}
                editingStudent={editingStudent}
                onUpdate={handleUpdate}
                onCancelEdit={() => setEditingStudent(null)}
              />
              <DetailPanel student={selectedStudent} />
            </div>
            <StudentTable
              students={students}
              onDelete={handleDelete}
              onEdit={setEditingStudent}
              onSelect={setSelectedStudent}
            />
          </section>
        </>
      )}
    </main>
  );
}