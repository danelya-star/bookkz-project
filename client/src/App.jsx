import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import LoadingSpinner from './components/LoadingSpinner';

import HomePage from './pages/HomePage';
import ServicesPage from './pages/ServicesPage';
import ServiceDetailPage from './pages/ServiceDetailPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import BookingsPage from './pages/BookingsPage';
import PaymentPage from './pages/PaymentPage';
import AdminPage from './pages/AdminPage';
import NotFoundPage from './pages/NotFoundPage';

// Route guard for authenticated users
function PrivateRoute({ children }) {
    const { isAuthenticated, loading } = useAuth();
    if (loading) return <LoadingSpinner message="Проверка авторизации..." />;
    return isAuthenticated ? children : <Navigate to="/login" replace />;
}

// Route guard for admin only
function AdminRoute({ children }) {
    const { isAuthenticated, isAdmin, loading } = useAuth();
    if (loading) return <LoadingSpinner message="Проверка прав доступа..." />;
    if (!isAuthenticated) return <Navigate to="/login" replace />;
    if (!isAdmin) return <Navigate to="/" replace />;
    return children;
}

// Route guard for guest only (redirect if already logged in)
function GuestRoute({ children }) {
    const { isAuthenticated, loading } = useAuth();
    if (loading) return <LoadingSpinner />;
    return isAuthenticated ? <Navigate to="/dashboard" replace /> : children;
}

function AppRoutes() {
    return (
        <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
            <Navbar />
            <main style={{ flex: 1 }}>
                <Routes>
                    {/* Public */}
                    <Route path="/" element={<HomePage />} />
                    <Route path="/services" element={<ServicesPage />} />
                    <Route path="/services/:id" element={<ServiceDetailPage />} />

                    {/* Guest only */}
                    <Route path="/login" element={<GuestRoute><LoginPage /></GuestRoute>} />
                    <Route path="/register" element={<GuestRoute><RegisterPage /></GuestRoute>} />

                    {/* Private */}
                    <Route path="/dashboard" element={<PrivateRoute><DashboardPage /></PrivateRoute>} />
                    <Route path="/bookings" element={<PrivateRoute><BookingsPage /></PrivateRoute>} />
                    <Route path="/payment/:bookingId" element={<PrivateRoute><PaymentPage /></PrivateRoute>} />

                    {/* Admin */}
                    <Route path="/admin" element={<AdminRoute><AdminPage /></AdminRoute>} />

                    {/* 404 */}
                    <Route path="*" element={<NotFoundPage />} />
                </Routes>
            </main>
            <Footer />
        </div>
    );
}

export default function App() {
    return (
        <BrowserRouter>
            <AuthProvider>
                <ToastProvider>
                    <AppRoutes />
                </ToastProvider>
            </AuthProvider>
        </BrowserRouter>
    );
}
