import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FiCalendar, FiUser, FiLogOut, FiMenu, FiX, FiShield } from 'react-icons/fi';

export default function Navbar() {
    const { user, isAuthenticated, isAdmin, logout } = useAuth();
    const navigate = useNavigate();
    const [menuOpen, setMenuOpen] = useState(false);

    const handleLogout = () => {
        logout();
        navigate('/');
        setMenuOpen(false);
    };

    return (
        <nav className="navbar">
            <div className="container navbar-inner">
                <Link to="/" className="navbar-logo">✦ BookKZ</Link>

                <ul className="navbar-nav">
                    <li><NavLink to="/" className={({ isActive }) => 'navbar-link' + (isActive ? ' active' : '')}>Главная</NavLink></li>
                    <li><NavLink to="/services" className={({ isActive }) => 'navbar-link' + (isActive ? ' active' : '')}>Услуги</NavLink></li>
                    {isAuthenticated && (
                        <>
                            <li><NavLink to="/bookings" className={({ isActive }) => 'navbar-link' + (isActive ? ' active' : '')}>Бронирования</NavLink></li>
                            {isAdmin && (
                                <li><NavLink to="/admin" className={({ isActive }) => 'navbar-link' + (isActive ? ' active' : '')}>Панель админа</NavLink></li>
                            )}
                        </>
                    )}
                </ul>

                <div className="navbar-actions">
                    {isAuthenticated ? (
                        <>
                            <Link to="/dashboard" className="btn btn-outline btn-sm">
                                <FiUser size={14} /> {user?.name?.split(' ')[0]}
                            </Link>
                            <button onClick={handleLogout} className="btn btn-ghost btn-sm" title="Выйти">
                                <FiLogOut size={16} />
                            </button>
                        </>
                    ) : (
                        <>
                            <Link to="/login" className="btn btn-outline btn-sm">Войти</Link>
                            <Link to="/register" className="btn btn-primary btn-sm">Регистрация</Link>
                        </>
                    )}
                    <button className="navbar-hamburger" onClick={() => setMenuOpen(!menuOpen)} aria-label="Меню">
                        {menuOpen ? <><span /><span /><span /></> : <><span /><span /><span /></>}
                    </button>
                </div>
            </div>

            {/* Mobile drawer */}
            {menuOpen && (
                <div style={{
                    position: 'fixed', inset: 0, top: 'var(--navbar-height)',
                    background: 'rgba(15,15,26,0.98)', backdropFilter: 'blur(20px)',
                    zIndex: 999, padding: '2rem 1.5rem',
                    display: 'flex', flexDirection: 'column', gap: '0.5rem',
                }}>
                    <NavLink to="/" onClick={() => setMenuOpen(false)} className="navbar-link" style={{ fontSize: '1.1rem' }}>Главная</NavLink>
                    <NavLink to="/services" onClick={() => setMenuOpen(false)} className="navbar-link" style={{ fontSize: '1.1rem' }}>Услуги</NavLink>
                    {isAuthenticated && (
                        <>
                            <NavLink to="/dashboard" onClick={() => setMenuOpen(false)} className="navbar-link" style={{ fontSize: '1.1rem' }}>Личный кабинет</NavLink>
                            <NavLink to="/bookings" onClick={() => setMenuOpen(false)} className="navbar-link" style={{ fontSize: '1.1rem' }}>Бронирования</NavLink>
                            {isAdmin && <NavLink to="/admin" onClick={() => setMenuOpen(false)} className="navbar-link" style={{ fontSize: '1.1rem' }}>Панель админа</NavLink>}
                        </>
                    )}
                    <div style={{ marginTop: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                        {isAuthenticated ? (
                            <button onClick={handleLogout} className="btn btn-outline btn-full">Выйти</button>
                        ) : (
                            <>
                                <Link to="/login" className="btn btn-outline btn-full" onClick={() => setMenuOpen(false)}>Войти</Link>
                                <Link to="/register" className="btn btn-primary btn-full" onClick={() => setMenuOpen(false)}>Регистрация</Link>
                            </>
                        )}
                    </div>
                </div>
            )}
        </nav>
    );
}
