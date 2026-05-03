let students = JSON.parse(localStorage.getItem("students")) || [];

function saveStudent(name, score){
  students.push({
    name,
    score,
    date: new Date().toLocaleString()
  });

  localStorage.setItem("students", JSON.stringify(students));
}

function getStats(){
  let total = students.length;
  let avg = 0;

  students.forEach(s=>{
    let parts = s.score.split("/");
    avg += parts[0]/parts[1];
  });

  avg = total ? Math.round((avg/total)*100) : 0;

  return { total, avg };
}

function renderStudents(containerId){
  let list = document.getElementById(containerId);
  if(!list) return;

  list.innerHTML = "";

  students.forEach(s=>{
    list.innerHTML += `
      <div class="card">
        <b>${s.name}</b><br>
        Score: ${s.score}<br>
        <span class="small">${s.date}</span>
      </div>`;
  });
}

function renderStudentDetail(id) {
  let students = JSON.parse(localStorage.getItem("students")) || [];

  let student = students.find(s => s.id == id);

  if (!student) {
    document.getElementById("studentName").innerText = "Student Not Found";
    document.getElementById("studentMeta").innerText = "No matching record found.";
    return;
  }

  // Header info
  document.getElementById("studentName").innerText = student.name;
  document.getElementById("studentMeta").innerText =
    "ID: " + student.id + " • Grade: " + (student.grade || "N/A");

  // Scores (example structure)
  let scoresHTML = "";

  if (student.scores && student.scores.length > 0) {
    student.scores.forEach((score, index) => {
      scoresHTML += `
        <div class="score-item">
          <strong>Test ${index + 1}:</strong> ${score}%<br>
        </div>
      `;
    });
  } else {
    scoresHTML = "<p class='small'>No OMR results available.</p>";
  }

  document.getElementById("studentScores").innerHTML = scoresHTML;

  // Summary
  let avg = student.scores?.length
    ? (student.scores.reduce((a, b) => a + b, 0) / student.scores.length).toFixed(2)
    : 0;

  document.getElementById("studentSummary").innerHTML = `
    <p><strong>Average Score:</strong> ${avg}%</p>
    <p><strong>Total Exams:</strong> ${student.scores?.length || 0}</p>
  `;
}