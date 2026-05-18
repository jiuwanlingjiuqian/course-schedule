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
          right: 2px;
          border-radius: 8px;
          padding: 6px 8px;
          color: #fff;
          overflow: hidden;
          cursor: pointer;
          box-shadow: 0 2px 8px rgba(0,0,0,0.25);
          z-index: 2;
          animation: cardPopIn 0.35s ease-out;
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
          font-size: 12px;
          font-weight: 600;
          line-height: 1.3;
        }
        .course-detail {
          font-size: 10px;
          opacity: 0.85;
          margin-top: 1px;
          line-height: 1.3;
        }
        .week-badge {
          display: inline-block;
          font-size: 9px;
          background: rgba(255,255,255,0.3);
          padding: 0 3px;
          border-radius: 3px;
          margin-left: 3px;
          font-weight: 400;
        }
      `}</style>
    </div>
  );
}
