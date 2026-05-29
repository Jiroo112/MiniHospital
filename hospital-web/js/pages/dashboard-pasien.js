/**
 * dashboard-pasien.js
 * Logika halaman Dashboard Pasien
 */

$(function () {
  requireRole("pasien");
  injectNavbar("pasien", "dashboard");

  $("#userName").text(getUser().name);
  $("#tanggalHariIni").text(
    new Date().toLocaleDateString("id-ID", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    })
  );

  loadAntrianAktif();
});

function loadAntrianAktif() {
  apiCall("/queue/today", "GET")
    .done(function (res) {
      var aktif = (res.data || []).find(function (q) {
        return q.status === "menunggu";
      });

      if (aktif) {
        $("#cardAntrian").html(
          '<div class="antrian-aktif">' +
            '<div class="antrian-aktif-header">' +
            "<h6>🟡 Antrian Aktif Hari Ini</h6>" +
            '<span style="font-size:0.78rem;opacity:0.85">' +
            formatDate(aktif.tanggal) +
            "</span>" +
            "</div>" +
            '<div class="antrian-aktif-body">' +
            '<div class="d-flex align-items-center">' +
            '<div style="min-width:100px">' +
            '<div class="nomor-besar">' +
            aktif.nomor_antrian +
            "</div>" +
            '<div class="nomor-label">No. Antrian</div>' +
            "</div>" +
            '<div class="divider-v"></div>' +
            '<div class="flex-1">' +
            '<div class="info-row">' +
            '<div class="info-label">Dokter</div>' +
            '<div class="info-value">' +
            aktif.nama_dokter +
            "</div>" +
            "</div>" +
            '<div class="info-row">' +
            '<div class="info-label">Poli</div>' +
            '<div class="info-value">' +
            aktif.nama_poli +
            "</div>" +
            "</div>" +
            '<div class="info-row" style="margin-bottom:0">' +
            '<div class="info-label">Status</div>' +
            '<div class="info-value">' +
            '<span style="background:#fef3c7;color:#92400e;padding:3px 10px;border-radius:20px;font-size:0.75rem;font-weight:600">Menunggu</span>' +
            "</div>" +
            "</div>" +
            "</div>" +
            "</div>" +
            '<div style="margin-top:16px;text-align:right">' +
            '<a href="antrian.html" class="btn-booking-baru">Lihat Detail Antrian →</a>' +
            "</div>" +
            "</div>" +
            "</div>"
        );
      } else {
        $("#cardAntrian").html(
          '<div class="empty-antrian">' +
            '<div class="ei">🏥</div>' +
            "<h6>Anda belum punya antrian aktif</h6>" +
            "<p>Klik tombol di bawah untuk booking ke dokter pilihan Anda.</p>" +
            '<a href="booking.html" class="btn-booking-baru">Booking Antrian Baru</a>' +
            "</div>"
        );
      }
    })
    .fail(function () {
      $("#cardAntrian").html(
        '<div class="empty-antrian">' +
          '<div class="ei">⚠️</div>' +
          "<h6>Gagal memuat antrian</h6>" +
          "</div>"
      );
    });
}
