$(function() {
    requireRole('pasien');
    injectNavbar('pasien', 'riwayat');

    loadRiwayatBooking();
    loadRekamMedis();
});

function loadRiwayatBooking() {
    apiCall('/queue/my', 'GET').done(function(res) {
        const data = res.data || [];

        if (data.length === 0) {
            $('#bookingBody').html('<tr><td colspan="6" class="text-center text-muted py-4">Belum ada riwayat booking</td></tr>');
            return;
        }

        const rows = data.map((q, idx) => `
            <tr>
                <td>${idx + 1}</td>
                <td>${formatDate(q.tanggal)}</td>
                <td><span class="badge bg-dark">${q.nomor_antrian}</span></td>
                <td>${q.nama_dokter}</td>
                <td>${q.nama_poli}</td>
                <td>${renderStatusBadge(q.status)}</td>
            </tr>
        `).join('');

        $('#bookingBody').html(rows);
        $('#totalBooking').text(data.length);
    });
}

function loadRekamMedis() {
    apiCall('/medical-records/my', 'GET').done(function(res) {
        const data = res.data || [];

        if (data.length === 0) {
            $('#rekamMedisList').html(`
                <div class="alert alert-info">
                    Belum ada rekam medis. Rekam medis akan muncul di sini setelah Anda diperiksa oleh dokter.
                </div>
            `);
            return;
        }

        const cards = data.map(r => `
            <div class="card mb-3 shadow-sm">
                <div class="card-header d-flex justify-content-between align-items-center">
                    <div>
                        <strong>${formatDate(r.created_at)}</strong>
                        <span class="text-muted ms-2">— ${r.nama_dokter} (${r.spesialis || 'Umum'})</span>
                    </div>
                </div>
                <div class="card-body">
                    <div class="row">
                        <div class="col-md-6 mb-2">
                            <small class="text-muted d-block">Diagnosa</small>
                            <p class="mb-0">${r.diagnosa || '-'}</p>
                        </div>
                        <div class="col-md-6 mb-2">
                            <small class="text-muted d-block">Tindakan</small>
                            <p class="mb-0">${r.tindakan || '-'}</p>
                        </div>
                        <div class="col-md-6 mb-2">
                            <small class="text-muted d-block">Resep</small>
                            <p class="mb-0">${r.resep || '-'}</p>
                        </div>
                        <div class="col-md-6 mb-2">
                            <small class="text-muted d-block">Catatan</small>
                            <p class="mb-0">${r.catatan || '-'}</p>
                        </div>
                    </div>
                </div>
            </div>
        `).join('');

        $('#rekamMedisList').html(cards);
        $('#totalRekamMedis').text(data.length);
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