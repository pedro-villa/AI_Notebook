import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  BrainCircuit, LayoutDashboard, FilePlus, FileText,
  HelpCircle, ShieldCheck, Activity, LogOut, Menu, X,
  ChevronRight, AlertTriangle,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const NAV_ITEMS = [
  { label: 'Dashboard',    icon: LayoutDashboard, path: '/dashboard' },
  { label: 'Log AI Usage', icon: FilePlus,         path: '/log' },
  { label: 'Declarations', icon: FileText,         path: '/declarations' },
  { label: 'Help Center',  icon: HelpCircle,       path: '/help' },
];

const ADMIN_ITEMS = [
  { label: 'Admin Panel',    icon: ShieldCheck, path: '/admin' },
  { label: 'System Status',  icon: Activity,    path: '/system' },
];

export default function AppLayout({ children }) {
  const location  = useLocation();
  const navigate  = useNavigate();
  const { user, logout, idleWarning, idleRemaining, resetInactivity } = useAuth();
  const [open, setOpen] = useState(false);

  const handleLogout = () => { logout(); navigate('/login'); };

  const isAdmin = user?.role === 'admin';

  const NavLink = ({ item }) => {
    const active = location.pathname === item.path;
    return (
      <Link
        to={item.path}
        onClick={() => setOpen(false)}
        style={{
          display: 'flex', alignItems: 'center', gap: '0.75rem',
          padding: '0.65rem 1rem', borderRadius: 'var(--radius-md)',
          textDecoration: 'none',
          background: active ? 'var(--accent-bg)' : 'transparent',
          color: active ? 'var(--accent-color)' : 'var(--text-secondary)',
          fontWeight: active ? 600 : 400,
          borderLeft: active ? '3px solid var(--accent-color)' : '3px solid transparent',
          transition: 'all 0.18s',
          fontSize: '0.9rem',
        }}
        onMouseEnter={e => { if (!active) { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; e.currentTarget.style.color = 'var(--text-primary)'; } }}
        onMouseLeave={e => { if (!active) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-secondary)'; } }}
      >
        <item.icon size={18} />
        {item.label}
        {active && <ChevronRight size={14} style={{ marginLeft: 'auto' }} />}
      </Link>
    );
  };

  const sidebarContent = (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', padding: '1.25rem 0.75rem' }}>
      {/* Logo */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0 0.5rem', marginBottom: '2rem' }}>
        <BrainCircuit size={26} color="var(--accent-color)" />
        <div>
          <div style={{ fontWeight: 700, fontSize: '0.95rem', color: '#fff', lineHeight: 1.2 }}>AI Guidebook</div>
          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>NTNU Student Portal</div>
        </div>
      </div>

      {/* Student nav */}
      <div style={{ marginBottom: '0.5rem' }}>
        <div style={{ fontSize: '0.68rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', padding: '0 0.75rem', marginBottom: '0.4rem' }}>Student</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
          {NAV_ITEMS.map(item => <NavLink key={item.path} item={item} />)}
        </div>
      </div>

      {/* Admin nav */}
      {isAdmin && (
        <div style={{ marginBottom: '0.5rem' }}>
          <div style={{ fontSize: '0.68rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', padding: '0 0.75rem', marginBottom: '0.4rem', marginTop: '1rem' }}>
            Administration
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
            {ADMIN_ITEMS.map(item => <NavLink key={item.path} item={item} />)}
          </div>
        </div>
      )}

      {/* Spacer */}
      <div style={{ flex: 1 }} />

      {/* User info + logout */}
      <div style={{ borderTop: '1px solid var(--panel-border)', paddingTop: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        <div style={{ padding: '0.5rem 0.75rem', background: 'rgba(255,255,255,0.03)', borderRadius: 'var(--radius-md)' }}>
          <div style={{ fontSize: '0.82rem', fontWeight: 600, color: '#fff' }}>{user?.username ?? 'Student'}</div>
          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{user?.role === 'admin' ? 'Administrator' : 'Student'} · NTNU</div>
        </div>
        <button
          onClick={handleLogout}
          style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', padding: '0.55rem 0.75rem', borderRadius: 'var(--radius-md)', background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', width: '100%', fontSize: '0.88rem', transition: 'all 0.18s' }}
          onMouseEnter={e => { e.currentTarget.style.background = 'var(--danger-bg)'; e.currentTarget.style.color = 'var(--danger-color)'; }}
          onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-secondary)'; }}
        >
          <LogOut size={16} /> Sign Out
        </button>
      </div>
    </div>
  );

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      {/* Desktop sidebar */}
      <aside style={{ width: 220, flexShrink: 0, background: 'rgba(13,17,23,0.95)', borderRight: '1px solid var(--panel-border)', position: 'fixed', top: 0, left: 0, height: '100vh', zIndex: 200, overflowY: 'auto' }}>
        {sidebarContent}
      </aside>

      {/* Mobile overlay */}
      {open && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 300, display: 'flex' }}>
          <div style={{ background: 'rgba(0,0,0,0.6)', position: 'absolute', inset: 0 }} onClick={() => setOpen(false)} />
          <aside style={{ width: 240, background: 'rgba(13,17,23,0.98)', height: '100vh', position: 'relative', zIndex: 1, borderRight: '1px solid var(--panel-border)', overflowY: 'auto' }}>
            {sidebarContent}
          </aside>
          <button style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'var(--panel-bg)', border: '1px solid var(--panel-border)', color: 'var(--text-primary)', borderRadius: 'var(--radius-md)', padding: '0.5rem', cursor: 'pointer', zIndex: 2 }} onClick={() => setOpen(false)}>
            <X size={20} />
          </button>
        </div>
      )}

      {/* Mobile hamburger */}
      <button className="mobile-hamburger" onClick={() => setOpen(true)}>
        <Menu size={22} />
      </button>

      {/* Main content */}
      <main style={{ flex: 1, marginLeft: 220, minWidth: 0, padding: '0 1.5rem 3rem', boxSizing: 'border-box' }}>
        {idleWarning && (
          <div style={{ background: 'var(--danger-bg)', border: '1px solid var(--danger-color)', borderRadius: 'var(--radius-md)', padding: '0.6rem 1rem', marginTop: 'var(--spacing-lg)', marginBottom: 'var(--spacing-md)', display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'var(--danger-color)', fontSize: '0.88rem' }}>
            <AlertTriangle size={16} />
            <span><strong>Inactivity Warning</strong> — You will be signed out in <strong>{Math.floor(idleRemaining / 60)}:{String(idleRemaining % 60).padStart(2, '0')}</strong> due to 15 minutes of inactivity.</span>
            <button style={{ marginLeft: 'auto', background: 'var(--danger-color)', border: 'none', borderRadius: 'var(--radius-sm)', color: '#fff', padding: '0.25rem 0.75rem', cursor: 'pointer', fontSize: '0.8rem' }} onClick={resetInactivity}>Stay Signed In</button>
          </div>
        )}
        {children}
      </main>
    </div>
  );
}
