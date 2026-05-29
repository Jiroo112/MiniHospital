/**
 * components.js
 * Navbar & Alert helper untuk semua role
 * Style konsisten mengikuti navbar Admin
 */

function injectNavbar(role, activePage) {
  activePage = activePage || "";

  var configs = {
    dokter: {
      color: "#16A34A",
      colorLight: "#F0FDF4",
      colorMid: "#DCFCE7",
      label: "Dokter",
      base: "/MiniHospital/hospital-web/views/dokter/",
      menu: [
        {
          href: "dashboard.html",
          label: "Dashboard",
          key: "dashboard",
          icon: "bi-speedometer2",
        },
        {
          href: "antrian.html",
          label: "Antrian",
          key: "antrian",
          icon: "bi-list-ol",
        },
        {
          href: "rekam-medis.html",
          label: "Rekam Medis",
          key: "rekam",
          icon: "bi-clipboard2-pulse",
        },
      ],
    },
    pasien: {
      color: "#0284C7",
      colorLight: "#F0F9FF",
      colorMid: "#BAE6FD",
      label: "Pasien",
      base: "/MiniHospital/hospital-web/views/pasien/",
      menu: [
        {
          href: "dashboard.html",
          label: "Dashboard",
          key: "dashboard",
          icon: "bi-speedometer2",
        },
        {
          href: "booking.html",
          label: "Booking",
          key: "booking",
          icon: "bi-calendar-plus",
        },
        {
          href: "antrian.html",
          label: "Antrian",
          key: "antrian",
          icon: "bi-hourglass-split",
        },
        {
          href: "riwayat.html",
          label: "Riwayat",
          key: "riwayat",
          icon: "bi-clock-history",
        },
      ],
    },
  };

  var c = configs[role];
  if (!c) return;

  var user = getUser() || {};
  var initials = (user.name || "U")
    .split(" ")
    .map(function (w) {
      return w[0];
    })
    .join("")
    .toUpperCase()
    .substring(0, 2);

  var menuHtml = c.menu
    .map(function (item) {
      var isActive = item.key === activePage;
      return (
        '<a href="' +
        c.base +
        item.href +
        '" style="' +
        "font-size:0.875rem;font-weight:" +
        (isActive ? "600" : "500") +
        ";" +
        "color:" +
        (isActive ? c.color : "#64748B") +
        ";" +
        "text-decoration:none;padding:6px 14px;border-radius:8px;" +
        "background:" +
        (isActive ? c.colorLight : "transparent") +
        ";" +
        'transition:all 0.15s;white-space:nowrap;display:inline-flex;align-items:center;gap:6px"' +
        " onmouseover=\"if(!this.classList.contains('nav-active')){this.style.background='#F8FAFC';this.style.color='#0F172A'}\"" +
        " onmouseout=\"if(!this.classList.contains('nav-active')){this.style.background='" +
        (isActive ? c.colorLight : "transparent") +
        "';this.style.color='" +
        (isActive ? c.color : "#64748B") +
        "'}\">" +
        '<i class="bi ' +
        item.icon +
        '"></i>' +
        item.label +
        "</a>"
      );
    })
    .join("");

  var html =
    "<style>" +
    ".mh-navbar{background:#fff;border-bottom:1px solid #E2E8F0;padding:0 2rem;height:64px;" +
    "display:flex;align-items:center;position:sticky;top:0;z-index:100;" +
    "box-shadow:0 1px 3px rgba(0,0,0,0.06)}" +
    ".mh-brand{font-size:1.05rem;font-weight:800;color:" +
    c.color +
    ";letter-spacing:-0.02em;" +
    "display:flex;align-items:center;gap:10px;text-decoration:none;white-space:nowrap}" +
    ".mh-brand-icon{width:34px;height:34px;background:" +
    c.color +
    ";border-radius:9px;" +
    "display:grid;place-items:center;color:#fff;font-size:1rem}" +
    ".mh-nav-links{display:flex;align-items:center;gap:2px;margin-left:2rem}" +
    ".mh-nav-right{margin-left:auto;display:flex;align-items:center;gap:12px}" +
    ".mh-avatar{width:36px;height:36px;border-radius:50%;display:grid;place-items:center;" +
    "color:#fff;font-size:0.8rem;font-weight:700;" +
    "background:linear-gradient(135deg," +
    c.color +
    " 0%,#60A5FA 100%)}" +
    ".mh-username{font-size:0.875rem;font-weight:600;color:#0F172A}" +
    ".mh-btn-logout{font-size:0.8rem;font-weight:600;color:#64748B;background:none;" +
    "border:1px solid #E2E8F0;border-radius:8px;padding:5px 14px;cursor:pointer;" +
    "transition:all 0.15s;font-family:inherit}" +
    ".mh-btn-logout:hover{background:#FEF2F2;color:#DC2626;border-color:#DC2626}" +
    "@media(max-width:768px){.mh-nav-links{display:none}}" +
    "</style>" +
    '<nav class="mh-navbar">' +
    '<a href="' +
    c.base +
    'dashboard.html" class="mh-brand">' +
    '<span class="mh-brand-icon"><i class="bi bi-hospital"></i></span>' +
    "MiniHospital" +
    "</a>" +
    '<div class="mh-nav-links">' +
    menuHtml +
    "</div>" +
    '<div class="mh-nav-right">' +
    '<div class="mh-avatar">' +
    initials +
    "</div>" +
    '<span class="mh-username" id="navUserName">' +
    (user.name || "") +
    "</span>" +
    '<button class="mh-btn-logout" onclick="logout()">' +
    '<i class="bi bi-box-arrow-right" style="margin-right:4px"></i>Keluar' +
    "</button>" +
    "</div>" +
    "</nav>" +
    '<link href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css" rel="stylesheet">';

  $("#navbar").html(html);
}

/**
 * Helper alert flash
 */
function showAlert(target, type, message) {
  var html =
    '<div class="alert alert-' +
    type +
    ' alert-dismissible fade show" style="border-radius:10px;font-size:0.875rem">' +
    message +
    '<button type="button" class="btn-close" data-bs-dismiss="alert"></button>' +
    "</div>";
  $(target).html(html);
}
