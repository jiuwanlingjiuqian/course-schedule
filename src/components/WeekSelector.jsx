import { useApp } from '../AppContext';
import { getWeekList } from '../utils/semester';

export default function WeekSelector() {
  const { semester, currentWeek, setCurrentWeek, refreshCurrentWeek } = useApp();
  const weeks = getWeekList(semester.totalWeeks);

  return (
    <div className="week-selector glass-card">
      <button className="week-btn" onClick={() => setCurrentWeek(w => Math.max(1, w - 1))}>
        ‹
      </button>
      <div className="week-display">
        <select
          value={currentWeek}
          onChange={e => setCurrentWeek(Number(e.target.value))}
        >
          {weeks.map(w => (
            <option key={w} value={w}>第 {w} 周</option>
          ))}
        </select>
        <button className="week-today" onClick={refreshCurrentWeek}>
          本周
        </button>
      </div>
      <button className="week-btn" onClick={() => setCurrentWeek(w => Math.min(semester.totalWeeks, w + 1))}>
        ›
      </button>
      <style>{`
        .week-selector {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          padding: 10px 12px;
          border-radius: var(--radius-md);
          margin: 12px 12px 0;
          animation: fadeSlideIn 0.6s ease-out;
        }
        @keyframes fadeSlideIn {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .week-btn {
          width: 34px;
          height: 34px;
          border-radius: 50%;
          font-size: 18px;
          color: rgba(255,255,255,0.8);
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(255,255,255,0.08);
          transition: all 0.2s;
        }
        .week-btn:active {
          transform: scale(0.9);
          background: rgba(255,255,255,0.15);
        }

        .week-display {
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .week-display select {
          font-size: var(--font-size-lg);
          font-weight: 600;
          color: #fff;
          background: transparent;
          padding: 4px 8px;
          border-radius: var(--radius-sm);
        }
        .week-display select option {
          background: #0a3d25;
          color: #fff;
        }

        .week-today {
          font-size: var(--font-size-xs);
          color: rgba(255,255,255,0.85);
          padding: 5px 10px;
          border-radius: 12px;
          background: rgba(255,255,255,0.1);
          font-weight: 500;
        }
        .week-today:active { opacity: 0.7; }
      `}</style>
    </div>
  );
}
