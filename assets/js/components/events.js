document.addEventListener('DOMContentLoaded', function() {
    // Handle music platform link tracking
    document.querySelectorAll('[data-track-platform]').forEach(function(el) {
        el.addEventListener('click', function(e) {
            e.preventDefault();
            var url = this.href;

            var platform = this.dataset.trackPlatform;
            platform = platform.charAt(0).toUpperCase() + platform.slice(1);
            var songName = this.dataset.song;
            var trackingLabel = platform + ' for ' + songName;

            console.debug('Clicked: ' + trackingLabel);
            
            // Facebook Pixel tracking
            if (typeof fbq !== 'undefined') {
                var fbqEvent = 'LinkClickTo' + platform;
                fbq('trackCustom', fbqEvent);
                console.debug(fbqEvent);
            }
            
            // Google Analytics tracking
            if (typeof gtag !== 'undefined') {
                gtag('event', 'music_link_click', {
                    event_category: 'Outbound Link',
                    event_label: 'Platform Link Click',
                    song_name: songName,
                    platform: platform,
                  });
                console.debug('GA ' + trackingLabel);
            }
            console.debug('END');

            // Give GA time to send the event
            setTimeout(function() {
              window.location.href = url;
            }, 200);
        });
    });

    // Legacy support for existing data-fbtrack elements
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