let students = JSON.parse(localStorage.getItem("students")) || [];

/*
====================================================
SAVE STUDENT
====================================================
Now supports:
- id (required for selection)
- scores (array OR string supported safely)
====================================================
*/
function saveStudent(name, scores = [], grade = null) {
  const student = {
    id: Date.now(), // unique ID for linking
    name,
    scores,
    grade,
    date: new Date().toLocaleString()
  };

  students.push(student);
  localStorage.setItem("students", JSON.stringify(students));
}

/*
====================================================
GET ALL STUDENTS
====================================================
*/
function getAllStudents() {
  return JSON.parse(localStorage.getItem("students")) || [];
}

/*
====================================================
GET SINGLE STUDENT
====================================================
*/
function getStudentById(id) {
  const students = getAllStudents();
  return students.find(s => String(s.id) === String(id));
}

/*
====================================================
CORE SCORE NORMALIZER + AVERAGE CALCULATOR
====================================================
This is the FIX that makes EVERYTHING work reliably:
- supports "85%"
- supports "85/100"
- supports numbers
- supports mixed arrays
====================================================
*/
function calculateAverage(scores) {
  if (!scores) return "0.00";

  let clean = [];

  // CASE 1: string input ("85/100" or "85%")
  if (typeof scores === "string") {
    if (scores.includes("/")) {
      const parts = scores.split("/");
      const val = (Number(parts[0]) / Number(parts[1])) * 100;
      return isNaN(val) ? "0.00" : val.toFixed(2);
    }

    const val = Number(scores.replace("%", ""));
    return isNaN(val) ? "0.00" : val.toFixed(2);
  }

  // CASE 2: array input
  if (Array.isArray(scores)) {
    clean = scores.map(v => {
      if (typeof v === "string") {
        if (v.includes("/")) {
          const p = v.split("/");
          return (Number(p[0]) / Number(p[1])) * 100;
        }
        return Number(v.replace("%", ""));
      }
      return Number(v);
    });
  }

  clean = clean.filter(v => !isNaN(v));

  if (clean.length === 0) return "0.00";

  const avg = clean.reduce((a, b) => a + b, 0) / clean.length;

  return avg.toFixed(2);
}

/*
====================================================
GLOBAL STATS (FIXED & STABLE)
====================================================
*/
function getStats() {
  const students = getAllStudents();

  let total = students.length;
  let totalSum = 0;
  let valid = 0;

  students.forEach(s => {
    const avg = Number(calculateAverage(s.scores));

    if (!isNaN(avg) && avg > 0) {
      totalSum += avg;
      valid++;
    }
  });

  return {
    total,
    avg: valid ? Math.round(totalSum / valid) : 0
  };
}

/*
====================================================
STUDENT LIST RENDER
====================================================
*/
function loadStudentList() {
  const container = document.getElementById("studentList");
  const students = getAllStudents();

  container.innerHTML = "";

  if (!students || students.length === 0) {
    container.innerHTML = "<p class='small'>No students found.</p>";
    return;
  }

  students.forEach(student => {
    const div = document.createElement("div");
    div.className = "card student-item fade-in";
    div.style.marginBottom = "10px";

    const avg = calculateAverage(student.scores);

    div.innerHTML = `
      <h4>${student.name}</h4>
      <p class="small">ID: ${student.id}</p>
      <p class="small">Avg: ${avg}%</p>
      <button class="small" onclick="renderStudentDetailInline('${student.id}')">
        View Details →
      </button>
    `;

    container.appendChild(div);
  });
}

/*
====================================================
INLINE STUDENT DETAIL VIEW
====================================================
*/
function renderStudentDetailInline(id) {
  const student = getStudentById(id);

  if (!student) return;

  document.getElementById("studentDetailPanel").style.display = "block";
  document.getElementById("emptyState").style.display = "none";

  // NAME + META
  document.getElementById("studentName").innerText = student.name;
  document.getElementById("studentMeta").innerText =
    `ID: ${student.id} • Grade: ${student.grade || "N/A"} • Date: ${student.date}`;

  // SCORES
  const scoresEl = document.getElementById("studentScores");
  scoresEl.innerHTML = "";

  if (student.scores && student.scores.length > 0) {
    student.scores.forEach((score, index) => {
      const p = document.createElement("p");
      p.className = "small";
      p.innerText = `Exam ${index + 1}: ${score}%`;
      scoresEl.appendChild(p);
    });
  } else {
    scoresEl.innerHTML = "<p class='small'>No OMR results available.</p>";
  }

  // SUMMARY (FIXED ALWAYS SAFE)
  const avg = calculateAverage(student.scores);

  document.getElementById("studentSummary").innerHTML = `
    <p><strong>Average Score:</strong> ${avg}%</p>
    <p><strong>Total Exams:</strong> ${student.scores?.length || 0}</p>
  `;
}

/*
====================================================
FILTER STUDENTS
====================================================
*/
function filterStudents() {
  const input = document.getElementById("studentSearch").value.toLowerCase();
  const items = document.querySelectorAll(".student-item");

  items.forEach(item => {
    const name = item.innerText.toLowerCase();
    item.style.display = name.includes(input) ? "block" : "none";
  });
}