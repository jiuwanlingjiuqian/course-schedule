import { useState, useEffect } from 'react';
import { useApp } from '../AppContext';
import WeekSelector from '../components/WeekSelector';
import WeekGrid from '../components/WeekGrid';

const COLORS = [
  '#9bbdf0', '#f0b8c8', '#f7e08a', '#9cd6b8',
  '#c2b8e8', '#f0d0e0', '#e8e4f0',
];

const emptyCourse = () => ({
  id: '',
  name: '',
  teacher: '',
  location: '',
  dayOfWeek: 1,
  startTime: '08:00',
  endTime: '09:40',
  startWeek: 1,
  endWeek: 18,
  weekPattern: 'all',
  weeks: [],
  color: COLORS[0],
});

const DEMO_COURSES = [
  { id: 'demo_1', name: '高等数学', teacher: '张教授', location: '教三楼 301', dayOfWeek: 1, startTime: '08:00', endTime: '09:40', startWeek: 1, endWeek: 18, weekPattern: 'all', weeks: [], color: '#9bbdf0' },
  { id: 'demo_2', name: '大学英语', teacher: '李老师', location: '外语楼 205', dayOfWeek: 2, startTime: '10:00', endTime: '11:40', startWeek: 1, endWeek: 18, weekPattern: 'odd', weeks: [], color: '#f0b8c8' },
  { id: 'demo_3', name: '数据结构', teacher: '王教授', location: '计算机楼 102', dayOfWeek: 3, startTime: '14:00', endTime: '15:40', startWeek: 1, endWeek: 16, weekPattern: 'all', weeks: [], color: '#f7e08a' },
  { id: 'demo_4', name: '体育课', teacher: '赵教练', location: '体育馆', dayOfWeek: 4, startTime: '16:00', endTime: '17:40', startWeek: 1, endWeek: 18, weekPattern: 'even', weeks: [], color: '#9cd6b8' },
  { id: 'demo_5', name: '思想政治', teacher: '刘老师', location: '主楼 A101', dayOfWeek: 5, startTime: '08:00', endTime: '09:40', startWeek: 1, endWeek: 18, weekPattern: 'all', weeks: [], color: '#c2b8e8' },
];

export default function Schedule() {
  const { courses, updateCourses, semester } = useApp();
  const [editing, setEditing] = useState(null);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    if (courses.length === 0) {
      updateCourses(DEMO_COURSES);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const openNew = (day, time) => {
    setEditing({ ...emptyCourse(), dayOfWeek: day, startTime: time, id: Date.now().toString() });
    setShowForm(true);
  };

  const openEdit = (course) => {
    setEditing({ ...course });
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditing(null);
  };

  const saveCourse = () => {
    if (!editing.name.trim()) return;
    const list = [...courses];
    const idx = list.findIndex(c => c.id === editing.id);
    if (idx >= 0) list[idx] = editing;
    else list.push(editing);
    updateCourses(list);
    closeForm();
  };

  const deleteCourse = () => {
    if (!editing?.id) return;
    updateCourses(courses.filter(c => c.id !== editing.id));
    closeForm();
  };

  const isDemo = editing && editing.id && editing.id.startsWith('demo_');

  return (
    <div className="schedule-page">
      <div className="schedule-header">
        <h2>{semester.name || '课程表'}</h2>
        <button className="add-btn" onClick={() => openNew(1, '08:00')}>
          + 添加
        </button>
      </div>

      <WeekSelector />
      <WeekGrid onCellClick={openNew} onCourseClick={openEdit} />

      {showForm && editing && (
        <div className="modal-overlay" onClick={closeForm}>
          <div className="modal-content glass-card" onClick={e => e.stopPropagation()}>
            <h3>{courses.find(c => c.id === editing.id) ? '编辑课程' : '添加课程'}</h3>

            <label>课程名称 *</label>
            <input value={editing.name}
              onChange={e => setEditing({ ...editing, name: e.target.value })}
              placeholder="例如：高等数学" autoFocus />

            <label>教师</label>
            <input value={editing.teacher}
              onChange={e => setEditing({ ...editing, teacher: e.target.value })}
              placeholder="授课教师" />

            <label>上课地点</label>
            <input value={editing.location}
              onChange={e => setEditing({ ...editing, location: e.target.value })}
              placeholder="例如：教三楼 301" />

            <div className="form-row">
              <div>
                <label>星期</label>
                <select value={editing.dayOfWeek}
                  onChange={e => setEditing({ ...editing, dayOfWeek: Number(e.target.value) })}>
                  {['周一','周二','周三','周四','周五','周六','周日'].map((d, i) => (
                    <option key={d} value={i + 1}>{d}</option>
                  ))}
                </select>
              </div>
              <div>
                <label>开始</label>
                <input type="time" value={editing.startTime}
                  onChange={e => setEditing({ ...editing, startTime: e.target.value })} />
              </div>
              <div>
                <label>结束</label>
                <input type="time" value={editing.endTime}
                  onChange={e => setEditing({ ...editing, endTime: e.target.value })} />
              </div>
            </div>

            <div className="form-row">
              <div>
                <label>起始周</label>
                <input type="number" min="1" max={semester.totalWeeks} value={editing.startWeek}
                  onChange={e => setEditing({ ...editing, startWeek: Number(e.target.value) })} />
              </div>
              <div>
                <label>结束周</label>
                <input type="number" min="1" max={semester.totalWeeks} value={editing.endWeek}
                  onChange={e => setEditing({ ...editing, endWeek: Number(e.target.value) })} />
              </div>
              <div>
                <label>单双周</label>
                <select value={editing.weekPattern || 'all'}
                  onChange={e => setEditing({ ...editing, weekPattern: e.target.value })}>
                  <option value="all">每周</option>
                  <option value="odd">单周</option>
                  <option value="even">双周</option>
                </select>
              </div>
            </div>

            <label>颜色</label>
            <div className="color-picker">
              {COLORS.map(c => (
                <button key={c}
                  className={`color-dot ${editing.color === c ? 'selected' : ''}`}
                  style={{ background: c }}
                  onClick={() => setEditing({ ...editing, color: c })} />
              ))}
            </div>

            <div className="form-actions">
              {(courses.find(c => c.id === editing.id) && !isDemo) && (
                <button className="btn-danger" onClick={deleteCourse}>删除</button>
              )}
              <button className="btn-cancel" onClick={closeForm}>取消</button>
              <button className="btn-save" onClick={saveCourse}>保存</button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .schedule-page { padding-bottom: 16px; }

        .schedule-header {
          display: flex;
          align-items: center;
          justify-content: flex-end;
          padding: 20px 20px 10px;
        }
        .schedule-header h2 {
          font-size: 22px;
          font-weight: 700;
          text-shadow: 0 2px 8px rgba(0,0,0,0.3);
          margin-right: auto;
          margin-left: 8px;
        }
        .add-btn {
          padding: 8px 18px;
          background: var(--accent);
          color: #0a3d25;
          border-radius: 20px;
          font-size: 13px;
          font-weight: 700;
          box-shadow: 0 2px 12px rgba(94,234,180,0.3);
          transition: all 0.2s;
        }
        .add-btn:active { transform: scale(0.95); opacity: 0.8; }

        /* Modal */
        .modal-overlay {
          position: fixed; inset: 0;
          background: rgba(0,0,0,0.5);
          display: flex;
          align-items: flex-end;
          justify-content: center;
          z-index: 100;
          animation: fadeIn 0.25s ease-out;
        }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }

        .modal-content {
          width: 100%;
          max-width: 500px;
          max-height: 82vh;
          overflow-y: auto;
          padding: 24px 20px;
          border-radius: var(--radius-lg) var(--radius-lg) 0 0;
          padding-bottom: calc(24px + env(safe-area-inset-bottom));
          border: 1px solid rgba(255,255,255,0.1);
          border-bottom: none;
          animation: slideUp 0.3s ease-out;
        }
        @keyframes slideUp { from { transform: translateY(100%); } to { transform: translateY(0); } }

        .modal-content h3 {
          margin-bottom: 16px;
          font-size: var(--font-size-lg);
        }
        .modal-content label {
          display: block;
          font-size: var(--font-size-sm);
          color: var(--text-secondary);
          margin: 10px 0 4px;
        }
        .modal-content input,
        .modal-content select {
          width: 100%;
          padding: 10px 12px;
          border-radius: var(--radius-sm);
          background: rgba(255,255,255,0.08);
          color: var(--text-primary);
          font-size: var(--font-size-md);
          border: 1px solid rgba(255,255,255,0.06);
        }
        .modal-content input:focus,
        .modal-content select:focus {
          border-color: var(--accent);
          background: rgba(255,255,255,0.12);
        }
        .modal-content select option {
          background: #0a3d25;
          color: #fff;
        }

        .form-row { display: flex; gap: 8px; }
        .form-row > div { flex: 1; }

        .color-picker { display: flex; gap: 10px; margin-top: 4px; }
        .color-dot {
          width: 32px; height: 32px;
          border-radius: 50%;
          border: 3px solid transparent;
          transition: all 0.2s;
        }
        .color-dot:active { transform: scale(0.85); }
        .color-dot.selected { border-color: #fff; box-shadow: 0 0 12px currentColor; }

        .form-actions {
          display: flex; gap: 10px;
          margin-top: 20px;
          justify-content: flex-end;
        }
        .btn-save {
          background: var(--accent);
          color: #0a3d25;
          padding: 10px 24px;
          border-radius: var(--radius-sm);
          font-weight: 700;
        }
        .btn-cancel {
          color: var(--text-secondary);
          padding: 10px 16px;
        }
        .btn-danger {
          color: var(--danger);
          padding: 10px 16px;
          margin-right: auto;
        }
      `}</style>
    </div>
  );
}
