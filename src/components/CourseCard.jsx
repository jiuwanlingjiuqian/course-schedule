export default function CourseCard({ course, style, onClick }) {
  return (
    <div
      className="course-card"
      style={{
        ...style,
        background: course.color || 'var(--course-color-custom)',
      }}
      onClick={() => onClick?.(course)}
    >
      <div className="course-name">
        {course.name}
        {course.weekPattern === 'odd' && <span className="week-badge">单</span>}
        {course.weekPattern === 'even' && <span className="week-badge">双</span>}
      </div>
      {course.location && <div className="course-detail">{course.location}</div>}
      {course.teacher && <div className="course-detail">{course.teacher}</div>}
      <style>{`
        .course-card {
          position: absolute;
          left: 2px;
          min-width: 52px;
          border-radius: 6px;
          padding: 3px 5px;
          color: #fff;
          overflow: visible;
          cursor: pointer;
          box-shadow: 0 2px 8px rgba(0,0,0,0.3);
          z-index: 10;
          animation: cardPopIn 0.35s ease-out;
          white-space: nowrap;
        }
        @keyframes cardPopIn {
          from { transform: scale(0.85); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
        .course-card:active {
          transform: scale(0.95);
          filter: brightness(1.1);
        }

        .course-name {
          font-size: 11px;
          font-weight: 600;
          line-height: 1.3;
          white-space: nowrap;
          word-break: keep-all;
          overflow-wrap: normal;
        }
        .course-detail {
          font-size: 9px;
          opacity: 0.85;
          line-height: 1.3;
          white-space: nowrap;
          word-break: keep-all;
          overflow-wrap: normal;
        }
        .week-badge {
          display: inline-block;
          font-size: 8px;
          background: rgba(255,255,255,0.3);
          padding: 0 2px;
          border-radius: 2px;
          margin-left: 2px;
          font-weight: 400;
        }
      `}</style>
    </div>
  );
}
