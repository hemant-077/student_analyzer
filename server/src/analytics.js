export function average(values) {
  if (!values.length) return 0;
  return Math.round(values.reduce((total, value) => total + Number(value), 0) / values.length);
}

export function getStudentAverage(student) {
  return average(Object.values(student.scores));
}

export function getGrade(score) {
  if (score >= 90) return "A+";
  if (score >= 80) return "A";
  if (score >= 70) return "B";
  if (score >= 60) return "C";
  if (score >= 50) return "D";
  return "Needs Help";
}

export function getStatus(student) {
  const avg = getStudentAverage(student);
  if (avg >= 85 && student.attendance >= 90) return "Excellent";
  if (avg < 60 || student.attendance < 75) return "At Risk";
  return "On Track";
}

export function enrichStudent(student) {
  const averageScore = getStudentAverage(student);
  const weakestSubject = Object.entries(student.scores).sort((a, b) => a[1] - b[1])[0][0];
  const strongestSubject = Object.entries(student.scores).sort((a, b) => b[1] - a[1])[0][0];
  const recommendations = [];

  if (averageScore < 60) {
    recommendations.push("Schedule a subject-wise remedial plan.");
  }
  if (student.attendance < 75) {
    recommendations.push("Improve attendance before the next assessment cycle.");
  }
  if (student.scores[weakestSubject] < 65) {
    recommendations.push(`Focus practice on ${weakestSubject}.`);
  }

  return {
    ...student,
    averageScore,
    grade: getGrade(averageScore),
    status: getStatus(student),
    weakestSubject,
    strongestSubject,
    recommendations
  };
}

export function buildAnalytics(students, subjects) {
  const enriched = students.map(enrichStudent);
  const subjectAverages = subjects.map((subject) => ({
    subject,
    average: average(students.map((student) => student.scores[subject]))
  }));
  const classGroups = [...new Set(students.map((student) => student.className))].map((className) => {
    const classStudents = enriched.filter((student) => student.className === className);
    return {
      className,
      students: classStudents.length,
      average: average(classStudents.map((student) => student.averageScore)),
      attendance: average(classStudents.map((student) => student.attendance))
    };
  });
  const distribution = [
    { label: "90-100", count: enriched.filter((student) => student.averageScore >= 90).length },
    {
      label: "80-89",
      count: enriched.filter((student) => student.averageScore >= 80 && student.averageScore < 90).length
    },
    {
      label: "70-79",
      count: enriched.filter((student) => student.averageScore >= 70 && student.averageScore < 80).length
    },
    {
      label: "60-69",
      count: enriched.filter((student) => student.averageScore >= 60 && student.averageScore < 70).length
    },
    { label: "<60", count: enriched.filter((student) => student.averageScore < 60).length }
  ];
  const interventionList = enriched
    .filter((student) => student.status === "At Risk" || student.averageScore < 70 || student.attendance < 80)
    .sort((a, b) => a.averageScore + a.attendance - (b.averageScore + b.attendance))
    .slice(0, 5);

  return {
    totalStudents: students.length,
    classAverage: average(enriched.map((student) => student.averageScore)),
    attendanceAverage: average(enriched.map((student) => student.attendance)),
    atRiskCount: enriched.filter((student) => student.status === "At Risk").length,
    topStudent: enriched.sort((a, b) => b.averageScore - a.averageScore)[0] ?? null,
    subjectAverages,
    classGroups,
    distribution,
    interventionList
  };
}
