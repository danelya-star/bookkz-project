import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { authApi } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import { FiUser, FiCalendar, FiLock, FiLogOut, FiEdit2, FiSave, FiX } from 'react-icons/fi';

export default function DashboardPage() {
    const { user, logout, updateUser, isAdmin } = useAuth();
    const navigate = useNavigate();
    const toast = useToast();

    const [editMode, setEditMode] = useState(false);
    const [form, setForm] = useState({ name: user?.name || '', phone: user?.phone || '' });
    const [pwForm, setPwForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
    const [pwErrors, setPwErrors] = useState({});
    const [saving, setSaving] = useState(false);
    const [changingPw, setChangingPw] = useState(false);
    const [activeTab, setActiveTab] = useState('profile');

    const handleSaveProfile = async (e) => {
        e.preventDefault();
        if (!form.name.trim()) { toast.error('Имя не должно быть пустым'); return; }
        setSaving(true);
        try {
            const res = await authApi.updateProfile(form);
            updateUser(res.data.user);
            toast.success('Профиль обновлён');
            setEditMode(false);
        } catch (err) {
            toast.error(err.response?.data?.message || 'Ошибка сохранения');
        } finally {
            setSaving(false);
        }
    };

    const validatePw = () => {
        const e = {};
        if (!pwForm.currentPassword) e.currentPassword = 'Введите текущий пароль';
        if (!pwForm.newPassword || pwForm.newPassword.length < 6) e.newPassword = 'Минимум 6 символов';
        if (pwForm.newPassword !== pwForm.confirmPassword) e.confirmPassword = 'Пароли не совпадают';
        setPwErrors(e);
        return Object.keys(e).length === 0;
    };

    const handleChangePassword = async (e) => {
        e.preventDefault();
        if (!validatePw()) return;
        setChangingPw(true);
        try {
            await authApi.changePassword({ currentPassword: pwForm.currentPassword, newPassword: pwForm.newPassword });
            toast.success('Пароль успешно изменён');
            setPwForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
        } catch (err) {
            toast.error(err.response?.data?.message || 'Ошибка смены пароля');
        } finally {
            setChangingPw(false);
        }
    };

    const handleLogout = () => { logout(); navigate('/'); };

    const initials = user?.name?.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase() || 'U';

    return (
        <div className="container" style={{ padding: '2rem 1.5rem 4rem' }}>
            <div className="dashboard-grid">
                {/* Sidebar */}
                <aside className="sidebar">
                    <div className="sidebar-avatar">{initials}</div>
                    <div className="sidebar-name">{user?.name}</div>
                    <div className="sidebar-email">{user?.email}</div>
                    {user?.role === 'admin' && (
                        <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
                            <span className="badge badge-warning">🛡 Администратор</span>
                        </div>
                    )}
                    <nav className="sidebar-nav">
                        <button className={`sidebar-link ${activeTab === 'profile' ? 'active' : ''}`} onClick={() => setActiveTab('profile')} style={{ border: 'none', cursor: 'pointer', background: 'none', width: '100%', textAlign: 'left' }}>
                            <FiUser size={16} /> Профиль
                        </button>
                        <Link to="/bookings" className="sidebar-link"><FiCalendar size={16} /> Мои бронирования</Link>
                        <button className={`sidebar-link ${activeTab === 'password' ? 'active' : ''}`} onClick={() => setActiveTab('password')} style={{ border: 'none', cursor: 'pointer', background: 'none', width: '100%', textAlign: 'left' }}>
                            <FiLock size={16} /> Смена пароля
                        </button>
                        {isAdmin && (
                            <Link to="/admin" className="sidebar-link" style={{ color: 'var(--color-secondary)' }}>🛡 Панель Admin</Link>
                        )}
                        <button className="sidebar-link" onClick={handleLogout} style={{ border: 'none', cursor: 'pointer', background: 'none', width: '100%', textAlign: 'left', color: 'var(--color-danger)' }}>
                            <FiLogOut size={16} /> Выйти
                        </button>
                    </nav>
                </aside>

                {/* Main content */}
                <main>
                    {activeTab === 'profile' && (
                        <div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                                <h2 style={{ fontSize: '1.4rem', fontWeight: 700 }}>Личные данные</h2>
                                {!editMode ? (
                                    <button className="btn btn-outline btn-sm" onClick={() => setEditMode(true)}><FiEdit2 size={14} /> Редактировать</button>
                                ) : (
                                    <button className="btn btn-ghost btn-sm" onClick={() => setEditMode(false)}><FiX size={14} /> Отмена</button>
                                )}
                            </div>

                            <div className="card">
                                <div className="card-body">
                                    <form onSubmit={handleSaveProfile}>
                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
                                            <div className="form-group">
                                                <label className="form-label">Имя</label>
                                                <input type="text" className="form-input" value={form.name} onChange={(e) => setForm(p => ({ ...p, name: e.target.value }))} disabled={!editMode} />
                                            </div>
                                            <div className="form-group">
                                                <label className="form-label">Телефон</label>
                                                <input type="tel" className="form-input" value={form.phone} onChange={(e) => setForm(p => ({ ...p, phone: e.target.value }))} disabled={!editMode} placeholder="+7 700 000 0000" />
                                            </div>
                                            <div className="form-group">
                                                <label className="form-label">Email</label>
                                                <input type="email" className="form-input" value={user?.email || ''} disabled style={{ opacity: 0.6 }} />
                                            </div>
                                            <div className="form-group">
                                                <label className="form-label">Роль</label>
                                                <input type="text" className="form-input" value={user?.role === 'admin' ? 'Администратор' : 'Пользователь'} disabled style={{ opacity: 0.6 }} />
                                            </div>
                                        </div>
                                        {editMode && (
                                            <button type="submit" className="btn btn-primary" disabled={saving}>
                                                {saving ? <><div className="spinner spinner-sm" /> Сохранение...</> : <><FiSave size={14} /> Сохранить</>}
                                            </button>
                                        )}
                                    </form>
                                </div>
                            </div>

                            <div style={{ marginTop: '2rem' }}>
                                <h3 style={{ marginBottom: '1rem', fontSize: '1.1rem' }}>Быстрые действия</h3>
                                <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                                    <Link to="/services" className="btn btn-outline">🔍 Смотреть услуги</Link>
                                    <Link to="/bookings" className="btn btn-outline">📋 Мои бронирования</Link>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'password' && (
                        <div>
                            <h2 style={{ fontSize: '1.4rem', fontWeight: 700, marginBottom: '1.5rem' }}>Смена пароля</h2>
                            <div className="card">
                                <div className="card-body">
                                    <form onSubmit={handleChangePassword} style={{ maxWidth: '400px' }}>
                                        {[
                                            { name: 'currentPassword', label: 'Текущий пароль' },
                                            { name: 'newPassword', label: 'Новый пароль' },
                                            { name: 'confirmPassword', label: 'Подтвердите пароль' },
                                        ].map((f) => (
                                            <div className="form-group" key={f.name}>
                                                <label className="form-label">{f.label}</label>
                                                <input type="password" className={`form-input ${pwErrors[f.name] ? 'error' : ''}`} value={pwForm[f.name]} onChange={(e) => setPwForm(p => ({ ...p, [f.name]: e.target.value }))} />
                                                {pwErrors[f.name] && <div className="form-error">⚠ {pwErrors[f.name]}</div>}
                                            </div>
                                        ))}
                                        <button type="submit" className="btn btn-primary" disabled={changingPw}>
                                            {changingPw ? <><div className="spinner spinner-sm" /> Обновление...</> : '🔒 Обновить пароль'}
                                        </button>
                                    </form>
                                </div>
                            </div>
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
}
