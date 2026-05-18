const KEYS = {
  courses: 'schedule_courses',
  semester: 'schedule_semester',
};

export function loadCourses() {
  try {
    const raw = localStorage.getItem(KEYS.courses);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveCourses(courses) {
  localStorage.setItem(KEYS.courses, JSON.stringify(courses));
}

export function loadSemester() {
  try {
    const raw = localStorage.getItem(KEYS.semester);
    return raw ? JSON.parse(raw) : getDefaultSemester();
  } catch {
    return getDefaultSemester();
  }
}

export function saveSemester(semester) {
  localStorage.setItem(KEYS.semester, JSON.stringify(semester));
}

export function exportAllData() {
  return {
    courses: loadCourses(),
    semester: loadSemester(),
    exportDate: new Date().toISOString(),
  };
}

export function importAllData(json) {
  const data = typeof json === 'string' ? JSON.parse(json) : json;
  if (data.courses) saveCourses(data.courses);
  if (data.semester) saveSemester(data.semester);
}

export function clearAllData() {
  localStorage.removeItem(KEYS.courses);
  localStorage.removeItem(KEYS.semester);
}

function getDefaultSemester() {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1;
  // Guess semester: Feb-Jul is spring, Sep-Jan is fall
  const isSpring = month >= 2 && month <= 7;
  return {
    name: `${year}${isSpring ? '春' : '秋'}季学期`,
    startDate: isSpring ? `${year}-02-24` : `${year}-09-01`,
    totalWeeks: 18,
  };
}
