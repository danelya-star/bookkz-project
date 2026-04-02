import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authApi } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { FiMail, FiLock, FiEye, FiEyeOff } from 'react-icons/fi';

export default function LoginPage() {
    const navigate = useNavigate();
    const { login } = useAuth();
    const toast = useToast();
    const [form, setForm] = useState({ email: '', password: '' });
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const [showPass, setShowPass] = useState(false);

    const validate = () => {
        const e = {};
        if (!form.email) e.email = 'Введите email';
        else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = 'Некорректный email';
        if (!form.password) e.password = 'Введите пароль';
        setErrors(e);
        return Object.keys(e).length === 0;
    };

    const handleChange = (e) => { setForm((p) => ({ ...p, [e.target.name]: e.target.value })); setErrors((p) => ({ ...p, [e.target.name]: '' })); };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validate()) return;
        setLoading(true);
        try {
            const res = await authApi.login(form);
            login(res.data.token, res.data.user);
            toast.success(`Добро пожаловать, ${res.data.user.name}!`);
            navigate(res.data.user.role === 'admin' ? '/admin' : '/dashboard');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Ошибка входа');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-page">
            <div className="auth-card">
                <div style={{ textAlign: 'center', fontSize: '2.5rem', marginBottom: '0.5rem' }}>✦</div>
                <h1 className="auth-title">Вход в аккаунт</h1>
                <p className="auth-subtitle">Рады вас видеть снова!</p>

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label className="form-label"><FiMail size={12} /> Email</label>
                        <input type="email" name="email" className={`form-input ${errors.email ? 'error' : ''}`} value={form.email} onChange={handleChange} placeholder="вы@example.com" autoComplete="email" />
                        {errors.email && <div className="form-error">⚠ {errors.email}</div>}
                    </div>
                    <div className="form-group">
                        <label className="form-label"><FiLock size={12} /> Пароль</label>
                        <div style={{ position: 'relative' }}>
                            <input type={showPass ? 'text' : 'password'} name="password" className={`form-input ${errors.password ? 'error' : ''}`} value={form.password} onChange={handleChange} placeholder="••••••••" autoComplete="current-password" style={{ paddingRight: '2.5rem' }} />
                            <button type="button" onClick={() => setShowPass(!showPass)} style={{ position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-muted)' }}>
                                {showPass ? <FiEyeOff size={16} /> : <FiEye size={16} />}
                            </button>
                        </div>
                        {errors.password && <div className="form-error">⚠ {errors.password}</div>}
                    </div>

                    <button type="submit" className="btn btn-primary btn-full btn-lg" disabled={loading}>
                        {loading ? <><div className="spinner spinner-sm" /> Вход...</> : 'Войти'}
                    </button>
                </form>

                <div className="auth-divider">Демо-аккаунты</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <button className="btn btn-outline btn-sm" onClick={() => setForm({ email: 'user@booking.kz', password: 'user1234' })}>
                        👤 Пользователь: user@booking.kz
                    </button>
                    <button className="btn btn-outline btn-sm" onClick={() => setForm({ email: 'admin@booking.kz', password: 'admin123' })}>
                        🛡 Админ: admin@booking.kz
                    </button>
                </div>

                <div className="auth-footer">
                    Нет аккаунта? <Link to="/register" className="auth-link">Зарегистрироваться</Link>
                </div>
            </div>
        </div>
    );
}
