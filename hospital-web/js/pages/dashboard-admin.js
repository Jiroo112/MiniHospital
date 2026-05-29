const NAV_MENU = [
    { href: 'dashboard.html', label: 'Dashboard',  key: 'dashboard', icon: 'bi-speedometer2' },
    { href: 'poli.html',      label: 'Poli',        key: 'poli',      icon: 'bi-building-fill-cross' },
    { href: 'doctors.html',   label: 'Dokter',      key: 'doctors',   icon: 'bi-person-badge' },
    { href: 'schedules.html', label: 'Jadwal',      key: 'schedules', icon: 'bi-calendar-week' },
    { href: 'queues.html',    label: 'Antrian',     key: 'queues',    icon: 'bi-list-ol' }
];
const BASE_PATH = '/MiniHospital/hospital-web/views/admin/';
const ACTIVE_PAGE = 'dashboard';

function buildNav() {
    const links = NAV_MENU.map(m => {
        const active = m.key === ACTIVE_PAGE ? 'active' : '';
        return `<a href="${BASE_PATH}${m.href}" class="${active}"><i class="bi ${m.icon} me-1"></i>${m.label}</a>`;
    }).join('');
    document.getElementById('navLinks').innerHTML = links;
}

function setUserInfo() {
    const user = getUser();
    if (!user) return;
    document.getElementById('userName').textContent = user.name;
    document.getElementById('navUserName').textContent = user.name;
    const initials = user.name?.split(' ').map(w => w[0]).join('').toUpperCase().substring(0, 2) || 'A';
    document.getElementById('navAvatar').textContent = initials;
}

function setTodayDate() {
    const now = new Date();
    const opts = { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' };
    const label = now.toLocaleDateString('id-ID', opts);
    document.getElementById('todayDate').textContent = label;
    document.getElementById('queueDateLabel').textContent = label;
}

function statusBadge(status) {
    const map = {
        menunggu: '<span class="badge-pill waiting"><i class="bi bi-clock"></i> Menunggu</span>',
        selesai:  '<span class="badge-pill done"><i class="bi bi-check"></i> Selesai</span>',
        batal:    '<span class="badge-pill cancel">Batal</span>'
    };
    return map[status] || status;
}

function loadQueues() {
    const today = new Date().toISOString().split('T')[0];
    apiCall(`/queue/today?tanggal=${today}`, 'GET').done(function(res) {
        const data = res.data || [];
        const total = res.meta?.total || data.length;
        const menunggu = data.filter(q => q.status === 'menunggu').length;

        document.getElementById('statAntrian').textContent = total;
        document.getElementById('statMenunggu').textContent = menunggu;

        if (!data.length) {
            document.getElementById('queueBody').innerHTML = `
                <tr><td colspan="5">
                    <div class="empty-state"><i class="bi bi-inbox"></i><p>Belum ada antrian hari ini</p></div>
                </td></tr>`;
            return;
        }

        const rows = data.slice(0, 8).map((q) => `
            <tr>
                <td><span class="queue-num">${q.nomor_antrian}</span></td>
                <td class="cell-patient">${q.nama_pasien}</td>
                <td class="cell-doctor">${q.nama_dokter}</td>
                <td><span class="poli-tag">${q.nama_poli}</span></td>
                <td>${statusBadge(q.status)}</td>
            </tr>`).join('');
        document.getElementById('queueBody').innerHTML = rows;

        const byDoc = {};
        data.forEach(q => { byDoc[q.nama_dokter] = (byDoc[q.nama_dokter] || 0) + 1; });
        const colors = ['#2563EB', '#16A34A', '#D97706', '#DC2626', '#7C3AED', '#0891B2'];
        const summary = Object.entries(byDoc).slice(0, 5).map(([name, count], i) => `
            <div class="today-row">
                <span class="today-dot" style="--dot-color:${colors[i % colors.length]}"></span>
                <span class="today-doc">${name}</span>
                <span class="today-count">${count} pasien</span>
            </div>`).join('');
        document.getElementById('doctorSummary').innerHTML = summary ||
            '<p class="no-doctor-msg">Tidak ada dokter praktek hari ini</p>';
    });
}

function loadStats() {
    apiCall('/doctors', 'GET').done(res => {
        document.getElementById('statDokter').textContent = res.data?.length ?? '—';
    });
    apiCall('/poli', 'GET').done(res => {
        document.getElementById('statPoli').textContent = res.data?.length ?? '—';
    });
}

requireRole('admin');
buildNav();
setUserInfo();
setTodayDate();
loadStats();
loadQueues();
