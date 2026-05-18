import Tesseract from 'tesseract.js';

/**
 * 用 Tesseract.js 识别图片中的文字
 */
export async function recognizeImage(image, onProgress) {
  const { data } = await Tesseract.recognize(image, 'chi_sim+eng', {
    logger: (m) => {
      if (m.status === 'recognizing text' && onProgress) {
        onProgress(Math.round(m.progress * 100));
      }
    },
  });
  const text = data.text;
  const lines = text
    .split('\n')
    .map(l => l.trim())
    .filter(Boolean);
  return { text, lines };
}

/**
 * 尝试从 OCR 结果中解析出课程信息
 * 支持多种常见格式：
 *   格式1: 课程名 / 教师 / 周X 第N-M节 / 地点
 *   格式2: 课程名 \n 教师 \n 周X XX:XX-XX:XX \n 地点
 *   格式3: 课程名 | 教师 | 周X XX:XX-XX:XX | 地点
 */
export function parseCoursesFromOCR(lines) {
  const results = [];
  const DAY_MAP = { '一': 1, '二': 2, '三': 3, '四': 4, '五': 5, '六': 6, '日': 7 };

  // 颜色池
  const colors = ['#4A90D9', '#52c41a', '#fa8c16', '#eb2f96', '#722ed1', '#13c2c2', '#f5222d'];

  // 策略1: 尝试按分隔符 | 或 / 拆分
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const parts = line.split(/[\|\/]/).map(p => p.trim()).filter(Boolean);
    if (parts.length >= 3) {
      const maybe = tryParseParts(parts, DAY_MAP);
      if (maybe) {
        maybe.id = 'ocr_' + Date.now() + '_' + results.length;
        maybe.color = colors[maybe.dayOfWeek - 1] || colors[0];
        results.push(maybe);
        continue;
      }
    }
  }

  // 策略2: 逐行扫描，找时间和星期模式
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const result = tryParseLine(line, lines, i, DAY_MAP);
    if (result) {
      result.id = 'ocr_' + Date.now() + '_' + results.length;
      result.color = colors[result.dayOfWeek - 1] || colors[0];
      // 避免重复
      if (!results.find(r => r.name === result.name && r.dayOfWeek === result.dayOfWeek && r.startTime === result.startTime)) {
        results.push(result);
      }
    }
  }

  return results;
}

function tryParseParts(parts, DAY_MAP) {
  let name = '', teacher = '', location = '', dayOfWeek = 0, startTime = '', endTime = '';

  for (const part of parts) {
    const timeInfo = extractTimeInfo(part, DAY_MAP);
    if (timeInfo) {
      dayOfWeek = timeInfo.dayOfWeek;
      startTime = timeInfo.startTime;
      endTime = timeInfo.endTime;
    } else if (/[一-龥]{2,4}(楼|区|栋|教|室|堂|馆|院|系)/.test(part) || /[A-Za-z]?\d{3,}[教室]?/.test(part)) {
      location = part;
    } else if (part.length <= 6 && /^[一-龥]{2,4}$/.test(part)) {
      teacher = part;
    } else if (part.length >= 3 && part.length <= 20) {
      name = part;
    }
  }

  if (name && dayOfWeek && startTime) {
    return { name, teacher, location, dayOfWeek, startTime, endTime, startWeek: 1, endWeek: 18, weeks: [] };
  }
  return null;
}

function tryParseLine(line, lines, idx, DAY_MAP) {
  const timeInfo = extractTimeInfo(line, DAY_MAP);
  if (!timeInfo) return null;

  const { dayOfWeek, startTime, endTime } = timeInfo;

  // 从前后行提取课程名、教师、地点
  let name = '', teacher = '', location = '';

  // 前一行通常是课程名
  if (idx >= 1) name = lines[idx - 1];
  // 前两行可能是教师
  if (idx >= 2 && lines[idx - 2].length < 10) teacher = lines[idx - 2];
  // 后一行通常是地点
  if (idx + 1 < lines.length && lines[idx + 1].length < 20) location = lines[idx + 1];

  if (!name) name = '未命名课程';

  return { name, teacher, location, dayOfWeek, startTime, endTime, startWeek: 1, endWeek: 18, weeks: [] };
}

function extractTimeInfo(text, DAY_MAP) {
  // 匹配 "周X 8:00-9:40" 或 "周X 08:00-09:40"
  const m1 = text.match(/周\s*([一二三四五六日])\s*(\d{1,2}):(\d{2})\s*[-~至到]\s*(\d{1,2}):(\d{2})/);
  if (m1) {
    return {
      dayOfWeek: DAY_MAP[m1[1]] || 1,
      startTime: `${m1[2].padStart(2, '0')}:${m1[3].padStart(2, '0')}`,
      endTime: `${m1[4].padStart(2, '0')}:${m1[5].padStart(2, '0')}`,
    };
  }

  // 匹配 "星期X 8:00-9:40"
  const m2 = text.match(/星期\s*([一二三四五六日])\s*(\d{1,2}):(\d{2})\s*[-~至到]\s*(\d{1,2}):(\d{2})/);
  if (m2) {
    return {
      dayOfWeek: DAY_MAP[m2[1]] || 1,
      startTime: `${m2[2].padStart(2, '0')}:${m2[3].padStart(2, '0')}`,
      endTime: `${m2[4].padStart(2, '0')}:${m2[5].padStart(2, '0')}`,
    };
  }

  // 匹配 "周X 第N-M节" 或 "周X N-M节" 或 "周X 第N到M节"
  const m3 = text.match(/周\s*([一二三四五六日])\s*第?\s*(\d{1,2})\s*[-~至到]\s*(\d{1,2})\s*节?/);
  if (m3) {
    return {
      dayOfWeek: DAY_MAP[m3[1]] || 1,
      startTime: sectionToTime(parseInt(m3[2])),
      endTime: sectionToTime(parseInt(m3[3]) + 1),
    };
  }

  // 匹配 "星期X 第N-M节"
  const m4 = text.match(/星期\s*([一二三四五六日])\s*第?\s*(\d{1,2})\s*[-~至到]\s*(\d{1,2})\s*节?/);
  if (m4) {
    return {
      dayOfWeek: DAY_MAP[m4[1]] || 1,
      startTime: sectionToTime(parseInt(m4[2])),
      endTime: sectionToTime(parseInt(m4[3]) + 1),
    };
  }

  // 匹配 "周X" 单独出现（后面可能没有时间信息，用前一行的时间）
  const m5 = text.match(/^周\s*([一二三四五六日])\s*$/);
  if (m5) {
    return {
      dayOfWeek: DAY_MAP[m5[1]] || 1,
      startTime: '08:00',
      endTime: '09:40',
    };
  }

  return null;
}

function sectionToTime(section) {
  // 第1节=8:00，每节45分钟，课间休息10分钟
  const baseMin = 8 * 60;
  const min = baseMin + (section - 1) * 45 + Math.floor((section - 1) / 2) * 10;
  const h = Math.floor(min / 60);
  const m = min % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}
