$(function() {
    requireRole('pasien');
    injectNavbar('pasien', 'booking');

    // Set tanggal default = hari ini, minimum = hari ini
    const today = new Date().toISOString().split('T')[0];
    $('input[name=tanggal]').val(today).attr('min', today);

    loadPoliOptions();

    // Cascading: saat poli dipilih, load dokter dari poli itu
    $('select[name=poli_id]').on('change', loadDokterByPoli);

    // Saat dokter dipilih, tampilkan jadwal praktiknya
    $('select[name=dokter_id]').on('change', showJadwalDokter);

    $('#formBooking').on('submit', handleBooking);
});

function loadPoliOptions() {
    apiCall('/poli', 'GET').done(function(res) {
        if (!res.data) return;
        const options = ['<option value="">-- Pilih Poli --</option>']
            .concat(res.data.map(p => `<option value="${p.id}">${p.nama_poli} (${p.lokasi || '-'})</option>`))
            .join('');
        $('select[name=poli_id]').html(options);
    });
}

function loadDokterByPoli() {
    const poliId = $('select[name=poli_id]').val();
    const $dokterSelect = $('select[name=dokter_id]');

    // Reset dokter & info jadwal
    $dokterSelect.html('<option value="">-- Memuat dokter... --</option>').prop('disabled', true);
    $('#jadwalInfo').empty();

    if (!poliId) {
        $dokterSelect.html('<option value="">-- Pilih poli dulu --</option>').prop('disabled', true);
        return;
    }

    // Ambil semua dokter, filter yang poli_id-nya sesuai
    apiCall('/doctors', 'GET').done(function(res) {
        const dokterFiltered = (res.data || []).filter(d => d.poli_id == poliId);

        if (dokterFiltered.length === 0) {
            $dokterSelect.html('<option value="">-- Belum ada dokter di poli ini --</option>').prop('disabled', true);
            return;
        }

        const options = ['<option value="">-- Pilih Dokter --</option>']
            .concat(dokterFiltered.map(d => {
                // Simpan data jadwal sebagai data attribute untuk dipakai showJadwalDokter
                return `<option value="${d.id}" data-jadwal='${JSON.stringify(d.jadwal || [])}'>
                    ${d.nama} - ${d.spesialis || 'Umum'}
                </option>`;
            }))
            .join('');
        $dokterSelect.html(options).prop('disabled', false);
    });
}

function showJadwalDokter() {
    const $selected = $('select[name=dokter_id] option:selected');
    const jadwalRaw = $selected.attr('data-jadwal');

    if (!jadwalRaw) {
        $('#jadwalInfo').empty();
        return;
    }

    const jadwal = JSON.parse(jadwalRaw);
    if (jadwal.length === 0) {
        $('#jadwalInfo').html('<div class="alert alert-warning small mb-0">⚠ Dokter ini belum punya jadwal praktik terdaftar.</div>');
        return;
    }

    const items = jadwal.map(j => `
        <li><strong>${j.hari}</strong>: ${formatTime(j.jam_mulai)} - ${formatTime(j.jam_selesai)}</li>
    `).join('');

    $('#jadwalInfo').html(`
        <div class="alert alert-info small mb-0">
            <strong>Jadwal Praktik:</strong>
            <ul class="mb-0 mt-1">${items}</ul>
        </div>
    `);
}

function handleBooking(e) {
    e.preventDefault();

    const $btn = $('#btnBooking');
    $btn.prop('disabled', true).text('Memproses...');

    const data = {
        dokter_id: parseInt($('select[name=dokter_id]').val()),
        tanggal:   $('input[name=tanggal]').val()
    };

    apiCall('/queue/book', 'POST', data)
        .done(function(res) {
            // Tampilkan hasil booking
            $('#hasilBooking').html(`
                <div class="alert alert-success">
                    <h4 class="alert-heading">Booking Berhasil!</h4>
                    <p class="mb-2">${res.message}</p>
                    <hr>
                    <div class="row">
                        <div class="col-6">
                            <small class="text-muted">Nomor Antrian Anda:</small>
                            <h1 class="text-primary mb-0">${res.data.nomor_antrian}</h1>
                        </div>
                        <div class="col-6">
                            <small class="text-muted">Tanggal:</small>
                            <h5 class="mb-2">${formatDate(res.data.tanggal)}</h5>
                            <small class="text-muted">Status:</small>
                            <p class="mb-0"><span class="badge bg-warning text-dark">Menunggu</span></p>
                        </div>
                    </div>
                    <hr>
                    <a href="antrian.html" class="btn btn-primary">Lihat Antrian Saya</a>
                </div>
            `);

            // Sembunyikan form
            $('#formCardBody').hide();
            $btn.prop('disabled', false).text('Booking Sekarang');
        })
        .fail(function(xhr) {
            const msg = xhr.responseJSON?.message || 'Gagal booking';
            $('#hasilBooking').html(`<div class="alert alert-danger">${msg}</div>`);
            $btn.prop('disabled', false).text('Booking Sekarang');
        });
}