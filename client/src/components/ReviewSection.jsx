import { useState, useEffect } from 'react';
import { servicesApi } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { FiStar, FiMessageSquare, FiSend } from 'react-icons/fi';

export default function ReviewSection({ serviceId }) {
    const { user, isAuthenticated } = useAuth();
    const toast = useToast();

    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    // Form state
    const [rating, setRating] = useState(5);
    const [comment, setComment] = useState('');
    const [hoverRating, setHoverRating] = useState(0);

    const fetchReviews = async () => {
        try {
            const res = await servicesApi.getReviews(serviceId);
            setReviews(res.data.reviews);
        } catch (err) {
            console.error('Failed to fetch reviews', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchReviews();
    }, [serviceId]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!isAuthenticated) {
            toast.error('Сначала войдите в систему');
            return;
        }

        setSubmitting(true);
        try {
            const res = await servicesApi.addReview(serviceId, { rating, comment });
            toast.success('Отзыв успешно добавлен!');
            setComment('');
            setRating(5);
            fetchReviews(); // Refresh list
        } catch (err) {
            toast.error(err.response?.data?.message || 'Ошибка при добавлении отзыва');
        } finally {
            setSubmitting(false);
        }
    };

    // Helper to check if user already reviewed
    const hasReviewed = reviews.some(r => r.user?._id === user?.id);

    if (loading) return <div className="text-center p-3">Загрузка отзывов...</div>;

    return (
        <div style={{ marginTop: '3rem' }}>
            <h3 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <FiMessageSquare style={{ color: 'var(--color-primary-light)' }} /> 
                Отзывы клиентов ({reviews.length})
            </h3>

            {/* List of Reviews */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', marginBottom: '3rem' }}>
                {reviews.length === 0 ? (
                    <div style={{ padding: '2.5rem', background: 'var(--color-card)', borderRadius: 'var(--radius-lg)', textAlign: 'center', color: 'var(--color-text-muted)', border: '1px dashed var(--color-border)' }}>
                        <p>Отзывов пока нет. Будьте первым!</p>
                    </div>
                ) : (
                    reviews.map((r) => (
                        <div key={r._id} className="card" style={{ padding: '1.5rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                    <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'linear-gradient(135deg, var(--color-primary), var(--color-secondary))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
                                        {r.user?.name?.charAt(0) || 'U'}
                                    </div>
                                    <div>
                                        <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>{r.user?.name || 'Пользователь'}</div>
                                        <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                                            {new Date(r.createdAt).toLocaleDateString('ru-RU')}
                                        </div>
                                    </div>
                                </div>
                                <div style={{ display: 'flex', color: 'var(--color-secondary)', gap: '2px' }}>
                                    {[...Array(5)].map((_, i) => (
                                        <FiStar key={i} fill={i < r.rating ? 'currentColor' : 'none'} size={14} />
                                    ))}
                                </div>
                            </div>
                            <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem', lineHeight: 1.7 }}>{r.comment}</p>
                        </div>
                    ))
                )}
            </div>

            {/* Add Review Form */}
            {isAuthenticated && !hasReviewed && (
                <div className="card" style={{ padding: '2rem', border: '1px solid var(--color-primary)', background: 'rgba(99,102,241,0.03)' }}>
                    <h4 style={{ marginBottom: '1.25rem' }}>Оставить отзыв</h4>
                    <form onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label className="form-label">Ваша оценка</label>
                            <div style={{ display: 'flex', gap: '0.5rem', fontSize: '1.5rem', color: 'var(--color-secondary)', cursor: 'pointer' }}>
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <FiStar 
                                        key={star} 
                                        fill={star <= (hoverRating || rating) ? 'currentColor' : 'none'} 
                                        onMouseEnter={() => setHoverRating(star)}
                                        onMouseLeave={() => setHoverRating(0)}
                                        onClick={() => setRating(star)}
                                        transition="all 0.2s ease"
                                    />
                                ))}
                            </div>
                        </div>
                        <div className="form-group">
                            <label className="form-label">Ваш комментарий</label>
                            <textarea 
                                className="form-input" 
                                rows={4} 
                                value={comment} 
                                onChange={(e) => setComment(e.target.value)}
                                placeholder="Расскажите о своем опыте..."
                                required 
                            />
                        </div>
                        <button type="submit" className="btn btn-primary" disabled={submitting}>
                            {submitting ? 'Отправка...' : <><FiSend /> Опубликовать</>}
                        </button>
                        <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: '1rem' }}>
                            * Вы можете оставить только один отзыв после подтвержденного бронирования.
                        </p>
                    </form>
                </div>
            )}

            {!isAuthenticated && (
                <div style={{ textAlign: 'center', padding: '1rem', color: 'var(--color-text-muted)' }}>
                    Пожалуйста, <a href="/login" style={{ color: 'var(--color-primary-light)' }}>войдите</a>, чтобы оставить отзыв.
                </div>
            )}

            {isAuthenticated && hasReviewed && (
                <div style={{ textAlign: 'center', padding: '1rem', color: 'var(--color-success)', background: 'rgba(16,185,129,0.05)', borderRadius: 'var(--radius-md)', fontSize: '0.9rem' }}>
                    ✅ Вы уже оставили отзыв об этой услуге. Спасибо за ваше мнение!
                </div>
            )}
        </div>
    );
}
