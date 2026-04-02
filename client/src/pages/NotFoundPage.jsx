import { Link } from 'react-router-dom';

export default function NotFoundPage() {
    return (
        <div className="not-found-page">
            <div className="not-found-code">404</div>
            <h2 style={{ fontSize: '1.75rem', marginBottom: '0.75rem' }}>Страница не найдена</h2>
            <p style={{ color: 'var(--color-text-muted)', marginBottom: '2rem', maxWidth: '400px' }}>
                Похоже, вы зашли не туда. Страница, которую вы ищете, не существует или была перемещена.
            </p>
            <div style={{ display: 'flex', gap: '0.75rem' }}>
                <Link to="/" className="btn btn-primary">↩ На главную</Link>
                <Link to="/services" className="btn btn-outline">🔍 Каталог услуг</Link>
            </div>
        </div>
    );
}
