/**
 * pasien-riwayat.js
 * Logika halaman Riwayat - Pasien
 */

$(function () {
  requireRole("pasien");
  injectNavbar("pasien", "riwayat");

  loadRiwayatBooking();
  loadRekamMedis();
});

/* ─── Riwayat Booking ─── */

function loadRiwayatBooking() {
  apiCall("/queue/my", "GET")
    .done(function (res) {
      var data = res.data || [];
      $("#totalBooking").text(data.length);

      if (data.length === 0) {
        $("#bookingBody").html(
          '<tr><td colspan="6">' +
            '<div class="empty-state">' +
            '<div class="ei">📅</div>' +
            "<div>Belum ada riwayat booking</div>" +
            "</div></td></tr>"
        );
        return;
      }

      var rows = data
        .map(function (q, idx) {
          return (
            "<tr>" +
            "<td>" +
            (idx + 1) +
            "</td>" +
            "<td>" +
            formatDate(q.tanggal) +
            "</td>" +
            '<td><span class="nomor-badge">' +
            q.nomor_antrian +
            "</span></td>" +
            "<td><strong>" +
            q.nama_dokter +
            "</strong></td>" +
            "<td>" +
            q.nama_poli +
            "</td>" +
            '<td><span class="pill pill-' +
            q.status +
            '">' +
            ucFirst(q.status) +
            "</span></td>" +
            "</tr>"
          );
        })
        .join("");

      $("#bookingBody").html(rows);
    })
    .fail(function () {
      $("#bookingBody").html(
        '<tr><td colspan="6">' +
          '<div class="empty-state"><div class="ei">⚠️</div><div>Gagal memuat riwayat</div></div>' +
          "</td></tr>"
      );
    });
}

/* ─── Rekam Medis ─── */

function loadRekamMedis() {
  apiCall("/medical-records/my", "GET")
    .done(function (res) {
      var data = res.data || [];
      $("#totalRekamMedis").text(data.length);

      if (data.length === 0) {
        $("#rekamMedisList").html(
          '<div class="empty-state" style="background:#fff;border-radius:14px;box-shadow:0 2px 10px rgba(0,0,0,0.06)">' +
            '<div class="ei">🩺</div>' +
            '<div style="font-weight:600;color:#1e293b;margin-bottom:6px">Belum Ada Rekam Medis</div>' +
            '<div style="font-size:0.85rem;color:#94a3b8">Rekam medis akan muncul setelah Anda diperiksa dokter.</div>' +
            "</div>"
        );
        return;
      }

      var cards = data
        .map(function (r) {
          return (
            '<div class="rekam-card">' +
            '<div class="rekam-card-header">' +
            "<div>" +
            '<div class="rekam-dokter">🩺 ' +
            (r.nama_dokter || "Dokter") +
            (r.spesialis
              ? ' <span style="font-weight:400;color:#94a3b8">· ' +
                r.spesialis +
                "</span>"
              : "") +
            "</div>" +
            "</div>" +
            '<div class="rekam-tanggal">' +
            formatDate(r.created_at) +
            "</div>" +
            "</div>" +
            '<div class="rekam-body">' +
            '<div class="row g-3">' +
            '<div class="col-md-6">' +
            '<div class="rekam-field">' +
            '<div class="rekam-label">Diagnosa</div>' +
            '<div class="rekam-value">' +
            (r.diagnosa || "–") +
            "</div>" +
            "</div>" +
            "</div>" +
            '<div class="col-md-6">' +
            '<div class="rekam-field">' +
            '<div class="rekam-label">Tindakan</div>' +
            '<div class="rekam-value">' +
            (r.tindakan || "–") +
            "</div>" +
            "</div>" +
            "</div>" +
            '<div class="col-md-6">' +
            '<div class="rekam-field">' +
            '<div class="rekam-label">Resep</div>' +
            '<div class="rekam-value">' +
            (r.resep || "–") +
            "</div>" +
            "</div>" +
            "</div>" +
            '<div class="col-md-6">' +
            '<div class="rekam-field">' +
            '<div class="rekam-label">Catatan</div>' +
            '<div class="rekam-value">' +
            (r.catatan || "–") +
            "</div>" +
            "</div>" +
            "</div>" +
            "</div>" +
            "</div>" +
            "</div>"
          );
        })
        .join("");

      $("#rekamMedisList").html(cards);
    })
    .fail(function () {
      $("#rekamMedisList").html(
        '<div class="empty-state" style="background:#fff;border-radius:14px;box-shadow:0 2px 10px rgba(0,0,0,0.06)">' +
          '<div class="ei">⚠️</div><div>Gagal memuat rekam medis</div>' +
          "</div>"
      );
    });
}

/* ─── Helpers ─── */

function ucFirst(str) {
  if (!str) return "";
  return str.charAt(0).toUpperCase() + str.slice(1);
}
