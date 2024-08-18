// facebook spotify event
document.querySelectorAll('[data-fbtrack]').forEach(function(el) {
    el.addEventListener('click', function(e) {
        e.preventDefault();
        var trackName = this.getAttribute('data-fbtrack');
        fbq('trackCustom', 'LinkClickToSpotify_' + trackName);
        setTimeout(function() {
            window.location.href = this.getAttribute('href');
        }, 500);
    });
});