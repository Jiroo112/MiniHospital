/**
 * pasien-antrian.js
 * Logika halaman Antrian Saya - Pasien
 * Auto-refresh tiap 5 detik sesuai requirement
 */

var pollingInterval = null;

$(function () {
  requireRole("pasien");
  injectNavbar("pasien", "antrian");

  $("#tanggalHeader").text(
    new Date().toLocaleDateString("id-ID", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    })
  );

  loadAntrian();
  startPolling();

  $("#btnRefresh").on("click", loadAntrian);
  $(window).on("beforeunload", stopPolling);
});

function startPolling() {
  pollingInterval = setInterval(loadAntrian, 5000);
}

function stopPolling() {
  if (pollingInterval) clearInterval(pollingInterval);
}

function loadAntrian() {
  apiCall("/queue/today", "GET")
    .done(function (res) {
      var data = res.data || [];
      $("#lastUpdate").text(new Date().toLocaleTimeString("id-ID"));

      if (data.length === 0) {
        $("#mainContent").html(
          '<div class="empty-state">' +
            '<div class="ei">🏥</div>' +
            "<h5>Tidak Ada Antrian Aktif Hari Ini</h5>" +
            "<p>Anda belum punya booking untuk hari ini.</p>" +
            '<a href="booking.html" class="btn-booking-baru">Booking Sekarang</a>' +
            "</div>"
        );
        return;
      }

      var cards = data
        .map(function (q) {
          return renderAntrianCard(q);
        })
        .join("");
      $("#mainContent").html(cards);

      // Load posisi untuk yang masih menunggu
      data
        .filter(function (q) {
          return q.status === "menunggu";
        })
        .forEach(function (q) {
          loadPosisiAntrian(q);
        });
    })
    .fail(function () {
      $("#mainContent").html(
        '<div class="empty-state" style="background:#fff;border-radius:16px;box-shadow:0 2px 10px rgba(0,0,0,0.06)">' +
          '<div class="ei">⚠️</div>' +
          "<div>Gagal memuat antrian</div>" +
          "</div>"
      );
    });
}

function renderAntrianCard(queue) {
  var actionBtn = "";
  if (queue.status === "menunggu") {
    actionBtn =
      '<div style="margin-top:14px;text-align:right">' +
      '<button class="btn-batal" onclick="batalkanAntrian(' +
      queue.id +
      ')">' +
      "✕ Batalkan Booking</button>" +
      "</div>";
  }

  var posisiDiv =
    queue.status === "menunggu"
      ? '<div class="posisi-info" id="posisi-' +
        queue.id +
        '">' +
        "⏳ Menghitung posisi antrian...</div>"
      : "";

  return (
    '<div class="antrian-card">' +
    '<div class="antrian-card-header ' +
    queue.status +
    '">' +
    "<h6>Antrian #" +
    queue.nomor_antrian +
    "</h6>" +
    '<span class="pill pill-' +
    queue.status +
    '">' +
    ucFirst(queue.status) +
    "</span>" +
    "</div>" +
    '<div class="antrian-body">' +
    '<div class="d-flex align-items-center">' +
    '<div style="min-width:90px;text-align:center">' +
    '<div class="nomor-besar">' +
    queue.nomor_antrian +
    "</div>" +
    '<div class="nomor-label">No. Antrian</div>' +
    "</div>" +
    '<div style="width:1px;background:#f1f5f9;align-self:stretch;margin:0 18px"></div>' +
    '<div class="flex-1">' +
    '<div class="info-row">' +
    '<div class="info-label">Dokter</div>' +
    '<div class="info-value">' +
    queue.nama_dokter +
    "</div>" +
    "</div>" +
    '<div class="info-row">' +
    '<div class="info-label">Poli</div>' +
    '<div class="info-value">' +
    queue.nama_poli +
    "</div>" +
    "</div>" +
    '<div class="info-row" style="margin-bottom:0">' +
    '<div class="info-label">Tanggal</div>' +
    '<div class="info-value">' +
    formatDate(queue.tanggal) +
    "</div>" +
    "</div>" +
    "</div>" +
    "</div>" +
    posisiDiv +
    actionBtn +
    "</div>" +
    "</div>"
  );
}

function loadPosisiAntrian(queue) {
  $("#posisi-" + queue.id).html(
    '<span style="font-weight:700">Nomor Anda: ' +
      queue.nomor_antrian +
      "</span> " +
      "— Antrian dipanggil sesuai urutan oleh petugas."
  );
}

function batalkanAntrian(id) {
  if (!confirm("Yakin batalkan booking ini? Nomor antrian akan hangus."))
    return;

  apiCall("/queue/" + id + "/status", "PUT", { status: "batal" })
    .done(function (res) {
      alert(res.message);
      loadAntrian();
    })
    .fail(function (xhr) {
      alert(xhr.responseJSON ? xhr.responseJSON.message : "Gagal batalkan");
    });
}

function ucFirst(str) {
  if (!str) return "";
  return str.charAt(0).toUpperCase() + str.slice(1);
}
