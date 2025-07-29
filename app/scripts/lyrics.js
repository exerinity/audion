let cur_file = null;
let lrc_data = [];

function get_meta(file) {
    jsmediatags.read(file, {
        onSuccess: function(tag) {
            const tags = tag.tags;
            const data = {
                title: tags.title || file.name || 'Unknown title',
                artist: tags.artist || 'Unknown artist',
                album: tags.album || 'Unknown album',
                picture: tags.picture
            };
            if (!data.title || !data.artist || !data.album) {
                throw_error("There is missing metadata, lyrics may not work");
            }
            document.getElementById('artist').innerHTML = `<strong>${data.artist}</strong>`;
            document.getElementById('album').innerHTML = `<strong>${data.album}</strong>`;
            document.getElementById('np2').innerHTML = data.title;
            document.getElementById('aod').innerHTML = `${data.title} by ${data.artist}`;
            const cover = document.getElementById('cover-art');
            if (data.picture) {
                const arr = new Uint8Array(data.picture.data);
                let binary = '';
                const cs = 8192;
                for (let i = 0; i < arr.length; i += cs) {
                    binary += String.fromCharCode.apply(null, arr.subarray(i, i + cs));
                }
                const b64 = btoa(binary);
                cover.src = `data:${data.picture.format};base64,${b64}`;
                cover.classList.remove('hidden');
            } else {
                cover.classList.add('hidden');
            }
            get_lyrics(data.title, data.artist, data.album, Math.floor(document.getElementById('player').duration));
        },
        onError: function() {
            document.getElementById('artist').innerHTML = '';
            document.getElementById('album').innerHTML = '';
            document.getElementById('np2').innerHTML = file.name || 'Unknown track';
            document.getElementById('aod').innerHTML = '';
            document.getElementById('cover-art').classList.add('hidden');
            throw_error("There is missing metadata, lyrics may not work");
        }
    });
}

async function get_lyrics(trackName, artistName, albumName, duration) {
    lrc_wipe();
    stat_up("Looking for lyrics...");
    const lrc_con = document.getElementById('lyrics');
    lrc_con.innerHTML = '<div class="spinner"></div>';
    try {
        const response = await fetch(
            `https://lrclib.net/api/get?artist_name=${encodeURIComponent(artistName)}&track_name=${encodeURIComponent(trackName)}&album_name=${encodeURIComponent(albumName)}&duration=${duration}`,
        );
        const data = await response.json();
        if (response.ok && data.syncedLyrics) {
            lrc_data = lrc_parse(data.syncedLyrics);
            stat_up("Found lyrics");
            update_lyrics();
        } else if (response.ok && data.plainLyrics) {
            lrc_data = data.plainLyrics.split('\n').map(line => ({ time: 0, text: line }));
            update_lyrics();
            stat_up("No timed lyrics found");
        } else {
            stat_up("No lyrics found");
            lrc_con.innerHTML = '';
            lrc_data = [];
        }
    } catch (e) {
        stat_up("No lyrics found");
        lrc_con.innerHTML = '';
        lrc_data = [];
        throw_error(e.message);
    }
}

function lrc_parse(syncedLyrics) {
    const lines = syncedLyrics.split('\n').filter(line => line.trim());
    return lines.map(line => {
        const match = line.match(/\[(\d{2}:\d{2}\.\d{2})\](.*)/);
        if (match) {
            const timeParts = match[1].split(':');
            const time = parseInt(timeParts[0]) * 60 + parseFloat(timeParts[1]);
            return { time, text: match[2].trim() };
        }
        console.warn(`Skipping malformed LRC line: ${line}`);
        return { time: 0, text: line.trim() };
    }).filter(line => line.text);
}

function lrc_play(lrc_currents, act_index) {
    const lrc_con = document.getElementById('lyrics');
    lrc_con.innerHTML = '';
    lrc_currents.forEach((line) => {
        const p = document.createElement('p');
        p.textContent = line.text || ' ';
        p.dataset.index = line.ogindex;
        if (line.ogindex === act_index) {
            p.classList.add('active');
        }
        lrc_con.appendChild(p);
    });
}

function update_lyrics() {
    const player = document.getElementById('player');
    const lrc_con = document.getElementById('lyrics');
    const cur_time = player.currentTime;
    let act_index = -1;

    for (let i = 0; i < lrc_data.length; i++) {
        if (lrc_data[i].time <= cur_time && (i === lrc_data.length - 1 || lrc_data[i + 1].time > cur_time)) {
            act_index = i;
            break;
        }
    }

    const lrc_currents = [];
    let lrc_amount = 8;
    let half = Math.floor(lrc_amount / 2);

    let lrc_si = Math.max(0, act_index - half);
    let lrc_en = Math.min(lrc_data.length - 1, act_index + half);

    if (act_index < half) {
        lrc_en = Math.min(lrc_amount - 1, lrc_data.length - 1);
        lrc_si = 0;
    }
    if (act_index > lrc_data.length - half - 1) {
        lrc_si = Math.max(0, lrc_data.length - lrc_amount);
        lrc_en = lrc_data.length - 1;
    }

    for (let i = lrc_si; i <= lrc_en; i++) {
        lrc_currents.push({ ...lrc_data[i], ogindex: i });
    }

    lrc_play(lrc_currents, act_index);

    if (act_index >= 0) {
        const lrc_actel = lrc_con.querySelector(`p[data-index="${act_index}"]`);
        if (lrc_actel) {
            const lrc_actel_h = lrc_con.clientHeight;
            const lrc_act_h = lrc_actel.offsetHeight;
            const lrc_actel_top = lrc_actel.offsetTop;
            const lrc_scrollto = lrc_actel_top - (lrc_actel_h / 2) + (lrc_act_h / 2);
            lrc_con.scrollTo({ top: lrc_scrollto, behavior: 'smooth' });
        }
    }
}

function lrc_wipe() {
    document.getElementById('lyrics').innerHTML = '';
    lrc_data = [];
}

function setCurrentFile(file) {
    cur_file = file;
}

function force() {
    const player = document.getElementById('player');
    player.addEventListener('timeupdate', update_lyrics);
}

document.addEventListener('DOMContentLoaded', force);