document.addEventListener('DOMContentLoaded', function() {
    document.querySelectorAll('[data-fbtrack]').forEach(function(el) {
        el.addEventListener('click', function(e) {
            e.preventDefault();
            var trackName = this.dataset.fbtrack;
            fbq('trackCustom', 'LinkClickToSpotify_' + trackName);
            setTimeout(function() {
                window.location.href = el.href;
            }, 500);
        });
    });
});