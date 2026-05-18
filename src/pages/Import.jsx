import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../AppContext';
import { parseExcelFile, parsePastedText } from '../utils/parseSchedule';

const COLORS = ['#9bbdf0', '#f0b8c8', '#f7e08a', '#9cd6b8', '#c2b8e8', '#f0d0e0', '#e8e4f0'];
const DAYS = ['周一', '周二', '周三', '周四', '周五', '周六', '周日'];

export default function Import() {
  const { courses, updateCourses, semester } = useApp();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [mode, setMode] = useState('paste'); // 'paste' | 'excel' | 'manual'
  const [pasteText, setPasteText] = useState('');
  const [parsedCourses, setParsedCourses] = useState([]);
  const [fileName, setFileName] = useState('');

  // Excel file import
  const handleExcelFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileName(file.name);
    try {
      const result = await parseExcelFile(file);
      setParsedCourses(result);
    } catch (err) {
      alert('解析失败：' + err.message);
    }
  };

  // Smart paste
  const handlePaste = () => {
    if (!pasteText.trim()) return;
    const result = parsePastedText(pasteText);
    setParsedCourses(result);
  };

  // Update parsed course
  const updateParsed = (idx, field, value) => {
    const updated = [...parsedCourses];
    updated[idx] = { ...updated[idx], [field]: value };
    setParsedCourses(updated);
  };

  // Import one
  const importOne = (idx) => {
    updateCourses([...courses, parsedCourses[idx]]);
    setParsedCourses(prev => prev.filter((_, i) => i !== idx));
  };

  // Import all
  const importAll = () => {
    if (parsedCourses.length === 0) return;
    updateCourses([...courses, ...parsedCourses]);
    setParsedCourses([]);
    setPasteText('');
    navigate('/');
  };

  // Manual form state
  const [form, setForm] = useState({
    name: '', teacher: '', location: '',
    dayOfWeek: 1, startTime: '08:00', endTime: '09:40',
    startWeek: 1, endWeek: 18, weekPattern: 'all', color: COLORS[0],
  });

  const saveManual = () => {
    if (!form.name.trim()) return;
    const course = { ...form, id: 'man_' + Date.now(), weeks: [] };
    updateCourses([...courses, course]);
    setForm({ ...form, name: '', teacher: '', location: '' });
    navigate('/');
  };

  return (
    <div className="import-page">
      <h2>导入课程</h2>

      {/* Mode tabs */}
      <div className="mode-tabs">
        <button className={`mt ${mode === 'paste' ? 'act' : ''}`} onClick={() => setMode('paste')}>
          📋 智能粘贴
        </button>
        <button className={`mt ${mode === 'excel' ? 'act' : ''}`} onClick={() => setMode('excel')}>
          📊 Excel
        </button>
        <button className={`mt ${mode === 'manual' ? 'act' : ''}`} onClick={() => setMode('manual')}>
          ✏️ 手动
        </button>
      </div>

      {/* ========== SMART PASTE ========== */}
      {mode === 'paste' && (
        <div className="paste-section">
          <div className="guide-box">
            <h4>💡 操作步骤</h4>
            <ol>
              <li>用电脑浏览器打开 <strong>贵大教务系统</strong> (<code>jw.gzu.edu.cn</code>)</li>
              <li>进入 <strong>信息查询 → 学生个人课表</strong></li>
              <li>选中课表内容，<strong>Ctrl+C 复制</strong></li>
              <li>粘贴到下方文本框，点击「解析」</li>
            </ol>
          </div>

          <textarea
            className="paste-area"
            value={pasteText}
            onChange={e => setPasteText(e.target.value)}
            placeholder="把从教务系统复制的课表内容粘贴到这里...&#10;&#10;支持两种格式：&#10;1. 列表格式：每行一门课（课程名 教师 时间 地点 周次）&#10;2. 表格格式：直接复制课表表格"
            rows={10}
          />
          <button className="parse-btn" onClick={handlePaste} disabled={!pasteText.trim()}>
            🔍 解析课表
          </button>
        </div>
      )}

      {/* ========== EXCEL IMPORT ========== */}
      {mode === 'excel' && (
        <div className="excel-section">
          <div className="guide-box">
            <h4>💡 操作步骤</h4>
            <ol>
              <li>登录贵大教务系统，进入课表页面</li>
              <li>查看是否有「导出」或「下载」按钮</li>
              <li>如果没有导出按钮，可以复制课表表格粘贴到 Excel 中保存为 .xlsx 或 .csv</li>
              <li>上传保存好的 Excel 文件</li>
            </ol>
          </div>

          <input ref={fileInputRef} type="file" accept=".xlsx,.xls,.csv" onChange={handleExcelFile} hidden />
          <div className="upload-zone" onClick={() => fileInputRef.current?.click()}>
            {fileName ? (
              <div className="file-loaded">
                📄 <strong>{fileName}</strong>
                <span className="file-retry">（点击更换）</span>
              </div>
            ) : (
              <div className="file-empty">
                📊 点击选择 Excel 文件（.xlsx / .xls / .csv）
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========== MANUAL ========== */}
      {mode === 'manual' && (
        <div className="manual-section">
          <div className="manual-form">
            <input className="mf-name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
              placeholder="课程名称 *" autoComplete="off" />
            <div className="ef-row-2">
              <input value={form.teacher} onChange={e => setForm({ ...form, teacher: e.target.value })}
                placeholder="教师" autoComplete="off" />
              <input value={form.location} onChange={e => setForm({ ...form, location: e.target.value })}
                placeholder="上课地点" autoComplete="off" />
            </div>

            <div className="ef-row-3">
              <select value={form.dayOfWeek} onChange={e => setForm({ ...form, dayOfWeek: Number(e.target.value) })}>
                {DAYS.map((d, di) => <option key={d} value={di + 1}>{d}</option>)}
              </select>
              <input type="time" value={form.startTime} onChange={e => setForm({ ...form, startTime: e.target.value })} />
              <span>~</span>
              <input type="time" value={form.endTime} onChange={e => setForm({ ...form, endTime: e.target.value })} />
            </div>

            <div className="ef-row-3">
              <div className="ef-field">
                <label>起始周</label>
                <input type="number" min="1" max={semester.totalWeeks} value={form.startWeek}
                  onChange={e => setForm({ ...form, startWeek: Number(e.target.value) })} />
              </div>
              <div className="ef-field">
                <label>结束周</label>
                <input type="number" min="1" max={semester.totalWeeks} value={form.endWeek}
                  onChange={e => setForm({ ...form, endWeek: Number(e.target.value) })} />
              </div>
              <div className="ef-field">
                <label>单双周</label>
                <select value={form.weekPattern || 'all'}
                  onChange={e => setForm({ ...form, weekPattern: e.target.value })}>
                  <option value="all">每周</option>
                  <option value="odd">单周</option>
                  <option value="even">双周</option>
                </select>
              </div>
              <div className="ef-field">
                <label>颜色</label>
                <div className="ef-colors">
                  {COLORS.map(c => (
                    <button key={c} className={`ef-c ${form.color === c ? 'sel' : ''}`}
                      style={{ background: c }} onClick={() => setForm({ ...form, color: c })} />
                  ))}
                </div>
              </div>
            </div>

            <button className="ef-save-btn" onClick={saveManual}>✓ 添加课程</button>
          </div>
        </div>
      )}

      {/* ========== PARSED RESULTS (shared) ========== */}
      {parsedCourses.length > 0 && (
        <div className="parsed-section">
          <h3>✅ 解析出 {parsedCourses.length} 门课程</h3>
          <p className="parsed-hint">核对信息后点击 ✓ 导入，或点击 ✏️ 修改</p>

          {parsedCourses.map((c, i) => (
            <div key={c.id} className="parsed-card">
              <div className="pc-header">
                <span className="pc-dot" style={{ background: c.color }} />
                <input className="pc-name" value={c.name}
                  onChange={e => updateParsed(i, 'name', e.target.value)} />
                <button className="pc-btn pc-import" onClick={() => importOne(i)} title="导入此课程">✓</button>
              </div>
              <div className="pc-body">
                <input className="pc-sm" value={c.teacher}
                  onChange={e => updateParsed(i, 'teacher', e.target.value)} placeholder="教师" />
                <input className="pc-sm" value={c.location}
                  onChange={e => updateParsed(i, 'location', e.target.value)} placeholder="地点" />
              </div>
              <div className="pc-body">
                <select className="pc-sm" value={c.dayOfWeek}
                  onChange={e => updateParsed(i, 'dayOfWeek', Number(e.target.value))}>
                  {DAYS.map((d, di) => <option key={d} value={di + 1}>{d}</option>)}
                </select>
                <input className="pc-sm" type="time" value={c.startTime}
                  onChange={e => updateParsed(i, 'startTime', e.target.value)} />
                <span>~</span>
                <input className="pc-sm" type="time" value={c.endTime}
                  onChange={e => updateParsed(i, 'endTime', e.target.value)} />
              </div>
              <div className="pc-body">
                <label className="pc-lbl">周次</label>
                <input className="pc-sm pc-num" type="number" min="1" max={semester.totalWeeks} value={c.startWeek || 1}
                  onChange={e => updateParsed(i, 'startWeek', Number(e.target.value))} />
                <span>-</span>
                <input className="pc-sm pc-num" type="number" min="1" max={semester.totalWeeks} value={c.endWeek || 18}
                  onChange={e => updateParsed(i, 'endWeek', Number(e.target.value))} />
                <span>周</span>
                <select className="pc-sm" style={{ width: '80px', flex: 'none' }}
                  value={c.weekPattern || 'all'}
                  onChange={e => updateParsed(i, 'weekPattern', e.target.value)}>
                  <option value="all">每周</option>
                  <option value="odd">单周</option>
                  <option value="even">双周</option>
                </select>
              </div>
            </div>
          ))}

          <button className="import-all-btn" onClick={importAll}>
            📥 一键导入全部 ({parsedCourses.length} 门)
          </button>
        </div>
      )}

      {parsedCourses.length === 0 && mode === 'paste' && pasteText && (
        <div className="no-result">
          <p>😅 没能自动解析出课程</p>
          <p>试试把课表内容在 Excel 中整理成「课程名 | 教师 | 时间 | 地点」的格式，再用 Excel 导入～</p>
        </div>
      )}

      <style>{`
        .import-page { padding: 16px; padding-bottom: 100px; }
        .import-page h2 { font-size: var(--font-size-lg); margin-bottom: 12px; }

        /* Mode tabs */
        .mode-tabs { display: flex; background: var(--bg-input); border-radius: var(--radius-sm); padding: 3px; margin-bottom: 16px; }
        .mt { flex: 1; padding: 10px; text-align: center; font-size: var(--font-size-sm); border-radius: 6px; color: var(--text-secondary); transition: all 0.2s; }
        .mt.act { background: var(--bg-card); color: var(--accent); font-weight: 600; box-shadow: var(--shadow-sm); }

        /* Guide box */
        .guide-box {
          background: rgba(94,234,180,0.08);
          border-radius: var(--radius-md);
          padding: 12px 16px;
          margin-bottom: 12px;
          border: 1px solid rgba(94,234,180,0.12);
        }
        .guide-box h4 { font-size: var(--font-size-sm); margin-bottom: 6px; color: var(--accent); }
        .guide-box ol { padding-left: 18px; font-size: var(--font-size-sm); color: var(--text-secondary); line-height: 1.8; }
        .guide-box code { background: rgba(255,255,255,0.1); padding: 1px 6px; border-radius: 4px; font-size: var(--font-size-xs); }

        /* Paste */
        .paste-area {
          width: 100%;
          padding: 12px;
          border-radius: var(--radius-md);
          background: var(--bg-card);
          font-size: var(--font-size-sm);
          color: var(--text-primary);
          border: 2px solid rgba(255,255,255,0.08);
          resize: vertical;
          line-height: 1.6;
          font-family: monospace;
          box-shadow: var(--shadow-sm);
        }
        .paste-area:focus { border-color: var(--accent); }
        .parse-btn {
          width: 100%; margin-top: 12px; padding: 14px;
          background: var(--accent); color: #0a3d25;
          border-radius: var(--radius-md); font-size: var(--font-size-md); font-weight: 600;
        }
        .parse-btn:disabled { opacity: 0.5; }

        /* Excel */
        .upload-zone {
          background: var(--bg-card); border: 2px dashed rgba(255,255,255,0.12);
          border-radius: var(--radius-md); padding: 24px; text-align: center; cursor: pointer;
          box-shadow: var(--shadow-sm); transition: border 0.2s;
        }
        .upload-zone:active { border-color: var(--accent); }
        .file-loaded { font-size: var(--font-size-md); }
        .file-retry { font-size: var(--font-size-xs); color: var(--text-hint); }
        .file-empty { color: var(--text-secondary); font-size: var(--font-size-md); }

        /* Manual */
        .manual-form {
          background: var(--bg-card); border-radius: var(--radius-md);
          padding: 16px; box-shadow: var(--shadow-sm);
        }
        .manual-form input, .manual-form select {
          width: 100%; padding: 10px 12px; border-radius: var(--radius-sm);
          background: var(--bg-input); font-size: var(--font-size-md);
          border: 1px solid transparent; margin-bottom: 8px;
        }
        .manual-form input:focus, .manual-form select:focus { border-color: var(--accent); }
        .mf-name { font-size: var(--font-size-lg) !important; font-weight: 600; }
        .ef-row-2 { display: flex; gap: 8px; }
        .ef-row-2 input { flex: 1; }
        .ef-row-3 { display: flex; gap: 8px; align-items: center; margin-bottom: 8px; }
        .ef-row-3 > select, .ef-row-3 > input[type="time"] { flex: 1; margin-bottom: 0; }
        .ef-field { flex: 1; }
        .ef-field label { display: block; font-size: var(--font-size-xs); color: var(--text-secondary); margin-bottom: 2px; }
        .ef-field input[type="number"] { margin-bottom: 0; text-align: center; }
        .ef-colors { display: flex; gap: 4px; flex-wrap: wrap; }
        .ef-c { width: 24px; height: 24px; border-radius: 50%; border: 2px solid transparent; }
        .ef-c.sel { border-color: var(--text-primary); }
        .ef-save-btn {
          width: 100%; margin-top: 12px; padding: 12px;
          background: var(--accent); color: #0a3d25;
          border-radius: var(--radius-sm); font-size: var(--font-size-md); font-weight: 600;
        }

        /* Parsed results */
        .parsed-section { margin-top: 20px; }
        .parsed-section h3 { font-size: var(--font-size-md); margin-bottom: 4px; }
        .parsed-hint { font-size: var(--font-size-sm); color: var(--text-hint); margin-bottom: 12px; }
        .parsed-card {
          background: var(--bg-card); border-radius: var(--radius-md);
          padding: 12px; margin-bottom: 10px;
          border: 1px solid rgba(255,255,255,0.06);
        }
        .pc-header { display: flex; align-items: center; gap: 8px; margin-bottom: 6px; }
        .pc-dot { width: 10px; height: 10px; border-radius: 50%; flex-shrink: 0; }
        .pc-name { flex: 1; padding: 6px 8px; border-radius: var(--radius-sm); background: var(--bg-input); font-size: var(--font-size-md); font-weight: 600; border: 1px solid transparent; }
        .pc-name:focus { border-color: var(--accent); }
        .pc-btn { width: 32px; height: 32px; border-radius: 50%; font-size: 16px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
        .pc-import { background: rgba(94,234,180,0.2); color: #5eeab4; }
        .pc-body { display: flex; gap: 6px; align-items: center; margin-top: 4px; }
        .pc-sm { padding: 6px 8px; border-radius: var(--radius-sm); background: var(--bg-input); font-size: var(--font-size-sm); border: 1px solid transparent; flex: 1; }
        .pc-sm:focus { border-color: var(--accent); }
        .pc-num { width: 60px; flex: none; text-align: center; }
        .pc-lbl { font-size: var(--font-size-xs); color: var(--text-secondary); white-space: nowrap; }

        .import-all-btn {
          width: 100%; margin-top: 12px; padding: 14px;
          background: var(--success); color: #fff;
          border-radius: var(--radius-md); font-size: var(--font-size-md); font-weight: 600;
          box-shadow: var(--shadow-md); position: sticky; bottom: 70px;
        }

        .no-result {
          margin-top: 20px; padding: 24px; text-align: center;
          background: #fffbe6; border-radius: var(--radius-md);
          font-size: var(--font-size-sm); color: #8b6914;
        }
        .no-result p + p { margin-top: 8px; color: #b8902a; }
      `}</style>
    </div>
  );
}
