import { useApp } from '../AppContext';
import { isCourseActiveInWeek, getTodayDayOfWeek } from '../utils/semester';
import CourseCard from './CourseCard';

const DAY_LABELS = ['周一', '周二', '周三', '周四', '周五', '周六', '周日'];

const TIME_SLOTS = [];
for (let h = 8; h <= 21; h++) {
  TIME_SLOTS.push(`${String(h).padStart(2, '0')}:00`);
}

function timeToMinutes(time) {
  const [h, m] = time.split(':').map(Number);
  return h * 60 + m;
}

function getCourseStyle(course) {
  const startMin = timeToMinutes(course.startTime);
  const endMin = timeToMinutes(course.endTime);
  const gridStart = 8 * 60;
  const rowHeight = 52;
  const top = ((startMin - gridStart) / 60) * rowHeight;
  const height = Math.max(((endMin - startMin) / 60) * rowHeight, 20);
  return { top: `${top}px`, height: `${height}px` };
}

export default function WeekGrid({ onCellClick, onCourseClick }) {
  const { courses, currentWeek } = useApp();
  const today = getTodayDayOfWeek();
  const activeCourses = courses.filter(c => isCourseActiveInWeek(c, currentWeek));

  return (
    <div className="week-grid-wrapper glass-card">
      <div className="grid-header">
        <div className="time-header"></div>
        {DAY_LABELS.map((label, i) => (
          <div key={label} className={`day-header ${i + 1 === today ? 'today' : ''}`}>
            {label}
            {i + 1 === today && <span className="today-dot" />}
          </div>
        ))}
      </div>

      <div className="grid-body">
        <div className="time-column">
          {TIME_SLOTS.map(t => (
            <div key={t} className="time-slot">{t}</div>
          ))}
        </div>

        <div className="day-columns">
          {[1, 2, 3, 4, 5, 6, 7].map(day => (
            <div key={day} className={`day-column ${day === today ? 'today-col' : ''}`}>
              {TIME_SLOTS.map(t => (
                <div
                  key={t}
                  className="cell-bg"
                  onClick={() => onCellClick?.(day, t)}
                />
              ))}
              {activeCourses
                .filter(c => c.dayOfWeek === day)
                .map(course => (
                  <CourseCard
                    key={course.id}
                    course={course}
                    style={getCourseStyle(course)}
                    onClick={onCourseClick}
                  />
                ))}
            </div>
          ))}
        </div>
      </div>

      <style>{`
        .week-grid-wrapper {
          margin: 12px;
          border-radius: var(--radius-md);
          overflow: visible;
          animation: fadeSlideIn 0.6s ease-out 0.15s both;
        }
        @keyframes fadeSlideIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .grid-header {
          display: flex;
          border-bottom: 1px solid rgba(255,255,255,0.08);
          position: sticky;
          top: 0;
          background: rgba(5,30,20,0.6);
          z-index: 5;
          border-radius: var(--radius-md) var(--radius-md) 0 0;
        }
        .time-header {
          width: 36px;
          flex-shrink: 0;
        }
        .day-header {
          flex: 1;
          text-align: center;
          padding: 10px 0;
          font-size: var(--font-size-xs);
          font-weight: 600;
          color: var(--text-secondary);
          position: relative;
        }
        .day-header.today {
          color: var(--accent);
        }
        .today-dot {
          display: block;
          width: 5px;
          height: 5px;
          background: var(--accent);
          border-radius: 50%;
          margin: 2px auto 0;
          animation: pulse 2s ease-in-out infinite;
        }
        @keyframes pulse {
          0%, 100% { opacity: 0.5; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.5); }
        }

        .grid-body {
          display: flex;
          position: relative;
        }

        .time-column {
          width: 36px;
          flex-shrink: 0;
        }
        .time-slot {
          height: var(--grid-row-height);
          display: flex;
          align-items: flex-start;
          justify-content: center;
          font-size: 9px;
          color: rgba(255,255,255,0.55);
          padding-top: 2px;
        }

        .day-columns {
          display: flex;
          flex: 1;
          position: relative;
        }
        .day-column {
          flex: 1;
          position: relative;
          border-left: 1px solid rgba(255,255,255,0.04);
          overflow: visible;
        }
        .day-column.today-col {
          background: rgba(94,234,180,0.03);
        }
        .cell-bg {
          height: var(--grid-row-height);
          border-bottom: 1px solid rgba(255,255,255,0.03);
          cursor: pointer;
          transition: background 0.15s;
        }
        .cell-bg:active {
          background: rgba(94,234,180,0.12);
        }
      `}</style>
    </div>
  );
}
