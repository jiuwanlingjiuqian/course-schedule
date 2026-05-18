import { createContext, useContext, useState, useCallback } from 'react';
import { loadCourses, saveCourses, loadSemester, saveSemester } from './utils/storage';
import { getCurrentWeek, getTodayDayOfWeek } from './utils/semester';

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [courses, setCourses] = useState(loadCourses);
  const [semester, setSemester] = useState(loadSemester);
  const [currentWeek, setCurrentWeek] = useState(() => {
    return getCurrentWeek(loadSemester().startDate, loadSemester().totalWeeks).currentWeek;
  });

  const updateCourses = useCallback((newCourses) => {
    setCourses(newCourses);
    saveCourses(newCourses);
  }, []);

  const updateSemester = useCallback((newSemester) => {
    setSemester(newSemester);
    saveSemester(newSemester);
    const { currentWeek } = getCurrentWeek(newSemester.startDate, newSemester.totalWeeks);
    setCurrentWeek(currentWeek);
  }, []);

  const refreshCurrentWeek = useCallback(() => {
    const { currentWeek } = getCurrentWeek(semester.startDate, semester.totalWeeks);
    setCurrentWeek(currentWeek);
    return currentWeek;
  }, [semester]);

  const todayDayOfWeek = getTodayDayOfWeek();

  return (
    <AppContext.Provider value={{
      courses, updateCourses,
      semester, updateSemester,
      currentWeek, setCurrentWeek, refreshCurrentWeek,
      todayDayOfWeek,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be inside AppProvider');
  return ctx;
}
