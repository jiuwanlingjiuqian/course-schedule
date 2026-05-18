import { Routes, Route, useLocation } from 'react-router-dom';
import { CSSTransition, TransitionGroup } from 'react-transition-group';
import BottomNav from './components/BottomNav';
import Schedule from './pages/Schedule';
import Import from './pages/Import';
import Settings from './pages/Settings';

export default function App() {
  const location = useLocation();

  return (
    <div className="app-container">
      <main className="app-main">
        <TransitionGroup component={null}>
          <CSSTransition key={location.pathname} timeout={300} classNames="page">
            <Routes location={location}>
              <Route path="/" element={<Schedule />} />
              <Route path="/import" element={<Import />} />
              <Route path="/settings" element={<Settings />} />
            </Routes>
          </CSSTransition>
        </TransitionGroup>
      </main>
      <BottomNav />
      <style>{`
        .app-container {
          display: flex;
          flex-direction: column;
          height: 100%;
          max-width: 500px;
          margin: 0 auto;
          position: relative;
          z-index: 1;
        }
        .app-main {
          flex: 1;
          overflow-y: auto;
          padding-bottom: 12px;
          position: relative;
        }
        .bottom-nav {
          display: flex;
          justify-content: space-around;
          align-items: center;
          height: var(--nav-height);
          background: var(--nav-bg);
          border-top: 1px solid rgba(255,255,255,0.08);
          flex-shrink: 0;
          padding-bottom: env(safe-area-inset-bottom);
          z-index: 10;
        }
        .nav-item {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 2px;
          padding: 6px 16px;
          border-radius: var(--radius-sm);
          color: var(--nav-inactive);
          position: relative;
        }
        .nav-item.active {
          color: var(--nav-active);
        }
        .nav-item.active::after {
          content: '';
          position: absolute;
          bottom: -4px;
          width: 20px;
          height: 3px;
          background: var(--nav-active);
          border-radius: 2px;
        }
        .nav-icon {
          font-size: 22px;
        }
        .nav-label {
          font-size: var(--font-size-xs);
        }

        /* Page transitions */
        .page-enter {
          opacity: 0;
          transform: translateY(12px);
        }
        .page-enter-active {
          opacity: 1;
          transform: translateY(0);
          transition: all 0.3s ease-out;
        }
        .page-exit {
          opacity: 1;
          transform: translateY(0);
        }
        .page-exit-active {
          opacity: 0;
          transform: translateY(-12px);
          transition: all 0.2s ease-in;
        }
      `}</style>
    </div>
  );
}
