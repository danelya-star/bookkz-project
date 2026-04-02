import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { servicesApi } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { bookingsApi } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import ReviewSection from '../components/ReviewSection';
import { FiMapPin, FiStar, FiCheck, FiArrowLeft, FiCalendar, FiUsers } from 'react-icons/fi';

export default function ServiceDetailPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { isAuthenticated } = useAuth();
    const toast = useToast();

    const [service, setService] = useState(null);
    const [loading, setLoading] = useState(true);
    const [bookingLoading, setBookingLoading] = useState(false);

    const today = new Date().toISOString().split('T')[0];
    const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];

    const [checkIn, setCheckIn] = useState(today);
    const [checkOut, setCheckOut] = useState(tomorrow);
    const [guests, setGuests] = useState(1);
    const [specialRequests, setSpecialRequests] = useState('');

    const [errors, setErrors] = useState({});

    useEffect(() => {
        servicesApi.getById(id)
            .then((res) => setService(res.data.service))
            .catch(() => navigate('/404'))
            .finally(() => setLoading(false));
    }, [id, navigate]);

    const validate = () => {
        const e = {};
        if (!checkIn) e.checkIn = 'Выберите дату заезда';
        if (!checkOut) e.checkOut = 'Выберите дату выезда';
        if (checkOut <= checkIn) e.checkOut = 'Дата выезда должна быть позже заезда';
        if (guests < 1) e.guests = 'Минимум 1 гость';
        setErrors(e);
        return Object.keys(e).length === 0;
    };

    const handleBook = async (e) => {
        e.preventDefault();
        if (!isAuthenticated) { navigate('/login'); return; }
        if (!validate()) return;

        setBookingLoading(true);
        try {
            const res = await bookingsApi.create({ serviceId: id, checkIn, checkOut, guests, specialRequests });
            toast.success('Бронирование создано! Перейдите к оплате.');
            navigate(`/payment/${res.data.booking._id}`);
        } catch (err) {
            toast.error(err.response?.data?.message || 'Ошибка при бронировании');
        } finally {
            setBookingLoading(false);
        }
    };

    const days = Math.max(1, Math.round((new Date(checkOut) - new Date(checkIn)) / 86400000));
    const totalPrice = service ? days * service.price * guests : 0;

    if (loading) return <LoadingSpinner message="Загрузка..." />;

    return (
        <div style={{ padding: '2rem 0 4rem' }}>
            <div className="container">
                <Link to="/services" className="btn btn-ghost btn-sm" style={{ marginBottom: '1.5rem' }}>
                    <FiArrowLeft /> Назад к каталогу
                </Link>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: '2.5rem' }}>
                    {/* Left — Service details */}
                    <div>
                        <div style={{ borderRadius: 'var(--radius-lg)', overflow: 'hidden', marginBottom: '2rem', height: '380px' }}>
                            <img src={service.image} alt={service.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        </div>

                        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', marginBottom: '1rem' }}>
                            <div>
                                <span className="badge badge-info" style={{ marginBottom: '0.75rem' }}>
                                    {service.category === 'hotel' ? '🏨 Отель' : service.category === 'restaurant' ? '🍽️ Ресторан' : service.category === 'event' ? '🎭 Событие' : '✈️ Транспорт'}
                                </span>
                                <h1 style={{ fontSize: 'clamp(1.5rem, 3vw, 2rem)', fontWeight: 800 }}>{service.title}</h1>
                            </div>
                            <div style={{ textAlign: 'right' }}>
                                <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--color-primary-light)' }}>
                                    {service.price.toLocaleString()} {service.currency}
                                </div>
                                <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>за сутки</div>
                            </div>
                        </div>

                        <div style={{ display: 'flex', gap: '1.5rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>
                                <FiMapPin size={14} /> {service.location}
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--color-secondary)', fontSize: '0.9rem', fontWeight: 600 }}>
                                <FiStar size={14} fill="currentColor" /> {service.rating} ({service.reviewCount} отзывов)
                            </div>
                        </div>

                        <p style={{ color: 'var(--color-text-muted)', lineHeight: 1.8, marginBottom: '2rem' }}>{service.description}</p>

                        {service.amenities?.length > 0 && (
                            <div style={{ marginBottom: '3rem' }}>
                                <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem' }}>Включено</h3>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '0.6rem' }}>
                                    {service.amenities.map((a) => (
                                        <div key={a} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--color-text-muted)', fontSize: '0.85rem' }}>
                                            <FiCheck size={14} style={{ color: 'var(--color-success)', flexShrink: 0 }} /> {a}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        <hr style={{ border: 'none', borderTop: '1px solid var(--color-border)', margin: '2rem 0' }} />
                        
                        {/* Review Section */}
                        <ReviewSection serviceId={id} />
                    </div>

                    {/* Right — Booking form */}
                    <div>
                        <div className="card" style={{ position: 'sticky', top: 'calc(var(--navbar-height) + 1rem)', padding: '1.75rem' }}>
                            <h3 style={{ marginBottom: '1.5rem', fontSize: '1.2rem' }}>Забронировать</h3>

                            <form onSubmit={handleBook}>
                                <div className="form-group">
                                    <label className="form-label"><FiCalendar size={12} /> Дата заезда</label>
                                    <input type="date" className={`form-input ${errors.checkIn ? 'error' : ''}`} value={checkIn} min={today} onChange={(e) => setCheckIn(e.target.value)} />
                                    {errors.checkIn && <div className="form-error">⚠ {errors.checkIn}</div>}
                                </div>

                                <div className="form-group">
                                    <label className="form-label"><FiCalendar size={12} /> Дата выезда</label>
                                    <input type="date" className={`form-input ${errors.checkOut ? 'error' : ''}`} value={checkOut} min={checkIn || today} onChange={(e) => setCheckOut(e.target.value)} />
                                    {errors.checkOut && <div className="form-error">⚠ {errors.checkOut}</div>}
                                </div>

                                <div className="form-group">
                                    <label className="form-label"><FiUsers size={12} /> Гостей</label>
                                    <input type="number" className={`form-input ${errors.guests ? 'error' : ''}`} value={guests} min={1} max={service.capacity} onChange={(e) => setGuests(Number(e.target.value))} />
                                    {errors.guests && <div className="form-error">⚠ {errors.guests}</div>}
                                </div>

                                <div className="form-group">
                                    <label className="form-label">Пожелания (необязательно)</label>
                                    <textarea className="form-input" rows={3} value={specialRequests} onChange={(e) => setSpecialRequests(e.target.value)} placeholder="Особые пожелания..." style={{ resize: 'vertical' }} />
                                </div>

                                {/* Price breakdown */}
                                <div style={{ background: 'rgba(255,255,255,0.04)', borderRadius: 'var(--radius-md)', padding: '1rem', marginBottom: '1.25rem' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>
                                        <span>{service.price.toLocaleString()} × {days} {days === 1 ? 'ночь' : 'ночей'} × {guests} гостей</span>
                                        <span>{(service.price * days * guests).toLocaleString()} ₸</span>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 800, fontSize: '1.1rem', borderTop: '1px solid var(--color-border)', paddingTop: '0.5rem' }}>
                                        <span>Итого</span>
                                        <span style={{ color: 'var(--color-primary-light)' }}>{totalPrice.toLocaleString()} KZT</span>
                                    </div>
                                </div>

                                <button type="submit" className="btn btn-primary btn-full btn-lg" disabled={bookingLoading}>
                                    {bookingLoading ? <><div className="spinner spinner-sm" /> Обработка...</> : 'Забронировать'}
                                </button>

                                {!isAuthenticated && (
                                    <p style={{ textAlign: 'center', marginTop: '0.75rem', fontSize: '0.82rem', color: 'var(--color-text-muted)' }}>
                                        <Link to="/login" style={{ color: 'var(--color-primary-light)' }}>Войдите</Link> для бронирования
                                    </p>
                                )}
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
