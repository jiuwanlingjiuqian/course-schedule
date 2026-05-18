/**
 * 计算当前是第几周（从1开始）
 * @param {string} startDate - 开学日期 "YYYY-MM-DD"
 * @param {number} totalWeeks - 学期总周数
 * @returns {{ currentWeek: number, isInSemester: boolean }}
 */
export function getCurrentWeek(startDate, totalWeeks) {
  const start = new Date(startDate + 'T00:00:00');
  const now = new Date();
  const diffMs = now - start;
  const diffDays = diffMs / (1000 * 60 * 60 * 24);
  const week = Math.floor(diffDays / 7) + 1;

  if (week < 1) return { currentWeek: 1, isInSemester: false };
  if (week > totalWeeks) return { currentWeek: totalWeeks, isInSemester: false };
  return { currentWeek: week, isInSemester: true };
}

/**
 * 获取当前是星期几（1=周一，7=周日）
 */
export function getTodayDayOfWeek() {
  const day = new Date().getDay();
  return day === 0 ? 7 : day;
}

/**
 * 获取完整的周次列表
 */
export function getWeekList(totalWeeks) {
  return Array.from({ length: totalWeeks }, (_, i) => i + 1);
}

/**
 * 判断某门课在指定周次是否有课
 * 支持 weekPattern: 'all' | 'odd' | 'even'
 */
export function isCourseActiveInWeek(course, week) {
  if (course.weeks && course.weeks.length > 0) {
    return course.weeks.includes(week);
  }
  if (week < course.startWeek || week > course.endWeek) return false;
  if (course.weekPattern === 'odd') return week % 2 === 1;
  if (course.weekPattern === 'even') return week % 2 === 0;
  return true;
}
