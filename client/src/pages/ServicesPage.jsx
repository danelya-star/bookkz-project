import { useState, useEffect, useCallback } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { servicesApi } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import { FiSearch, FiMapPin, FiStar, FiFilter } from 'react-icons/fi';

const CATEGORIES = [
    { value: '', label: 'Все' },
    { value: 'hotel', label: '🏨 Отели' },
    { value: 'restaurant', label: '🍽️ Рестораны' },
    { value: 'event', label: '🎭 Мероприятия' },
    { value: 'transport', label: '✈️ Транспорт' },
];

export default function ServicesPage() {
    const [searchParams, setSearchParams] = useSearchParams();
    const [services, setServices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [total, setTotal] = useState(0);
    const [pages, setPages] = useState(1);

    const [search, setSearch] = useState('');
    const [category, setCategory] = useState(searchParams.get('category') || '');
    const [minPrice, setMinPrice] = useState('');
    const [maxPrice, setMaxPrice] = useState('');
    const [searchCheckIn, setSearchCheckIn] = useState('');
    const [searchCheckOut, setSearchCheckOut] = useState('');
    const [sort, setSort] = useState('-createdAt');
    const [page, setPage] = useState(1);

    const fetchServices = useCallback(async () => {
        setLoading(true);
        try {
            const params = { page, limit: 9, sort };
            if (search) params.search = search;
            if (category) params.category = category;
            if (minPrice) params.minPrice = minPrice;
            if (maxPrice) params.maxPrice = maxPrice;
            if (searchCheckIn && searchCheckOut) {
                params.checkIn = searchCheckIn;
                params.checkOut = searchCheckOut;
            }

            const res = await servicesApi.getAll(params);
            setServices(res.data.services);
            setTotal(res.data.total);
            setPages(res.data.pages);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, [search, category, minPrice, maxPrice, searchCheckIn, searchCheckOut, sort, page]);

    useEffect(() => {
        const urlCategory = searchParams.get('category');
        if (urlCategory !== null && urlCategory !== category) {
            setCategory(urlCategory);
            setPage(1);
        }
    }, [searchParams]);

    useEffect(() => { fetchServices(); }, [fetchServices]);

    const handleSearch = (e) => { e.preventDefault(); setPage(1); fetchServices(); };
    const handleCategoryChange = (val) => { 
        setCategory(val); 
        setSearchParams(val ? { category: val } : {});
        setPage(1); 
    };
    const handleReset = () => { 
        setSearch(''); setCategory(''); setMinPrice(''); setMaxPrice(''); 
        setSearchCheckIn(''); setSearchCheckOut(''); 
        setSort('-createdAt'); setPage(1); 
        setSearchParams({});
    };

    return (
        <div>
            <div className="page-header">
                <div className="container">
                    <h1 className="page-title">Каталог <span className="gradient-text">услуг</span></h1>
                    <p className="page-subtitle">Найдено {total} предложений</p>
                </div>
            </div>

            <div className="container" style={{ padding: '2rem 1.5rem' }}>
                {/* Filters */}
                <div className="filters-bar">
                    <form onSubmit={handleSearch}>
                        <div className="filters-row" style={{ gridTemplateColumns: 'minmax(200px, 1fr) 180px 140px 140px 130px 130px auto' }}>
                            <div style={{ position: 'relative' }}>
                                <FiSearch style={{ position: 'absolute', left: '0.9rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} />
                                <input
                                    type="text"
                                    className="form-input"
                                    placeholder="Поиск..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    style={{ paddingLeft: '2.5rem' }}
                                />
                            </div>
                            <select className="form-input form-select" value={category} onChange={(e) => handleCategoryChange(e.target.value)}>
                                {CATEGORIES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
                            </select>
                            <input type="number" className="form-input" placeholder="Цена от" value={minPrice} onChange={(e) => setMinPrice(e.target.value)} />
                            <input type="number" className="form-input" placeholder="Цена до" value={maxPrice} onChange={(e) => setMaxPrice(e.target.value)} />
                            <input type="date" className="form-input" value={searchCheckIn} onChange={(e) => setSearchCheckIn(e.target.value)} lang="ru" />
                            <input type="date" className="form-input" value={searchCheckOut} onChange={(e) => setSearchCheckOut(e.target.value)} lang="ru" />
                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                <button type="submit" className="btn btn-primary"><FiFilter size={14} /> Найти</button>
                                <button type="button" className="btn btn-outline" onClick={handleReset}>✕</button>
                            </div>
                        </div>
                    </form>
                    {/* Category tabs */}
                    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginTop: '1rem' }}>
                        {CATEGORIES.map((c) => (
                            <button
                                key={c.value}
                                className={`btn btn-sm ${category === c.value ? 'btn-primary' : 'btn-outline'}`}
                                onClick={() => handleCategoryChange(c.value)}
                            >{c.label}</button>
                        ))}
                    </div>
                </div>

                {/* Grid */}
                {loading ? <LoadingSpinner message="Загрузка услуг..." /> : services.length === 0 ? (
                    <div className="page-loader">
                        <div style={{ fontSize: '3rem' }}>🔍</div>
                        <p>Ничего не найдено. Попробуйте изменить фильтры.</p>
                        <button className="btn btn-outline btn-sm" onClick={handleReset}>Сбросить фильтры</button>
                    </div>
                ) : (
                    <div className="services-grid">
                        {services.map((s) => (
                            <Link to={`/services/${s._id}`} key={s._id} style={{ textDecoration: 'none' }}>
                                <div className="service-card">
                                    <div className="service-card-image">
                                        <img src={s.image || 'https://images.unsplash.com/photo-1570126618953-d437176e8c79?w=400'} alt={s.title} loading="lazy" />
                                        <div className="service-card-category">
                                            <span className="badge badge-info">
                                                {s.category === 'hotel' ? '🏨 Отель' : s.category === 'restaurant' ? '🍽️ Ресторан' : s.category === 'event' ? '🎭 Событие' : '✈️ Транспорт'}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="service-card-body">
                                        <h3 className="service-card-title">{s.title}</h3>
                                        <div className="service-card-location"><FiMapPin size={12} /> {s.location}</div>
                                        <div className="service-card-rating"><FiStar size={13} fill="currentColor" /> {s.rating} ({s.reviewCount} отзывов)</div>
                                        <div className="service-card-footer">
                                            <div className="service-card-price">{s.price.toLocaleString()} {s.currency} <span>/ сутки</span></div>
                                            <div className="btn btn-primary btn-sm">Забронировать</div>
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}

                {/* Pagination */}
                {pages > 1 && (
                    <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', marginTop: '2rem' }}>
                        {Array.from({ length: pages }, (_, i) => i + 1).map((p) => (
                            <button key={p} className={`btn btn-sm ${p === page ? 'btn-primary' : 'btn-outline'}`} onClick={() => setPage(p)}>{p}</button>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
