import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { adminApi, servicesApi } from '../services/api';
import { useToast } from '../context/ToastContext';
import LoadingSpinner from '../components/LoadingSpinner';
import { FiUsers, FiCalendar, FiPackage, FiDollarSign, FiPlus, FiEdit2, FiTrash2, FiX, FiSave } from 'react-icons/fi';
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell, Legend
} from 'recharts';

const CHART_COLORS = ['#6366f1', '#f59e0b', '#10b981', '#3b82f6'];
const EMPTY_SERVICE = { title: '', description: '', category: 'hotel', price: '', location: '', image: '', capacity: 2, amenities: '' };

export default function AdminPage() {
    const toast = useToast();
    const [activeTab, setActiveTab] = useState('dashboard');
    const [stats, setStats] = useState(null);
    const [recentBookings, setRecentBookings] = useState([]);
    const [services, setServices] = useState([]);
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);

    const [showForm, setShowForm] = useState(false);
    const [editingService, setEditingService] = useState(null);
    const [formData, setFormData] = useState(EMPTY_SERVICE);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        const load = async () => {
            setLoading(true);
            try {
                const [statsRes, servicesRes, usersRes] = await Promise.all([
                    adminApi.getStats(),
                    servicesApi.getAdminAll(),
                    adminApi.getUsers(),
                ]);
                setStats(statsRes.data.stats);
                setRecentBookings(statsRes.data.recentBookings);
                setServices(servicesRes.data.services);
                setUsers(usersRes.data.users);
            } catch (err) {
                toast.error('Ошибка загрузки данных');
            } finally {
                setLoading(false);
            }
        };
        load();
    }, []);

    const handleSaveService = async (e) => {
        e.preventDefault();
        if (!formData.title || !formData.price || !formData.location) { toast.error('Заполните обязательные поля'); return; }
        setSaving(true);
        try {
            const payload = { ...formData, price: Number(formData.price), amenities: formData.amenities ? formData.amenities.split(',').map(a => a.trim()) : [] };
            if (editingService) {
                const res = await servicesApi.update(editingService._id, payload);
                setServices(prev => prev.map(s => s._id === editingService._id ? res.data.service : s));
                toast.success('Услуга обновлена');
            } else {
                const res = await servicesApi.create(payload);
                setServices(prev => [res.data.service, ...prev]);
                toast.success('Услуга создана');
            }
            setShowForm(false); setEditingService(null); setFormData(EMPTY_SERVICE);
        } catch (err) {
            toast.error(err.response?.data?.message || 'Ошибка сохранения');
        } finally {
            setSaving(false);
        }
    };

    const handleEdit = (s) => {
        setEditingService(s);
        setFormData({ ...s, amenities: s.amenities?.join(', ') || '', price: String(s.price) });
        setShowForm(true);
        setActiveTab('services');
    };

    const handleDelete = async (id) => {
        if (!confirm('Удалить услугу?')) return;
        try {
            await servicesApi.delete(id);
            setServices(prev => prev.filter(s => s._id !== id));
            toast.success('Услуга удалена');
        } catch (err) {
            toast.error('Ошибка удаления');
        }
    };

    const handleUserRoleChange = async (userId, role) => {
        try {
            await adminApi.updateUserRole(userId, role);
            setUsers(prev => prev.map(u => u._id === userId ? { ...u, role } : u));
            toast.success('Роль обновлена');
        } catch {
            toast.error('Ошибка обновления роли');
        }
    };

    if (loading) return <LoadingSpinner message="Загрузка панели управления..." />;

    const STAT_CARDS = [
        { label: 'Пользователей', value: stats?.totalUsers, icon: <FiUsers />, color: '#6366f1' },
        { label: 'Бронирований', value: stats?.totalBookings, icon: <FiCalendar />, color: '#f59e0b' },
        { label: 'Услуг', value: stats?.totalServices, icon: <FiPackage />, color: '#10b981' },
        { label: 'Выручка (KZT)', value: stats?.totalRevenue?.toLocaleString(), icon: <FiDollarSign />, color: '#3b82f6' },
    ];

    const TABS = ['dashboard', 'services', 'users', 'bookings'];
    const TAB_LABELS = { dashboard: '📊 Статистика', services: '📦 Услуги', users: '👥 Пользователи', bookings: '📋 Бронирования' };

    return (
        <div style={{ padding: '2rem 0 4rem' }}>
            <div className="page-header">
                <div className="container">
                    <h1 className="page-title">🛡 Панель <span className="gradient-text">администратора</span></h1>
                </div>
            </div>

            <div className="container" style={{ padding: '2rem 1.5rem' }}>
                {/* Tab bar */}
                <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
                    {TABS.map(t => (
                        <button key={t} className={`btn btn-sm ${activeTab === t ? 'btn-primary' : 'btn-outline'}`} onClick={() => setActiveTab(t)}>
                            {TAB_LABELS[t]}
                        </button>
                    ))}
                </div>

                {/* Dashboard stats */}
                {activeTab === 'dashboard' && (
                    <>
                        <div className="stats-grid" style={{ marginBottom: '2rem' }}>
                            {STAT_CARDS.map((c) => (
                                <div key={c.label} className="stat-card">
                                    <div className="stat-card-icon" style={{ background: c.color + '22', color: c.color }}>{c.icon}</div>
                                    <div className="stat-card-value">{c.value}</div>
                                    <div className="stat-card-label">{c.label}</div>
                                </div>
                            ))}
                        </div>

                        {/* ✅ Charts Section */}
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '2rem', marginBottom: '3rem' }}>
                            {/* Monthly Revenue Chart */}
                            <div className="card" style={{ padding: '1.5rem', minHeight: '350px' }}>
                                <h3 style={{ marginBottom: '1.5rem', fontSize: '1.1rem' }}>Выручка по месяцам (KZT)</h3>
                                <div style={{ width: '100%', height: '250px' }}>
                                    <ResponsiveContainer>
                                        <AreaChart data={stats?.monthlyRevenue || []}>
                                            <defs>
                                                <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                                                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                                                </linearGradient>
                                            </defs>
                                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                                            <XAxis dataKey="name" stroke="var(--color-text-muted)" fontSize={11} />
                                            <YAxis stroke="var(--color-text-muted)" fontSize={11} />
                                            <Tooltip 
                                                contentStyle={{ background: '#1a1a2e', border: '1px solid var(--color-border)', borderRadius: '8px' }}
                                                itemStyle={{ color: '#6366f1' }}
                                            />
                                            <Area type="monotone" dataKey="total" stroke="#6366f1" fillOpacity={1} fill="url(#colorTotal)" />
                                        </AreaChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>

                            {/* Category Distribution Chart */}
                            <div className="card" style={{ padding: '1.5rem', minHeight: '350px' }}>
                                <h3 style={{ marginBottom: '1.5rem', fontSize: '1.1rem' }}>Бронирования по категориям</h3>
                                <div style={{ width: '100%', height: '250px' }}>
                                    <ResponsiveContainer>
                                        <PieChart>
                                            <Pie
                                                data={stats?.categoryStats || []}
                                                cx="50%" cy="50%"
                                                innerRadius={60}
                                                outerRadius={80}
                                                paddingAngle={5}
                                                dataKey="value"
                                            >
                                                {(stats?.categoryStats || []).map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                                                ))}
                                            </Pie>
                                            <Tooltip 
                                                contentStyle={{ background: '#1a1a2e', border: '1px solid var(--color-border)', borderRadius: '8px' }}
                                            />
                                            <Legend />
                                        </PieChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                        </div>

                        <h3 style={{ marginBottom: '1rem' }}>Последние бронирования</h3>
                        <div className="table-container shadow-sm">
                            <table className="data-table">
                                <thead>
                                    <tr>
                                        <th>Пользователь</th><th>Услуга</th><th>Статус</th><th>Оплата</th><th>Сумма</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {recentBookings.map((b) => (
                                        <tr key={b._id}>
                                            <td>{b.user?.name}<br /><span style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)' }}>{b.user?.email}</span></td>
                                            <td>{b.service?.title}</td>
                                            <td><span className={`badge ${b.status === 'confirmed' ? 'badge-success' : b.status === 'cancelled' ? 'badge-danger' : 'badge-warning'}`}>{b.status}</span></td>
                                            <td><span className={`badge ${b.paymentStatus === 'paid' ? 'badge-success' : 'badge-danger'}`}>{b.paymentStatus}</span></td>
                                            <td style={{ fontWeight: 700 }}>{b.totalPrice?.toLocaleString()} KZT</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </>
                )}

                {/* Services CRUD */}
                {activeTab === 'services' && (
                    <>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                            <h3>Управление услугами</h3>
                            <button className="btn btn-primary btn-sm" onClick={() => { setShowForm(true); setEditingService(null); setFormData(EMPTY_SERVICE); }}>
                                <FiPlus /> Добавить услугу
                            </button>
                        </div>

                        {showForm && (
                            <div className="card shadow-lg" style={{ padding: '1.75rem', marginBottom: '2rem', border: '1px solid var(--color-primary)' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
                                    <h4>{editingService ? 'Редактировать услугу' : 'Новая услуга'}</h4>
                                    <button className="btn btn-ghost btn-sm" onClick={() => { setShowForm(false); setEditingService(null); }}><FiX /></button>
                                </div>
                                <form onSubmit={handleSaveService}>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                        {[
                                            { name: 'title', label: 'Название *', placeholder: 'Гранд Отель Алматы' },
                                            { name: 'location', label: 'Местоположение *', placeholder: 'Алматы, ул. Примерная 1' },
                                            { name: 'price', label: 'Цена (KZT) *', type: 'number', placeholder: '15000' },
                                            { name: 'capacity', label: 'Вместимость', type: 'number', placeholder: '2' },
                                            { name: 'image', label: 'URL изображения', placeholder: 'https://...' },
                                            { name: 'amenities', label: 'Удобства (через запятую)', placeholder: 'WiFi, Завтрак, Бассейн' },
                                        ].map((f) => (
                                            <div className="form-group" key={f.name} style={{ margin: 0 }}>
                                                <label className="form-label">{f.label}</label>
                                                <input type={f.type || 'text'} className="form-input" value={formData[f.name]} onChange={(e) => setFormData(p => ({ ...p, [f.name]: e.target.value }))} placeholder={f.placeholder} />
                                            </div>
                                        ))}
                                        <div className="form-group" style={{ margin: 0 }}>
                                            <label className="form-label">Категория</label>
                                            <select className="form-input form-select" value={formData.category} onChange={(e) => setFormData(p => ({ ...p, category: e.target.value }))}>
                                                {['hotel', 'restaurant', 'event', 'transport'].map(c => <option key={c} value={c}>{c}</option>)}
                                            </select>
                                        </div>
                                    </div>
                                    <div className="form-group" style={{ marginTop: '1rem' }}>
                                        <label className="form-label">Описание</label>
                                        <textarea className="form-input" rows={3} value={formData.description} onChange={(e) => setFormData(p => ({ ...p, description: e.target.value }))} placeholder="Описание услуги..." style={{ resize: 'vertical' }} />
                                    </div>
                                    <button type="submit" className="btn btn-primary" disabled={saving}>
                                        {saving ? <><div className="spinner spinner-sm" /> Сохранение...</> : <><FiSave /> {editingService ? 'Сохранить' : 'Создать'}</>}
                                    </button>
                                </form>
                            </div>
                        )}

                        <div className="table-container shadow-sm">
                            <table className="data-table">
                                <thead><tr><th>Название</th><th>Категория</th><th>Цена</th><th>Рейтинг</th><th>Статус</th><th>Действия</th></tr></thead>
                                <tbody>
                                    {services.map((s) => (
                                        <tr key={s._id}>
                                            <td style={{ fontWeight: 600 }}>{s.title}</td>
                                            <td><span className="badge badge-info">{s.category}</span></td>
                                            <td>{s.price.toLocaleString()} KZT</td>
                                            <td>⭐ {s.rating} ({s.reviewCount})</td>
                                            <td><span className={`badge ${s.isActive ? 'badge-success' : 'badge-danger'}`}>{s.isActive ? 'Активна' : 'Скрыта'}</span></td>
                                            <td>
                                                <div style={{ display: 'flex', gap: '0.5rem' }}>
                                                    <button className="btn btn-outline btn-sm" onClick={() => handleEdit(s)}><FiEdit2 size={13} /></button>
                                                    <button className="btn btn-danger btn-sm" onClick={() => handleDelete(s._id)}><FiTrash2 size={13} /></button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </>
                )}

                {/* Users */}
                {activeTab === 'users' && (
                    <>
                        <h3 style={{ marginBottom: '1.5rem' }}>Пользователи системы</h3>
                        <div className="table-container shadow-sm">
                            <table className="data-table">
                                <thead><tr><th>Имя</th><th>Email</th><th>Телефон</th><th>Роль</th><th>Дата регистрации</th></tr></thead>
                                <tbody>
                                    {users.map((u) => (
                                        <tr key={u._id}>
                                            <td style={{ fontWeight: 600 }}>{u.name}</td>
                                            <td>{u.email}</td>
                                            <td style={{ color: 'var(--color-text-muted)' }}>{u.phone || '—'}</td>
                                            <td>
                                                <select
                                                    className="form-input form-select"
                                                    style={{ padding: '0.3rem 2rem 0.3rem 0.5rem', fontSize: '0.8rem', width: 'auto' }}
                                                    value={u.role}
                                                    onChange={(e) => handleUserRoleChange(u._id, e.target.value)}
                                                >
                                                    <option value="user">user</option>
                                                    <option value="admin">admin</option>
                                                </select>
                                            </td>
                                            <td style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem' }}>
                                                {new Date(u.createdAt).toLocaleDateString('ru-RU')}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </>
                )}

                {/* Bookings Full List */}
                {activeTab === 'bookings' && (
                    <>
                        <h3 style={{ marginBottom: '1.5rem' }}>Все бронирования</h3>
                        <div className="table-container shadow-sm">
                            <table className="data-table">
                                <thead><tr><th>ID</th><th>Пользователь</th><th>Услуга</th><th>Заезд</th><th>Статус</th><th>Оплата</th><th>Сумма</th></tr></thead>
                                <tbody>
                                    {recentBookings.map((b) => (
                                        <tr key={b._id}>
                                            <td style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>{b._id.slice(-8)}</td>
                                            <td>{b.user?.name}</td>
                                            <td>{b.service?.title}</td>
                                            <td style={{ fontSize: '0.85rem' }}>{new Date(b.checkIn).toLocaleDateString('ru-RU')}</td>
                                            <td><span className={`badge ${b.status === 'confirmed' ? 'badge-success' : b.status === 'cancelled' ? 'badge-danger' : 'badge-warning'}`}>{b.status}</span></td>
                                            <td><span className={`badge ${b.paymentStatus === 'paid' ? 'badge-success' : 'badge-danger'}`}>{b.paymentStatus}</span></td>
                                            <td style={{ fontWeight: 700 }}>{b.totalPrice?.toLocaleString()} ₸</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
