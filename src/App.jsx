import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { BrowserRouter, Navigate, NavLink, Route, Routes, useLocation } from 'react-router-dom';
import { CalendarDays, ChevronLeft, ClipboardCheck, LayoutDashboard, LogOut, Menu, Moon, Sun, Users, X } from 'lucide-react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { DataProvider, useData } from './context/DataContext';
import AuthPage from './pages/AuthPage';
import DashboardPage from './pages/DashboardPage';
import StudentsPage from './pages/StudentsPage';
import FollowUpPage from './pages/FollowUpPage';
import CoordinatorPage from './pages/CoordinatorPage';
import Loader from './components/Loader';
import './styles.css';

const navItems = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/students', label: 'Students & Feedback', icon: Users },
  { to: '/follow-up', label: 'FOLLOW UP', icon: ClipboardCheck },
];

function Toast() {
  const { notice } = useData();
  return (
    <AnimatePresence>
      {notice && (
        <motion.div
          className={`toast ${notice.tone}`}
          initial={{ opacity: 0, y: 22, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 14, scale: 0.96 }}
        >
          {notice.message}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function AppShell() {
  const { profile, signOut } = useAuth();
  const { loading } = useData();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [theme, setTheme] = useState(() => localStorage.getItem('edubia-theme') || 'light');

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    localStorage.setItem('edubia-theme', theme);
  }, [theme]);

  useEffect(() => setMobileOpen(false), [location.pathname]);

  if (loading) return <Loader />;

  return (
    <div className={`app-layout ${collapsed ? 'sidebar-collapsed' : ''}`}>
      <aside className={`sidebar ${mobileOpen ? 'mobile-open' : ''}`}>
        <div className="sidebar-top">
          <NavLink to="/dashboard" className="brand">
            <img src="/edubia-logo.png" alt="Edubia" />
            <div><strong>Edubia</strong><span>Instructor Hub</span></div>
          </NavLink>
          <button className="mobile-close" onClick={() => setMobileOpen(false)}><X size={20} /></button>
        </div>

        <nav className="sidebar-nav">
          {navItems.map(({ to, label, icon: Icon }) => (
            <NavLink key={to} to={to} className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
              <Icon size={20} /><span>{label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-bottom">
          <div className="profile-mini">
            <span>{(profile?.full_name || 'I').slice(0, 1).toUpperCase()}</span>
            <div><strong>{profile?.full_name || 'Instructor'}</strong><small>{profile?.email}</small></div>
          </div>
          <button className="sidebar-action" onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}>
            {theme === 'light' ? <Moon size={19} /> : <Sun size={19} />}<span>{theme === 'light' ? 'Dark mode' : 'Light mode'}</span>
          </button>
          <button className="sidebar-action danger" onClick={signOut}><LogOut size={19} /><span>Sign out</span></button>
        </div>

        <button className="collapse-button" onClick={() => setCollapsed(!collapsed)} title="Collapse sidebar"><ChevronLeft size={18} /></button>
      </aside>

      {mobileOpen && <button className="mobile-overlay" onClick={() => setMobileOpen(false)} aria-label="Close navigation" />}

      <div className="main-column">
        <header className="mobile-header">
          <button className="icon-button" onClick={() => setMobileOpen(true)}><Menu size={21} /></button>
          <div><img src="/edubia-logo.png" alt="" /><strong>Edubia</strong></div>
          <button className="icon-button" onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}>{theme === 'light' ? <Moon size={19} /> : <Sun size={19} />}</button>
        </header>
        <AnimatePresence mode="wait">
          <motion.main key={location.pathname} className="route-stage" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -5 }} transition={{ duration: 0.2 }}>
            <Routes location={location}>
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/students" element={<StudentsPage />} />
              <Route path="/follow-up" element={<FollowUpPage />} />
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
          </motion.main>
        </AnimatePresence>
      </div>
      <Toast />
    </div>
  );
}

function RootRoutes() {
  const { session, loading } = useAuth();
  const location = useLocation();

  if (location.pathname === '/coordinator') return <CoordinatorPage />;
  if (loading) return <Loader label="Checking your account…" />;
  if (!session) return <AuthPage />;

  return <DataProvider><AppShell /></DataProvider>;
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider><RootRoutes /></AuthProvider>
    </BrowserRouter>
  );
}
