import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { bookingsApi } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import LoadingSpinner from '../components/LoadingSpinner';
import { generateBookingReceipt } from '../utils/pdfGenerator';
import { FiMapPin, FiCalendar, FiUsers, FiX } from 'react-icons/fi';

const formatDate = (d) => new Date(d).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short', year: 'numeric' });

const STATUS_MAP = {
    pending: { label: 'Ожидает', className: 'badge-warning' },
    confirmed: { label: 'Подтверждено', className: 'badge-success' },
    cancelled: { label: 'Отменено', className: 'badge-danger' },
    completed: { label: 'Завершено', className: 'badge-muted' },
};

const PAYMENT_MAP = {
    unpaid: { label: 'Не оплачено', className: 'badge-danger' },
    paid: { label: 'Оплачено', className: 'badge-success' },
    refunded: { label: 'Возврат', className: 'badge-info' },
};

export default function BookingsPage() {
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [cancellingId, setCancellingId] = useState(null);
    const toast = useToast();
    const { user } = useAuth();

    useEffect(() => {
        bookingsApi.getMy()
            .then((res) => setBookings(res.data.bookings))
            .catch(() => toast.error('Не удалось загрузить бронирования'))
            .finally(() => setLoading(false));
    }, []);

    const handleCancel = async (id) => {
        if (!confirm('Отменить бронирование?')) return;
        setCancellingId(id);
        try {
            await bookingsApi.cancel(id);
            setBookings((prev) => prev.map(b => b._id === id ? { ...b, status: 'cancelled', paymentStatus: b.paymentStatus === 'paid' ? 'refunded' : b.paymentStatus } : b));
            toast.success('Бронирование отменено');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Ошибка отмены');
        } finally {
            setCancellingId(null);
        }
    };

    if (loading) return <LoadingSpinner message="Загрузка бронирований..." />;

    return (
        <div style={{ padding: '2rem 0 4rem' }}>
            <div className="page-header">
                <div className="container">
                    <h1 className="page-title">Мои <span className="gradient-text">бронирования</span></h1>
                    <p className="page-subtitle">Всего бронирований: {bookings.length}</p>
                </div>
            </div>

            <div className="container" style={{ padding: '2rem 1.5rem' }}>
                {bookings.length === 0 ? (
                    <div className="page-loader">
                        <div style={{ fontSize: '4rem' }}>📋</div>
                        <p style={{ color: 'var(--color-text-muted)' }}>У вас пока нет бронирований</p>
                        <Link to="/services" className="btn btn-primary btn-sm">Смотреть услуги</Link>
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {bookings.map((b) => (
                            <div key={b._id} className="booking-item">
                                <img
                                    className="booking-img"
                                    src={b.service?.image || 'https://images.unsplash.com/photo-1570126618953-d437176e8c79?w=200'}
                                    alt={b.service?.title}
                                />
                                <div>
                                    <div className="booking-title">{b.service?.title}</div>
                                    <div className="booking-meta" style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginTop: '0.4rem' }}>
                                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                                            <FiCalendar size={11} /> {formatDate(b.checkIn)} — {formatDate(b.checkOut)}
                                        </span>
                                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                                            <FiUsers size={11} /> {b.guests} гостей
                                        </span>
                                        {b.service?.location && (
                                            <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                                                <FiMapPin size={11} /> {b.service.location}
                                            </span>
                                        )}
                                    </div>
                                    <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.75rem', flexWrap: 'wrap' }}>
                                        <span className={`badge ${STATUS_MAP[b.status]?.className}`}>{STATUS_MAP[b.status]?.label}</span>
                                        <span className={`badge ${PAYMENT_MAP[b.paymentStatus]?.className}`}>{PAYMENT_MAP[b.paymentStatus]?.label}</span>
                                    </div>
                                </div>
                                <div className="booking-actions">
                                    <div className="booking-price">{b.totalPrice?.toLocaleString()} KZT</div>
                                    {b.paymentStatus === 'unpaid' && b.status !== 'cancelled' && (
                                        <Link to={`/payment/${b._id}`} className="btn btn-primary btn-sm">💳 Оплатить</Link>
                                    )}
                                    {b.paymentStatus === 'paid' && (
                                        <button 
                                            className="btn btn-outline btn-sm"
                                            onClick={() => generateBookingReceipt({ ...b, user: user || b.user })}
                                        >
                                            📄 Скачать чек
                                        </button>
                                    )}
                                    {b.status !== 'cancelled' && b.status !== 'completed' && (
                                        <button
                                            className="btn btn-danger btn-sm"
                                            onClick={() => handleCancel(b._id)}
                                            disabled={cancellingId === b._id}
                                        >
                                            {cancellingId === b._id ? <div className="spinner spinner-sm" /> : <><FiX size={12} /> Отменить</>}
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
