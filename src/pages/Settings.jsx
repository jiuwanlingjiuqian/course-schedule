import { useState, useRef } from 'react';
import { useApp } from '../AppContext';
import { exportAllData, importAllData, clearAllData } from '../utils/storage';

export default function Settings() {
  const { semester, updateSemester, courses, updateCourses } = useApp();
  const fileInputRef = useRef(null);
  const [msg, setMsg] = useState('');

  const handleExport = () => {
    const data = exportAllData();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `课程表备份_${new Date().toLocaleDateString()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showMsg('导出成功！');
  };

  const handleImport = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        importAllData(ev.target.result);
        // Reload data into context
        const data = JSON.parse(ev.target.result);
        if (data.courses) updateCourses(data.courses);
        if (data.semester) updateSemester(data.semester);
        showMsg('导入成功！请刷新课表查看');
      } catch {
        showMsg('文件格式错误，导入失败');
      }
    };
    reader.readAsText(file);
  };

  const handleClear = () => {
    if (window.confirm('确定要清空所有课程数据和学期设置吗？此操作不可恢复！')) {
      clearAllData();
      updateCourses([]);
      updateSemester({ name: '', startDate: '', totalWeeks: 18 });
      showMsg('数据已清空');
    }
  };

  const showMsg = (text) => {
    setMsg(text);
    setTimeout(() => setMsg(''), 2500);
  };

  return (
    <div className="settings-page">
      <h2>设置</h2>

      {/* Toast */}
      {msg && <div className="toast">{msg}</div>}

      {/* Semester Settings */}
      <section className="settings-section">
        <h3>学期设置</h3>
        <label>学期名称</label>
        <input
          value={semester.name}
          onChange={e => updateSemester({ ...semester, name: e.target.value })}
          placeholder="例如：2025-2026 第二学期"
        />
        <label>开学日期</label>
        <input
          type="date"
          value={semester.startDate}
          onChange={e => updateSemester({ ...semester, startDate: e.target.value })}
        />
        <label>总周数</label>
        <input
          type="number"
          min="1" max="30"
          value={semester.totalWeeks}
          onChange={e => updateSemester({ ...semester, totalWeeks: Number(e.target.value) })}
        />
      </section>

      {/* Data Management */}
      <section className="settings-section">
        <h3>数据管理</h3>
        <p className="section-hint">当前共 {courses.length} 门课程</p>

        <div className="data-actions">
          <button className="action-btn export" onClick={handleExport}>
            📤 导出数据备份
          </button>

          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            onChange={handleImport}
            hidden
          />
          <button className="action-btn import" onClick={() => fileInputRef.current?.click()}>
            📥 导入数据备份
          </button>

          <button className="action-btn danger" onClick={handleClear}>
            🗑 清空所有数据
          </button>
        </div>
      </section>

      <style>{`
        .settings-page {
          padding: 16px;
        }
        .settings-page h2 {
          font-size: var(--font-size-lg);
          margin-bottom: 16px;
        }

        .toast {
          position: fixed;
          top: 20px;
          left: 50%;
          transform: translateX(-50%);
          background: #333;
          color: #fff;
          padding: 10px 24px;
          border-radius: 20px;
          font-size: var(--font-size-sm);
          z-index: 200;
          animation: fadeInOut 2.5s;
        }
        @keyframes fadeInOut {
          0% { opacity: 0; transform: translateX(-50%) translateY(-10px); }
          15% { opacity: 1; transform: translateX(-50%) translateY(0); }
          85% { opacity: 1; }
          100% { opacity: 0; }
        }

        .settings-section {
          background: var(--bg-card);
          border: 1px solid rgba(255,255,255,0.06);
          border-radius: var(--radius-md);
          padding: 16px;
          margin-bottom: 16px;
        }
        .settings-section h3 {
          font-size: var(--font-size-md);
          margin-bottom: 12px;
          color: var(--text-primary);
        }
        .settings-section label {
          display: block;
          font-size: var(--font-size-sm);
          color: var(--text-secondary);
          margin: 10px 0 4px;
        }
        .settings-section input {
          width: 100%;
          padding: 10px 12px;
          border-radius: var(--radius-sm);
          background: var(--bg-input);
          color: var(--text-primary);
          font-size: var(--font-size-md);
          border: 1px solid transparent;
        }
        .settings-section input:focus {
          border-color: var(--accent);
        }
        .section-hint {
          font-size: var(--font-size-sm);
          color: var(--text-hint);
          margin-bottom: 12px;
        }

        .data-actions {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }
        .action-btn {
          width: 100%;
          padding: 12px;
          border-radius: var(--radius-sm);
          font-size: var(--font-size-md);
          text-align: center;
        }
        .action-btn.export {
          background: var(--accent-light);
          color: var(--accent);
        }
        .action-btn.import {
          background: rgba(94,234,180,0.12);
          color: var(--success);
        }
        .action-btn.danger {
          background: rgba(255,107,138,0.12);
          color: var(--danger);
        }
      `}</style>
    </div>
  );
}
