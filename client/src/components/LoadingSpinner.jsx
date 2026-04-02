export default function LoadingSpinner({ size = 'md', message = '' }) {
    return (
        <div className="page-loader">
            <div className={`spinner ${size === 'sm' ? 'spinner-sm' : ''}`} />
            {message && <p style={{ fontSize: '0.9rem' }}>{message}</p>}
        </div>
    );
}
