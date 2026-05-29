const NAV_MENU = [
    { href: 'dashboard.html', label: 'Dashboard',  key: 'dashboard', icon: 'bi-speedometer2' },
    { href: 'poli.html',      label: 'Poli',        key: 'poli',      icon: 'bi-building-fill-cross' },
    { href: 'doctors.html',   label: 'Dokter',      key: 'doctors',   icon: 'bi-person-badge' },
    { href: 'schedules.html', label: 'Jadwal',      key: 'schedules', icon: 'bi-calendar-week' },
    { href: 'queues.html',    label: 'Antrian',     key: 'queues',    icon: 'bi-list-ol' }
];
const BASE_PATH   = '/MiniHospital/hospital-web/views/admin/';
const ACTIVE_PAGE = 'queues';

function buildNav() {
    document.getElementById('navLinks').innerHTML = NAV_MENU.map(m => {
        const active = m.key === ACTIVE_PAGE ? 'active' : '';
        return `<a href="${BASE_PATH}${m.href}" class="${active}"><i class="bi ${m.icon} me-1"></i>${m.label}</a>`;
    }).join('');
}

function setUserInfo() {
    const u = getUser(); if (!u) return;
    document.getElementById('navUserName').textContent = u.name;
    document.getElementById('navAvatar').textContent =
        (u.name?.split(' ').map(w => w[0]).join('').toUpperCase() || 'A').substring(0, 2);
}

function showAlertMsg(type, msg) {
    const icon = type === 'success' ? 'bi-check-circle-fill' : 'bi-x-circle-fill';
    document.getElementById('alertBox').innerHTML =
        `<div class="mh-alert ${type}"><i class="bi ${icon}"></i>${msg}</div>`;
    setTimeout(() => document.getElementById('alertBox').innerHTML = '', 4000);
}

requireRole('admin');
buildNav();
setUserInfo();

const todayStr = new Date().toISOString().split('T')[0];
document.getElementById('filterTanggal').value = todayStr;

function updateDateLabel() {
    const d = new Date(document.getElementById('filterTanggal').value + 'T00:00:00');
    document.getElementById('queueDateLabel').textContent =
        d.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
}
updateDateLabel();

function statusBadge(s) {
    const map = {
        menunggu: '<span class="badge-pill waiting"><i class="bi bi-clock"></i> Menunggu</span>',
        selesai:  '<span class="badge-pill done"><i class="bi bi-check"></i> Selesai</span>',
        batal:    '<span class="badge-pill cancel"><i class="bi bi-x"></i> Batal</span>'
    };
    return map[s] || s;
}

function renderActions(q) {
    if (q.status !== 'menunggu') return '<span style="color:var(--text-muted);font-size:0.8rem">—</span>';
    return `
        <button class="btn-action btn-selesai me-1" onclick="updateStatus(${q.id},'selesai')"><i class="bi bi-check-circle"></i> Selesai</button>
        <button class="btn-action btn-batal" onclick="updateStatus(${q.id},'batal')"><i class="bi bi-x-circle"></i> Batal</button>`;
}

function loadQueues() {
    const tanggal = document.getElementById('filterTanggal').value;
    document.getElementById('tableBody').innerHTML =
        `<tr><td colspan="7" class="text-center py-4" style="color:var(--text-muted)">Memuat...</td></tr>`;

    apiCall(`/queue/today?tanggal=${tanggal}`, 'GET').done(function(res) {
        const data     = res.data || [];
        const menunggu = data.filter(q => q.status === 'menunggu').length;
        const selesai  = data.filter(q => q.status === 'selesai').length;
        const batal    = data.filter(q => q.status === 'batal').length;
        document.getElementById('statTotal').textContent    = res.meta?.total || data.length;
        document.getElementById('statMenunggu').textContent = menunggu;
        document.getElementById('statSelesai').textContent  = selesai;
        document.getElementById('statBatal').textContent    = batal;

        if (!data.length) {
            document.getElementById('tableBody').innerHTML =
                `<tr><td colspan="7"><div class="empty-state"><i class="bi bi-inbox"></i><p>Tidak ada antrian pada tanggal ini</p></div></td></tr>`;
            return;
        }
        document.getElementById('tableBody').innerHTML = data.map(q => `
            <tr>
                <td><span class="qnum">${q.nomor_antrian}</span></td>
                <td style="font-weight:600">${q.nama_pasien}</td>
                <td style="color:var(--text-secondary)">${q.nama_dokter}</td>
                <td><span class="poli-tag">${q.nama_poli}</span></td>
                <td style="color:var(--text-secondary);font-size:0.82rem">${formatDate(q.tanggal)}</td>
                <td>${statusBadge(q.status)}</td>
                <td>${renderActions(q)}</td>
            </tr>`).join('');
    });
}

function updateStatus(id, status) {
    const label = status === 'selesai' ? 'menandai selesai' : 'membatalkan';
    if (!confirm(`Yakin ${label} antrian ini?`)) return;
    apiCall(`/queue/${id}/status`, 'PUT', { status })
        .done(res => { showAlertMsg('success', res.message); loadQueues(); })
        .fail(xhr => showAlertMsg('error', xhr.responseJSON?.message || 'Gagal update'));
}

document.getElementById('filterTanggal').onchange = () => { updateDateLabel(); loadQueues(); };
document.getElementById('btnRefresh').onclick = loadQueues;

loadQueues();
setInterval(loadQueues, 30000);
