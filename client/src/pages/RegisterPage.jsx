import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authApi } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { FiUser, FiMail, FiLock, FiPhone, FiEye, FiEyeOff } from 'react-icons/fi';

export default function RegisterPage() {
    const navigate = useNavigate();
    const { login } = useAuth();
    const toast = useToast();
    const [form, setForm] = useState({ name: '', email: '', password: '', phone: '' });
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const [showPass, setShowPass] = useState(false);

    const validate = () => {
        const e = {};
        if (!form.name.trim()) e.name = 'Введите имя';
        else if (form.name.trim().length < 2) e.name = 'Имя минимум 2 символа';
        if (!form.email) e.email = 'Введите email';
        else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = 'Некорректный email';
        if (!form.password) e.password = 'Введите пароль';
        else if (form.password.length < 6) e.password = 'Пароль минимум 6 символов';
        setErrors(e);
        return Object.keys(e).length === 0;
    };

    const handleChange = (e) => { setForm((p) => ({ ...p, [e.target.name]: e.target.value })); setErrors((p) => ({ ...p, [e.target.name]: '' })); };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validate()) return;
        setLoading(true);
        try {
            const res = await authApi.register(form);
            login(res.data.token, res.data.user);
            toast.success('Аккаунт создан. Добро пожаловать!');
            navigate('/dashboard');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Ошибка регистрации');
        } finally {
            setLoading(false);
        }
    };

    const fields = [
        { name: 'name', label: 'Ваше имя', type: 'text', icon: <FiUser size={12} />, placeholder: 'Иван Иванов', autocomplete: 'name' },
        { name: 'email', label: 'Email', type: 'email', icon: <FiMail size={12} />, placeholder: 'вы@example.com', autocomplete: 'email' },
        { name: 'phone', label: 'Телефон (необязательно)', type: 'tel', icon: <FiPhone size={12} />, placeholder: '+7 700 000 0000', autocomplete: 'tel' },
    ];

    return (
        <div className="auth-page">
            <div className="auth-card">
                <div style={{ textAlign: 'center', fontSize: '2.5rem', marginBottom: '0.5rem' }}>✦</div>
                <h1 className="auth-title">Создать аккаунт</h1>
                <p className="auth-subtitle">Регистрация займёт меньше минуты</p>

                <form onSubmit={handleSubmit}>
                    {fields.map((f) => (
                        <div className="form-group" key={f.name}>
                            <label className="form-label">{f.icon} {f.label}</label>
                            <input type={f.type} name={f.name} className={`form-input ${errors[f.name] ? 'error' : ''}`} value={form[f.name]} onChange={handleChange} placeholder={f.placeholder} autoComplete={f.autocomplete} />
                            {errors[f.name] && <div className="form-error">⚠ {errors[f.name]}</div>}
                        </div>
                    ))}

                    <div className="form-group">
                        <label className="form-label"><FiLock size={12} /> Пароль</label>
                        <div style={{ position: 'relative' }}>
                            <input type={showPass ? 'text' : 'password'} name="password" className={`form-input ${errors.password ? 'error' : ''}`} value={form.password} onChange={handleChange} placeholder="Минимум 6 символов" autoComplete="new-password" style={{ paddingRight: '2.5rem' }} />
                            <button type="button" onClick={() => setShowPass(!showPass)} style={{ position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-muted)' }}>
                                {showPass ? <FiEyeOff size={16} /> : <FiEye size={16} />}
                            </button>
                        </div>
                        {errors.password && <div className="form-error">⚠ {errors.password}</div>}
                    </div>

                    <button type="submit" className="btn btn-primary btn-full btn-lg" disabled={loading}>
                        {loading ? <><div className="spinner spinner-sm" /> Создание...</> : 'Зарегистрироваться'}
                    </button>
                </form>

                <div className="auth-footer">
                    Уже есть аккаунт? <Link to="/login" className="auth-link">Войти</Link>
                </div>
            </div>
        </div>
    );
}
