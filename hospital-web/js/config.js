// Konfigurasi global frontend
const BASE_URL = 'http://localhost/MiniHospital/hospital-api/index.php/api';

// Helper format tanggal/jam
function formatDate(dateString) {
    if (!dateString) return '-';
    const d = new Date(dateString);
    return d.toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' });
}

function formatTime(timeString) {
    if (!timeString) return '-';
    return timeString.substring(0, 5); // "08:00:00" → "08:00"
}