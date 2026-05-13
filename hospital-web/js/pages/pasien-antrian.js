let pollingInterval = null;

$(function() {
    requireRole('pasien');
    injectNavbar('pasien', 'antrian');

    loadAntrian();
    startPolling();

    $('#btnRefresh').on('click', loadAntrian);
    $(window).on('beforeunload', stopPolling);
});

function startPolling() {
    pollingInterval = setInterval(loadAntrian, 5000);
    $('#pollingStatus').html('<span class="badge bg-success">🟢 Auto-refresh tiap 5 detik</span>');
}

function stopPolling() {
    if (pollingInterval) clearInterval(pollingInterval);
}

function loadAntrian() {
    apiCall('/queue/today', 'GET').done(function(res) {
        const data = res.data || [];

        if (data.length === 0) {
            $('#mainContent').html(`
                <div class="alert alert-info text-center">
                    <h5>Tidak Ada Antrian Aktif Hari Ini</h5>
                    <p>Anda belum punya booking untuk hari ini.</p>
                    <a href="booking.html" class="btn btn-info text-white">Booking Sekarang</a>
                </div>
            `);
            $('#lastUpdate').text(new Date().toLocaleTimeString('id-ID'));
            return;
        }

        // Untuk setiap antrian pasien, render kartu detail
        const cards = data.map(q => renderAntrianCard(q)).join('');
        $('#mainContent').html(cards);
        $('#lastUpdate').text(new Date().toLocaleTimeString('id-ID'));

        // Untuk antrian yang masih menunggu, load info posisi (berapa pasien sebelum saya)
        data.filter(q => q.status === 'menunggu').forEach(q => {
            loadPosisiAntrian(q);
        });
    });
}

function renderAntrianCard(queue) {
    const statusBadge = {
        menunggu: '<span class="badge bg-warning text-dark fs-6">Menunggu</span>',
        selesai:  '<span class="badge bg-success fs-6">Selesai</span>',
        batal:    '<span class="badge bg-secondary fs-6">Batal</span>'
    }[queue.status];

    const headerClass = queue.status === 'menunggu' ? 'bg-warning text-dark' :
                        queue.status === 'selesai'  ? 'bg-success text-white' :
                                                       'bg-secondary text-white';

    const actionButton = queue.status === 'menunggu'
        ? `<button class="btn btn-outline-danger btn-sm" onclick="batalkanAntrian(${queue.id})">Batalkan Booking</button>`
        : '';

    const posisiInfo = queue.status === 'menunggu'
        ? `<div id="posisi-${queue.id}" class="mt-2 text-muted small">Menghitung posisi antrian...</div>`
        : '';

    return `
        <div class="card shadow-sm mb-3">
            <div class="card-header ${headerClass}">
                <strong>Antrian #${queue.nomor_antrian}</strong> ${statusBadge}
            </div>
            <div class="card-body">
                <div class="row">
                    <div class="col-md-3 text-center border-end">
                        <small class="text-muted d-block">Nomor Antrian Anda</small>
                        <h1 class="text-primary mb-0">${queue.nomor_antrian}</h1>
                    </div>
                    <div class="col-md-9">
                        <table class="table table-sm table-borderless mb-0">
                            <tr><td width="120"><small class="text-muted">Dokter</small></td><td><strong>${queue.nama_dokter}</strong></td></tr>
                            <tr><td><small class="text-muted">Poli</small></td><td>${queue.nama_poli}</td></tr>
                            <tr><td><small class="text-muted">Tanggal</small></td><td>${formatDate(queue.tanggal)}</td></tr>
                        </table>
                        ${posisiInfo}
                    </div>
                </div>
                ${actionButton ? `<div class="mt-3 text-end">${actionButton}</div>` : ''}
            </div>
        </div>
    `;
}

function loadPosisiAntrian(queue) {
    // Hitung berapa pasien sebelum saya di antrian dokter yang sama, tanggal yang sama, status menunggu
    // Kita pakai endpoint /queue/today dengan akses admin... tapi pasien tidak bisa lihat semua.
    // Workaround: hitung berdasarkan nomor antrian saya vs nomor yang sudah selesai di dokter ini.
    // Karena keterbatasan API, kita tampilkan estimasi sederhana.

    $(`#posisi-${queue.id}`).html(
        `<span class="badge bg-info">Nomor Anda: ${queue.nomor_antrian}</span> 
         Antrian akan dipanggil sesuai urutan oleh petugas.`
    );
}

function batalkanAntrian(id) {
    if (!confirm('Yakin batalkan booking ini? Nomor antrian akan hangus.')) return;

    apiCall(`/queue/${id}/status`, 'PUT', { status: 'batal' })
        .done(function(res) {
            alert(res.message);
            loadAntrian();
        })
        .fail(function(xhr) {
            alert(xhr.responseJSON?.message || 'Gagal batalkan');
        });
}