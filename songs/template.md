---
layout: songs
title: Template Song
short_name: template_song
song_description: This is a really great song.
spotify_id: 3kTzpwkUjZZPgfN5ie0zqL
---
<main>
    <div class="track-container">
        <div class="art-bkg" style="background-image: url('/images/songs/{{page.short_name}}.png');"></div>
        <div class="track-interactive">
            <img src="/images/songs/{{page.short_name}}.png" />
            <h1>{{ page.title }}</h1>
        </div>
    </div>
    <article class="details-container">
        <h2>{{ page.song_description }}</h2>
        <a href="https://open.spotify.com/track/{{ page.spotify_id }}">Listen!</a>
    </article>
</main>