import { Link } from 'react-router-dom';
import { FiArrowRight, FiStar, FiShield, FiClock, FiMapPin } from 'react-icons/fi';

const categories = [
    { id: 'hotel', icon: '🏨', label: 'Отели', color: '#6366f1', desc: 'Лучшие отели Казахстана' },
    { id: 'restaurant', icon: '🍽️', label: 'Рестораны', color: '#f59e0b', desc: 'Гастрономические открытия' },
    { id: 'event', icon: '🎭', label: 'Мероприятия', color: '#10b981', desc: 'Концерты и фестивали' },
    { id: 'transport', icon: '✈️', label: 'Транспорт', color: '#3b82f6', desc: 'Перелёты и трансферы' },
];

const features = [
    { icon: <FiShield size={24} />, title: 'Безопасная оплата', desc: 'Шифрование данных и защита каждой транзакции' },
    { icon: <FiClock size={24} />, title: 'Быстрое бронирование', desc: 'Подтверждение в течение нескольких секунд' },
    { icon: <FiStar size={24} />, title: 'Проверенные партнёры', desc: 'Только сертифицированные поставщики услуг' },
    { icon: <FiMapPin size={24} />, title: 'Весь Казахстан', desc: 'Услуги во всех крупных городах страны' },
];

export default function HomePage() {
    return (
        <div>
            {/* Hero */}
            <section className="hero">
                <div className="hero-bg-grid" />
                <div className="container hero-content">
                    <div style={{ maxWidth: '700px' }}>
                        <div className="hero-badge">✦ Платформа №1 в Казахстане</div>
                        <h1 className="hero-title">
                            Бронируй и плати <span className="gradient-text">онлайн</span> за секунды
                        </h1>
                        <p className="hero-subtitle">
                            BookKZ — современная платформа для бронирования отелей, столиков в ресторанах, мероприятий и трансферов с мгновенной онлайн-оплатой.
                        </p>
                        <div className="hero-actions">
                            <Link to="/services" className="btn btn-primary btn-lg">
                                Смотреть услуги <FiArrowRight />
                            </Link>
                            <Link to="/register" className="btn btn-outline btn-lg">
                                Зарегистрироваться
                            </Link>
                        </div>
                        <div className="hero-stats">
                            <div>
                                <div className="hero-stat-value">8 000+</div>
                                <div className="hero-stat-label">Довольных клиентов</div>
                            </div>
                            <div>
                                <div className="hero-stat-value">200+</div>
                                <div className="hero-stat-label">Партнёров</div>
                            </div>
                            <div>
                                <div className="hero-stat-value">4.9 ★</div>
                                <div className="hero-stat-label">Средний рейтинг</div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Categories */}
            <section style={{ padding: '5rem 0' }}>
                <div className="container">
                    <div className="section-header">
                        <div className="section-tag">Категории</div>
                        <h2 className="section-title">Что хотите <span className="gradient-text">забронировать?</span></h2>
                        <p className="section-desc">Выберите из нескольких категорий услуг — от роскошных отелей до трансферов</p>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem' }}>
                        {categories.map((cat) => (
                            <Link
                                key={cat.id}
                                to={`/services?category=${cat.id}`}
                                style={{ textDecoration: 'none' }}
                            >
                                <div className="card" style={{ padding: '2rem', textAlign: 'center' }}>
                                    <div style={{
                                        fontSize: '3rem', marginBottom: '1rem',
                                        filter: 'drop-shadow(0 0 10px ' + cat.color + '80)',
                                    }}>{cat.icon}</div>
                                    <h3 style={{ marginBottom: '0.5rem' }}>{cat.label}</h3>
                                    <p style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem' }}>{cat.desc}</p>
                                    <div style={{ marginTop: '1rem', color: cat.color, fontSize: '0.85rem', fontWeight: '600' }}>
                                        Смотреть →
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            </section>

            {/* Features */}
            <section style={{ padding: '3rem 0 5rem', background: 'rgba(255,255,255,0.01)' }}>
                <div className="container">
                    <div className="section-header">
                        <div className="section-tag">Преимущества</div>
                        <h2 className="section-title">Почему выбирают <span className="gradient-text">BookKZ?</span></h2>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem' }}>
                        {features.map((f, i) => (
                            <div key={i} className="card" style={{ padding: '2rem' }}>
                                <div style={{
                                    width: '52px', height: '52px',
                                    background: 'rgba(99,102,241,0.15)',
                                    borderRadius: 'var(--radius-md)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    color: 'var(--color-primary-light)', marginBottom: '1rem',
                                }}>{f.icon}</div>
                                <h3 style={{ fontSize: '1rem', marginBottom: '0.5rem' }}>{f.title}</h3>
                                <p style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem', lineHeight: 1.7 }}>{f.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section style={{ padding: '4rem 0' }}>
                <div className="container" style={{ textAlign: 'center' }}>
                    <div style={{
                        background: 'linear-gradient(135deg, rgba(99,102,241,0.15), rgba(245,158,11,0.1))',
                        border: '1px solid var(--color-border)',
                        borderRadius: 'var(--radius-xl)',
                        padding: '4rem 2rem',
                    }}>
                        <h2 style={{ fontSize: 'clamp(1.75rem, 4vw, 2.5rem)', marginBottom: '1rem' }}>
                            Готовы к <span className="gradient-text">незабываемому</span> путешествию?
                        </h2>
                        <p style={{ color: 'var(--color-text-muted)', marginBottom: '2rem', maxWidth: '500px', margin: '0 auto 2rem' }}>
                            Зарегистрируйтесь бесплатно и получите доступ к сотням лучших предложений
                        </p>
                        <Link to="/register" className="btn btn-primary btn-lg">
                            Начать бесплатно <FiArrowRight />
                        </Link>
                    </div>
                </div>
            </section>
        </div>
    );
}
