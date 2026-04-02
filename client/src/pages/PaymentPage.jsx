import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { bookingsApi, paymentsApi } from '../services/api';
import { useToast } from '../context/ToastContext';
import LoadingSpinner from '../components/LoadingSpinner';
import { FiArrowLeft, FiCreditCard, FiCheck } from 'react-icons/fi';

const formatDate = (d) => new Date(d).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' });

export default function PaymentPage() {
    const { bookingId } = useParams();
    const navigate = useNavigate();
    const toast = useToast();

    const [booking, setBooking] = useState(null);
    const [loading, setLoading] = useState(true);
    const [payLoading, setPayLoading] = useState(false);
    const [paid, setPaid] = useState(false);
    const [transactionId, setTransactionId] = useState('');

    const [method, setMethod] = useState('card');
    const [card, setCard] = useState({ number: '', holder: '', expiry: '', cvv: '' });
    const [cardErrors, setCardErrors] = useState({});

    useEffect(() => {
        bookingsApi.getById(bookingId)
            .then((res) => {
                setBooking(res.data.booking);
                if (res.data.booking.paymentStatus === 'paid') setPaid(true);
            })
            .catch(() => navigate('/bookings'))
            .finally(() => setLoading(false));
    }, [bookingId, navigate]);

    // Format card number with spaces
    const handleCardNumber = (e) => {
        const raw = e.target.value.replace(/\D/g, '').slice(0, 16);
        const formatted = raw.replace(/(.{4})/g, '$1 ').trim();
        setCard(p => ({ ...p, number: formatted }));
        setCardErrors(p => ({ ...p, number: '' }));
    };

    const handleExpiry = (e) => {
        let val = e.target.value.replace(/\D/g, '').slice(0, 4);
        if (val.length >= 3) val = val.slice(0, 2) + '/' + val.slice(2);
        setCard(p => ({ ...p, expiry: val }));
        setCardErrors(p => ({ ...p, expiry: '' }));
    };

    const validateCard = () => {
        if (method !== 'card') return true;
        const e = {};
        if (card.number.replace(/\s/g, '').length < 16) e.number = 'Введите 16-значный номер карты';
        if (!card.holder.trim()) e.holder = 'Введите имя держателя';
        if (card.expiry.length < 5) e.expiry = 'Формат: MM/YY';
        if (card.cvv.length < 3) e.cvv = 'CVV: 3 цифры';
        setCardErrors(e);
        return Object.keys(e).length === 0;
    };

    const handlePay = async () => {
        if (method === 'card' && !validateCard()) return;
        setPayLoading(true);
        try {
            const payload = { bookingId, paymentMethod: method, cardNumber: card.number, cardHolder: card.holder, expiry: card.expiry, cvv: card.cvv };
            const res = await paymentsApi.pay(payload);
            setTransactionId(res.data.transactionId);
            setPaid(true);
            toast.success('Оплата прошла успешно! 🎉');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Ошибка оплаты');
        } finally {
            setPayLoading(false);
        }
    };

    if (loading) return <LoadingSpinner message="Загрузка данных о бронировании..." />;

    if (paid) return (
        <div className="payment-page">
            <div className="card" style={{ padding: '3rem', textAlign: 'center' }}>
                <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'rgba(16,185,129,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem', fontSize: '2rem' }}>✅</div>
                <h2 style={{ fontSize: '1.75rem', marginBottom: '0.75rem' }}>Оплата прошла успешно!</h2>
                <p style={{ color: 'var(--color-text-muted)', marginBottom: '0.5rem' }}>Ваше бронирование подтверждено</p>
                {transactionId && <p style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem' }}>ID транзакции: <strong style={{ color: 'var(--color-primary-light)' }}>{transactionId}</strong></p>}
                <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', marginTop: '2rem' }}>
                    <Link to="/bookings" className="btn btn-primary">📋 Мои бронирования</Link>
                    <Link to="/services" className="btn btn-outline">🔍 Смотреть ещё</Link>
                </div>
            </div>
        </div>
    );

    const displayCard = card.number || '**** **** **** ****';

    return (
        <div className="payment-page">
            <Link to="/bookings" className="btn btn-ghost btn-sm" style={{ marginBottom: '1.5rem' }}>
                <FiArrowLeft /> Назад
            </Link>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: '0.5rem' }}>Оплата бронирования</h1>

            {/* Booking summary */}
            {booking && (
                <div className="card" style={{ padding: '1.25rem', marginBottom: '1.5rem' }}>
                    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                        <img src={booking.service?.image} alt="" style={{ width: '70px', height: '60px', borderRadius: 'var(--radius-md)', objectFit: 'cover' }} />
                        <div style={{ flex: 1 }}>
                            <div style={{ fontWeight: 700 }}>{booking.service?.title}</div>
                            <div style={{ fontSize: '0.82rem', color: 'var(--color-text-muted)' }}>
                                {formatDate(booking.checkIn)} — {formatDate(booking.checkOut)} · {booking.guests} гостей
                            </div>
                        </div>
                        <div style={{ fontWeight: 800, fontSize: '1.15rem', color: 'var(--color-primary-light)', whiteSpace: 'nowrap' }}>
                            {booking.totalPrice?.toLocaleString()} KZT
                        </div>
                    </div>
                </div>
            )}

            {/* Payment method selection */}
            <div style={{ marginBottom: '1.5rem' }}>
                <div className="form-label" style={{ marginBottom: '0.75rem' }}>Способ оплаты</div>
                <div className="payment-methods">
                    {[{ id: 'card', label: '💳 Карта' }, { id: 'kaspi', label: '🟡 Kaspi Pay' }, { id: 'halyk', label: '🟢 Halyk' }].map((m) => (
                        <button key={m.id} className={`payment-method-btn ${method === m.id ? 'active' : ''}`} onClick={() => setMethod(m.id)}>
                            {m.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Card visual + form */}
            {method === 'card' && (
                <>
                    <div className="card-visual">
                        <div className="card-chip">▣</div>
                        <div className="card-number-display">{displayCard}</div>
                        <div className="card-info-row">
                            <div>
                                <div style={{ fontSize: '0.7rem', marginBottom: '0.2rem', opacity: 0.6 }}>ДЕРЖАТЕЛЬ КАРТЫ</div>
                                <div>{card.holder || 'IVAN IVANOV'}</div>
                            </div>
                            <div>
                                <div style={{ fontSize: '0.7rem', marginBottom: '0.2rem', opacity: 0.6 }}>СРОК</div>
                                <div>{card.expiry || 'MM/YY'}</div>
                            </div>
                            <div style={{ fontSize: '1.5rem' }}>VISA</div>
                        </div>
                    </div>

                    <div style={{ display: 'grid', gap: '1rem' }}>
                        <div className="form-group" style={{ margin: 0 }}>
                            <label className="form-label">Номер карты</label>
                            <input className={`form-input ${cardErrors.number ? 'error' : ''}`} value={card.number} onChange={handleCardNumber} placeholder="0000 0000 0000 0000" maxLength={19} />
                            {cardErrors.number && <div className="form-error">⚠ {cardErrors.number}</div>}
                        </div>
                        <div className="form-group" style={{ margin: 0 }}>
                            <label className="form-label">Имя держателя</label>
                            <input className={`form-input ${cardErrors.holder ? 'error' : ''}`} value={card.holder} onChange={(e) => { setCard(p => ({ ...p, holder: e.target.value.toUpperCase() })); setCardErrors(p => ({ ...p, holder: '' })); }} placeholder="IVAN IVANOV" />
                            {cardErrors.holder && <div className="form-error">⚠ {cardErrors.holder}</div>}
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                            <div className="form-group" style={{ margin: 0 }}>
                                <label className="form-label">Срок действия</label>
                                <input className={`form-input ${cardErrors.expiry ? 'error' : ''}`} value={card.expiry} onChange={handleExpiry} placeholder="MM/YY" maxLength={5} />
                                {cardErrors.expiry && <div className="form-error">⚠ {cardErrors.expiry}</div>}
                            </div>
                            <div className="form-group" style={{ margin: 0 }}>
                                <label className="form-label">CVV</label>
                                <input className={`form-input ${cardErrors.cvv ? 'error' : ''}`} value={card.cvv} onChange={(e) => { setCard(p => ({ ...p, cvv: e.target.value.replace(/\D/g, '').slice(0, 3) })); setCardErrors(p => ({ ...p, cvv: '' })); }} placeholder="•••" maxLength={3} type="password" />
                                {cardErrors.cvv && <div className="form-error">⚠ {cardErrors.cvv}</div>}
                            </div>
                        </div>
                    </div>
                </>
            )}

            {(method === 'kaspi' || method === 'halyk') && (
                <div className="alert alert-info" style={{ marginBottom: '1rem' }}>
                    ℹ Вы будете перенаправлены на страницу {method === 'kaspi' ? 'Kaspi Pay' : 'Halyk Bank'} для завершения оплаты (симуляция).
                </div>
            )}

            <div style={{ marginTop: '1.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem', padding: '1rem', background: 'rgba(255,255,255,0.04)', borderRadius: 'var(--radius-md)' }}>
                    <span style={{ color: 'var(--color-text-muted)' }}>Сумма к оплате:</span>
                    <strong style={{ fontSize: '1.2rem', color: 'var(--color-primary-light)' }}>{booking?.totalPrice?.toLocaleString()} KZT</strong>
                </div>
                <button className="btn btn-primary btn-full btn-lg" onClick={handlePay} disabled={payLoading}>
                    {payLoading ? <><div className="spinner spinner-sm" /> Обработка платежа...</> : <><FiCreditCard /> Оплатить {booking?.totalPrice?.toLocaleString()} KZT</>}
                </button>
                <p style={{ textAlign: 'center', marginTop: '0.75rem', fontSize: '0.8rem', color: 'var(--color-text-light)' }}>
                    🔒 Платёж защищён SSL-шифрованием
                </p>
            </div>
        </div>
    );
}
