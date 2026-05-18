import * as XLSX from 'xlsx';

const DAY_KEYWORDS = ['周一', '星期二', '周三', '星期四', '周五', '星期六', '星期日', '周一', '周二', '周三', '周四', '周五', '周六', '周日'];
const DAY_MAP = { '一': 1, '二': 2, '三': 3, '四': 4, '五': 5, '六': 6, '日': 7 };
const COLORS = ['#4A90D9', '#52c41a', '#fa8c16', '#eb2f96', '#722ed1', '#13c2c2', '#f5222d'];

/**
 * Parse an Excel/CSV file and return course objects
 */
export function parseExcelFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
        const rows = XLSX.utils.sheet_to_json(firstSheet, { header: 1, defval: '' });
        const courses = parseRows(rows);
        resolve(courses);
      } catch (err) {
        reject(err);
      }
    };
    reader.readAsArrayBuffer(file);
  });
}

/**
 * Parse pasted text (tab-separated or space-separated table)
 */
export function parsePastedText(text) {
  const lines = text.split('\n').filter(l => l.trim());
  const rows = lines.map(line => {
    // Try tab-separated first, then multiple spaces
    if (line.includes('\t')) {
      return line.split('\t').map(c => c.trim());
    }
    // Split by 2+ spaces (common in copied HTML tables)
    return line.split(/\s{2,}/).map(c => c.trim());
  });
  return parseRows(rows);
}

/**
 * Parse rows (2D array) into course objects
 * Handles two common formats:
 *
 * Format A - List format (most common when copying from academic system):
 *   [课程名, 教师, 时间, 地点, 周次]
 *   e.g. ["高等数学", "张教授", "周一 8:00-9:40", "教三楼301", "1-18周"]
 *
 * Format B - Grid format (full schedule table):
 *   First row: headers with day labels
 *   Subsequent rows: time slot + course info per cell
 */
function parseRows(rows) {
  if (rows.length === 0) return [];

  // Detect format
  const firstRow = rows[0];
  const isGridFormat = firstRow.some(cell =>
    DAY_KEYWORDS.some(kw => cell.includes(kw))
  ) && firstRow.length >= 6;

  if (isGridFormat) {
    return parseGridFormat(rows);
  } else {
    return parseListFormat(rows);
  }
}

/**
 * Parse list-style format: each row is a course
 */
function parseListFormat(rows) {
  const courses = [];

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    // Skip header rows
    if (isHeaderRow(row)) continue;

    const course = extractCourseFromRow(row);
    if (course && course.name) {
      course.id = 'imp_' + Date.now() + '_' + i;
      course.color = COLORS[course.dayOfWeek - 1] || COLORS[0];
      course.startWeek = course.startWeek || 1;
      course.endWeek = course.endWeek || 18;
      course.weeks = course.weeks || [];
      course.teacher = course.teacher || '';
      course.location = course.location || '';
      courses.push(course);
    }
  }

  return courses;
}

/**
 * Parse grid format: time x day table
 */
function parseGridFormat(rows) {
  const courses = [];
  const headers = rows[0];

  // Map column index -> dayOfWeek
  const dayColumns = [];
  for (let col = 0; col < headers.length; col++) {
    const h = headers[col];
    for (const kw of DAY_KEYWORDS) {
      if (h.includes(kw)) {
        // Extract day number
        for (const [char, num] of Object.entries(DAY_MAP)) {
          if (kw.includes(char)) {
            dayColumns.push({ col, dayOfWeek: num });
            break;
          }
        }
        break;
      }
    }
  }

  // Parse each data row
  for (let r = 1; r < rows.length; r++) {
    const row = rows[r];

    // First column might contain time info
    const timeCell = row[0] || '';
    const timeInfo = extractTimeFromCell(timeCell);

    for (const { col, dayOfWeek } of dayColumns) {
      const cell = (row[col] || '').trim();
      if (!cell || cell === '无' || cell === '—') continue;

      // Each cell might contain one or more courses separated by newlines
      const courseTexts = cell.split(/[\n\r]+/).filter(Boolean);

      for (const text of courseTexts) {
        const parts = text.split(/[\s,，、]+/).filter(Boolean);
        if (parts.length < 1) continue;

        const name = parts[0];
        let teacher = '';
        let location = '';
        let startTime = timeInfo?.startTime || '08:00';
        let endTime = timeInfo?.endTime || '09:40';
        let startWeek = 1;
        let endWeek = 18;
        let weekPattern = 'all';
        if (/单周/.test(text)) weekPattern = 'odd';
        if (/双周/.test(text)) weekPattern = 'even';

        // Try to extract info from remaining parts
        for (let p = 1; p < parts.length; p++) {
          const part = parts[p];
          if (/周/.test(part)) {
            const t = extractTimeInfo(part);
            if (t) { startTime = t.startTime; endTime = t.endTime; }
            const w = extractWeekInfo(part);
            if (w) { startWeek = w.startWeek; endWeek = w.endWeek; }
          } else if (/^\d/.test(part) && part.length < 15) {
            location = part;
          } else if (part.length <= 4) {
            teacher = part;
          }
        }

        courses.push({
          id: 'imp_' + Date.now() + '_' + courses.length,
          name, teacher, location, dayOfWeek,
          startTime, endTime, startWeek, endWeek,
          weekPattern,
          weeks: [],
          color: COLORS[dayOfWeek - 1] || COLORS[0],
        });
      }
    }
  }

  return courses;
}

/**
 * Try to extract course info from a single row (list format)
 */
function extractCourseFromRow(row) {
  const cells = row.filter(c => String(c).trim());

  if (cells.length < 2) return null;

  let name = '', teacher = '', location = '', dayOfWeek = 1;
  let startTime = '08:00', endTime = '09:40', startWeek = 1, endWeek = 18;
  let weekPattern = 'all';

  name = String(cells[0]).trim();

  for (let i = 1; i < cells.length; i++) {
    const cell = String(cells[i]).trim();
    if (!cell || cell === '—' || cell === '-') continue;

    if (/单周/.test(cell)) weekPattern = 'odd';
    if (/双周/.test(cell)) weekPattern = 'even';

    const timeInfo = extractTimeInfo(cell);
    if (timeInfo) {
      dayOfWeek = timeInfo.dayOfWeek;
      startTime = timeInfo.startTime;
      endTime = timeInfo.endTime;
      continue;
    }

    const weekInfo = extractWeekInfo(cell);
    if (weekInfo) {
      startWeek = weekInfo.startWeek;
      endWeek = weekInfo.endWeek;
      continue;
    }

    if (/[0-9A-Za-z]/.test(cell) && (
      /楼|区|栋|教|室|堂|馆|院|系|实|验|工/.test(cell) ||
      /^\d{3,}/.test(cell) ||
      /[A-Z]/.test(cell)
    )) {
      location = cell;
      continue;
    }

    if (!teacher && /^[一-鿿]{2,4}$/.test(cell) && cell.length <= 4) {
      teacher = cell;
      continue;
    }
  }

  return { name, teacher, location, dayOfWeek, startTime, endTime, startWeek, endWeek, weekPattern, weeks: [] };
}

function extractTimeInfo(text) {
  // 周一 8:00-9:40  /  星期一 08:00-09:40  /  周一第1-2节  /  周一 1-2节
  const patterns = [
    /周\s*([一二三四五六日])\s*(\d{1,2}):(\d{2})\s*[-~至到]\s*(\d{1,2}):(\d{2})/,
    /星期\s*([一二三四五六日])\s*(\d{1,2}):(\d{2})\s*[-~至到]\s*(\d{1,2}):(\d{2})/,
    /周\s*([一二三四五六日])\s*第?\s*(\d{1,2})\s*[-~至到]\s*(\d{1,2})\s*节?/,
    /星期\s*([一二三四五六日])\s*第?\s*(\d{1,2})\s*[-~至到]\s*(\d{1,2})\s*节?/,
  ];

  for (const pat of patterns) {
    const m = text.match(pat);
    if (m) {
      const day = DAY_MAP[m[1]] || 1;
      let start, end;
      if (m.length === 6) {
        // Time format: HH:MM
        start = `${m[2].padStart(2, '0')}:${m[3].padStart(2, '0')}`;
        end = `${m[4].padStart(2, '0')}:${m[5].padStart(2, '0')}`;
      } else {
        // Section format
        start = sectionToTime(parseInt(m[2]));
        end = sectionToTime(parseInt(m[3]) + 1);
      }
      return { dayOfWeek: day, startTime: start, endTime: end };
    }
  }
  return null;
}

function extractWeekInfo(text) {
  // 1-18周 / 第1-18周 / 1到18周 / 1-16周
  const m = text.match(/第?\s*(\d{1,2})\s*[-~至到]\s*(\d{1,2})\s*周?/);
  if (m) {
    return { startWeek: parseInt(m[1]), endWeek: parseInt(m[2]) };
  }
  return null;
}

function extractTimeFromCell(cell) {
  // Extract time range from a cell like "8:00-9:40" or "第一节"
  const m = cell.match(/(\d{1,2}):(\d{2})\s*[-~至到]\s*(\d{1,2}):(\d{2})/);
  if (m) {
    return {
      startTime: `${m[1].padStart(2, '0')}:${m[2].padStart(2, '0')}`,
      endTime: `${m[3].padStart(2, '0')}:${m[4].padStart(2, '0')}`,
    };
  }
  const sm = cell.match(/第?\s*(\d{1,2})\s*[-~至到]\s*(\d{1,2})\s*节/);
  if (sm) {
    return {
      startTime: sectionToTime(parseInt(sm[1])),
      endTime: sectionToTime(parseInt(sm[2]) + 1),
    };
  }
  return null;
}

function sectionToTime(section) {
  const baseMin = 8 * 60;
  const min = baseMin + (section - 1) * 45 + Math.floor((section - 1) / 2) * 10;
  const h = Math.floor(min / 60);
  const m = min % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

function isHeaderRow(row) {
  const text = row.join(' ');
  return /课程|课表|星期|时间|教师|地点|教室|周次|学分/.test(text) && row.some(c => String(c).length > 0);
}
