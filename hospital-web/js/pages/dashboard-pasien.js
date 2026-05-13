$(function() {
    requireRole('pasien');
    injectNavbar('pasien', 'dashboard');

    $('#userName').text(getUser().name);

    loadAntrianAktif();
});

function loadAntrianAktif() {
    apiCall('/queue/today', 'GET').done(function(res) {
        const aktif = (res.data || []).find(q => q.status === 'menunggu');

        if (aktif) {
            $('#cardAntrian').html(`
                <div class="card bg-warning shadow-sm">
                    <div class="card-body">
                        <h5 class="card-title">Antrian Aktif Hari Ini</h5>
                        <div class="row align-items-center">
                            <div class="col-4 text-center border-end">
                                <small class="d-block">Nomor Antrian</small>
                                <h1 class="mb-0">${aktif.nomor_antrian}</h1>
                            </div>
                            <div class="col-8">
                                <p class="mb-1"><strong>Dokter:</strong> ${aktif.nama_dokter}</p>
                                <p class="mb-1"><strong>Poli:</strong> ${aktif.nama_poli}</p>
                                <p class="mb-0"><strong>Tanggal:</strong> ${formatDate(aktif.tanggal)}</p>
                            </div>
                        </div>
                        <div class="mt-3 text-end">
                            <a href="antrian.html" class="btn btn-light btn-sm">Lihat Detail</a>
                        </div>
                    </div>
                </div>
            `);
        } else {
            $('#cardAntrian').html(`
                <div class="card shadow-sm">
                    <div class="card-body text-center py-4">
                        <h5 class="text-muted">Anda belum punya antrian aktif</h5>
                        <p class="text-muted">Klik tombol di bawah untuk booking ke dokter pilihan Anda.</p>
                        <a href="booking.html" class="btn btn-info text-white">Booking Antrian Baru</a>
                    </div>
                </div>
            `);
        }
    });
}