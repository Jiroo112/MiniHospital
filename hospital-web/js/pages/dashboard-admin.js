$(function() {
    requireRole('admin');
    injectNavbar('admin', 'dashboard');
    $('#userName').text(getUser().name);
});