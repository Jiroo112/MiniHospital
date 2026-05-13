$(function() {
    requireRole('dokter');
    injectNavbar('dokter');
    $('#userName').text(getUser().name);
});