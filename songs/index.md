---
layout: tree
title: Song Index
---
<div class="sc-bdfBwQ jrDHLp">
    {% for song in site.pages %}
        {% if song.path contains 'songs/' and song.path != 'songs/index.md' and song.path != 'songs/template.md' %}
            <div data-id="355317540" class="sc-bdfBwQ pkAuV">
                <div id="355317540" class="sc-bdfBwQ sc-kIeTtH jAmcnV cnxSGb"></div>
                <div data-testid="StyledContainer" class="sc-bdfBwQ sc-dmlrTW eua-dhZ kGoTFc group" type="CLASSIC">
                    <a href="{{ song.short_name }}"
                        rel="noopener" data-testid="LinkButton"
                        class="sc-pFZIQ sc-hHftDr ldGKnQ fhtMSy group"
                        height="auto">
                        <div class="w-full h-full">
                            <div data-testid="LinkThumbnail"
                                class="sc-bdfBwQ sc-gsTCUz sc-bkzZxe dgVnpq bhdLno CvSZl"></div>
                            <p class="sc-hKgILt sc-jUEnpm gXKGT fmxDzY">{{ song.song_name }}</p>
                        </div>
                    </a>
                </div>
            </div>
        {% endif %}
    {% endfor %}
    <!-- {% for song in songs %}
    {% endfor %} -->
</div>