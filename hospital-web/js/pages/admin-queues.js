$(function() {
    requireRole('admin');
    injectNavbar('admin', 'queues');

    // Set default tanggal ke hari ini
    $('#filterTanggal').val(new Date().toISOString().split('T')[0]);

    loadQueues();

    $('#filterTanggal').on('change', loadQueues);
    $('#btnRefresh').on('click', loadQueues);
});

function loadQueues() {
    $('#tableBody').html('<tr><td colspan="8" class="text-center">Memuat...</td></tr>');

    const tanggal = $('#filterTanggal').val();
    apiCall(`/queue/today?tanggal=${tanggal}`, 'GET').done(function(res) {
        $('#totalAntrian').text(res.meta?.total || 0);

        if (!res.data || res.data.length === 0) {
            $('#tableBody').html('<tr><td colspan="8" class="text-center text-muted">Tidak ada antrian pada tanggal ini</td></tr>');
            return;
        }

        const rows = res.data.map((q, idx) => `
            <tr>
                <td>${idx + 1}</td>
                <td><span class="badge bg-dark fs-6">${q.nomor_antrian}</span></td>
                <td>${q.nama_pasien}</td>
                <td>${q.nama_dokter}</td>
                <td>${q.nama_poli}</td>
                <td>${formatDate(q.tanggal)}</td>
                <td>${renderStatusBadge(q.status)}</td>
                <td>${renderActions(q)}</td>
            </tr>
        `).join('');

        $('#tableBody').html(rows);
    });
}

function renderStatusBadge(status) {
    const badges = {
        menunggu: '<span class="badge bg-warning text-dark">Menunggu</span>',
        selesai:  '<span class="badge bg-success">Selesai</span>',
        batal:    '<span class="badge bg-secondary">Batal</span>'
    };
    return badges[status] || status;
}

function renderActions(queue) {
    if (queue.status !== 'menunggu') {
        return '<span class="text-muted small">-</span>';
    }
    return `
        <button class="btn btn-sm btn-success me-1" onclick="updateStatus(${queue.id}, 'selesai')">Selesai</button>
        <button class="btn btn-sm btn-outline-secondary" onclick="updateStatus(${queue.id}, 'batal')">Batal</button>
    `;
}

function updateStatus(id, status) {
    const label = status === 'selesai' ? 'menandai selesai' : 'membatalkan';
    if (!confirm(`Yakin ${label} antrian ini?`)) return;

    apiCall(`/queue/${id}/status`, 'PUT', { status: status })
        .done(function(res) {
            showAlert('#alert-box', 'success', res.message);
            loadQueues();
        })
        .fail(function(xhr) {
            const msg = xhr.responseJSON?.message || 'Gagal update status';
            alert(msg);
        });
}