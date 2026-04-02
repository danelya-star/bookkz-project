import { Link } from 'react-router-dom';

export default function Footer() {
    return (
        <footer className="footer">
            <div className="container">
                <div className="footer-grid">
                    <div>
                        <div className="navbar-logo" style={{ fontSize: '1.5rem' }}>✦ BookKZ</div>
                        <p className="footer-brand-desc">
                            Удобная онлайн-платформа для бронирования отелей, ресторанов, мероприятий и трансферов. Ваш отдых — наша забота.
                        </p>
                    </div>
                    <div>
                        <div className="footer-col-title">Услуги</div>
                        <div className="footer-links">
                            <Link to="/services?category=hotel" className="footer-link">Отели</Link>
                            <Link to="/services?category=restaurant" className="footer-link">Рестораны</Link>
                            <Link to="/services?category=event" className="footer-link">Мероприятия</Link>
                            <Link to="/services?category=transport" className="footer-link">Транспорт</Link>
                        </div>
                    </div>
                </div>
                <div className="footer-bottom">
                    <span>© {new Date().getFullYear()} BookKZ. Все права защищены.</span>
                </div>
            </div>
        </footer>
    );
}
