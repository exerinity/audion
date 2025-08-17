const deb_ms = 500;
let lastact = 0;
const elements = {
    player: document.getElementById('player'),
    upload: document.getElementById('upload'),
    url: document.getElementById('url'),
    status: document.getElementById('status'),
    title: document.getElementById('np'),
    title2: document.getElementById('np2'),
    timeCurrent: document.getElementById('time-current'),
    timeDuration: document.getElementById('time-duration'),
    index: document.getElementById('index'),
    indexTooltip: document.getElementById('index-tooltip'),
    vol: document.getElementById('volume'),
    vol_min: document.getElementById('vol-min'),
    vol_max: document.getElementById('vol-max'),
    speed: document.getElementById('speed'),
    speed_min: document.getElementById('spd-min'),
    speed_max: document.getElementById('spd-max'),
    viz_int: document.getElementById('viz-intensity'),
    viz_mo: document.getElementById('viz-mode'),
    eq_pre: document.getElementById('eq-preset'),
    err_tab: document.getElementById('error'),
    pnow: document.getElementById('play-now'),
    stopnow: document.getElementById('cancel'),
    success_sound: document.getElementById('sucsound'),
    error_sound: document.getElementById('errsound'),
};

let stat_calls = 0;
let stat_out = null;

function stat_up(msg, ac = true) {
    stat_calls++;
    elements.status.innerHTML = msg;

    if (ac) {
        if (stat_out) {
            clearTimeout(stat_out);
        }
        stat_out = setTimeout(() => {
            if (!elements.player.src) {
                elements.status.innerHTML = '<i class="fa-solid fa-tower-broadcast"></i> Audion';
            } else if (elements.player.paused) {
                elements.status.innerHTML = `<i class="fa-solid fa-circle-pause"></i> <strong>${truncate(metadata.title || 'Unknown track')}</strong> by ${truncate(metadata.artist || 'Unknown artist')}`;
            } else {
                elements.status.innerHTML = `<i class="fa-solid fa-circle-play"></i> <strong>${truncate(metadata.title || 'Unknown track')}</strong> by ${truncate(metadata.artist || 'Unknown artist')}`;
            }
            stat_out = null;
        }, 2000);
    }
}

function debounce(fn) {
    return () => {
        const now = Date.now();
        if (now - lastact < deb_ms) return;
        lastact = now;
        fn();
    };
}

function play(fileOrUrl, name) {
    lrc_wipe();
    if (!elements.success_sound.paused) {
        elements.success_sound.pause();
    }
    const now = Date.now();
    if (now - lastact < deb_ms) return;
    lastact = now;
    elements.player.src = typeof fileOrUrl === 'string' ? fileOrUrl : URL.createObjectURL(fileOrUrl);
    setCurrentFile(fileOrUrl);
    let retries = 0;
    const m_retries = 3;
    function attempt2play() {
        elements.player.play().then(() => {
            document.getElementById('plps').innerHTML = '<i class="fa-solid fa-pause"></i>';
            context_init(elements.player);
            vis_init();
            tabtitle();
            elements.title2.innerHTML = name;
            if (typeof fileOrUrl !== 'string') {
                get_meta(fileOrUrl);
            } else {
                document.getElementById('artist').innerHTML = '';
                document.getElementById('album').innerHTML = '';
                document.getElementById('cover-art').classList.add('hidden');
            }
        }).catch(e => {
            if (retries < m_retries) {
                retries++;
                setTimeout(attempt2play, 1000);
            } else {
                throw_error(e.message);
                stat_up('Error playing...');
            }
        });
    }
    elements.player.addEventListener('canplaythrough', attempt2play, { once: true });
}

function init() {
    if (/android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(navigator.userAgent)) {
        document.getElementById('mobo_warn').classList.remove('hidden');
        document.getElementById('app').remove();
        return;
    }

    document.getElementById('app').classList.remove('hidden');

    elements.upload.addEventListener('change', function () {
        const file = elements.upload.files[0];
        if (file) {
            stat_up(`<i class="fa-solid fa-hourglass fa-spin"></i> Loading: ${file.name}`);
            play(file, file.name);
        }
    });

    let onrepeat = true;
    elements.player.loop = true;
    const rep_button = document.getElementById('loop');
    rep_button.innerHTML = '<i class="fa-solid fa-repeat"></i>';
    rep_button.style.color = 'green';
    document.getElementById('loop').addEventListener('click', debounce(() => {
        onrepeat = !onrepeat;
        elements.player.loop = onrepeat;
        rep_button.innerHTML = '<i class="fa-solid fa-repeat"></i>';
        rep_button.style.color = onrepeat ? 'green' : 'red';
        stat_up(onrepeat ? '<i class="fa-solid fa-repeat"></i> Loop ON' : '<i class="fa-solid fa-repeat"></i> Loop OFF');
    }));

    elements.player.addEventListener('play', () => {
        if (frame_id) {
            cancelAnimationFrame(frame_id);
        }
        frame_id = requestAnimationFrame(vis_init);

        setInterval(tabtitle, 5000);
    });

    elements.player.addEventListener('pause', () => {
        clearInterval(tabtitle);
        document.title = 'Audion';
        if (frame_id) {
            cancelAnimationFrame(frame_id);
            frame_id = null;
        }
    });

    elements.player.addEventListener('ended', () => {
        stat_up('<i class="fa-solid fa-octagon"></i> Stopped');
    });

    elements.player.addEventListener('error', (e) => {
        const error = elements.player.error;
        let err_msg = 'Playback error: ';
        if (error) {
            if (error.code === 4) {
                err_msg = "Your browser doesn't support this file format!";
            } else {
                err_msg += ` (Code ${error.code}${error.message ? ': ' + error.message : ''})`;
            }
        }
        throw_error(err_msg);
    });

    elements.player.addEventListener('timeupdate', () => {
        const current = form_time(elements.player.currentTime);
        const duration = form_time(elements.player.duration);
        elements.timeCurrent.innerHTML = current;
        elements.timeDuration.innerHTML = duration;
        elements.index.max = elements.player.duration || 100;
        elements.index.value = elements.player.currentTime;
        update_lyrics();
    });

    elements.vol.addEventListener('input', () => {
        let hi = '<i class="fa-solid fa-volume-high"></i>';
        let med = '<i class="fa-solid fa-volume-low"></i>';
        let low = '<i class="fa-solid fa-volume-off"></i>';
        let mute = '<i class="fa-solid fa-volume-xmark"></i>';
        elements.player.volume = elements.vol.value / 2;
        elements.vol_min.innerHTML = '0';
        elements.vol_max.innerHTML = '1';

        let icon;
        if (elements.player.volume === 0) {
            icon = mute;
        } else if (elements.player.volume < 0.33) {
            icon = low;
        } else if (elements.player.volume < 0.66) {
            icon = med;
        } else {
            icon = hi;
        }

        stat_up(`${icon} Volume: ${(elements.player.volume * 100).toFixed(0)}%`);
    });

    elements.speed.addEventListener('input', () => {
        let low = '<i class="fa-solid fa-gauge-high fa-flip-horizontal"></i>';
        let med = '<i class="fa-solid fa-gauge"></i>';
        let hi = '<i class="fa-solid fa-gauge-high"></i>';
        let icon;
        if (elements.speed.value < 0.5) {
            icon = low;
        } else if (elements.speed.value < 1.5) {
            icon = med;
        } else {
            icon = hi;
        }
        elements.player.playbackRate = elements.speed.value;
        elements.speed_min.innerHTML = '0.1x';
        elements.speed_max.innerHTML = '2.0x';
        stat_up(`${icon} Speed: ${elements.speed.value}x`);
    });

    elements.index.addEventListener('input', () => {
        elements.player.currentTime = elements.index.value;
        stat_up(`<i class="fa-solid fa-music"></i> Scrubbing to: ${form_time(elements.index.value)} / ${form_time(elements.player.duration)}`);
    });

    elements.viz_mo.addEventListener('change', () => {
        stat_up(`<i class="fa-solid fa-chart-simple"></i> Visualizer mode: ${elements.viz_mo.value}`);
    });

    setInterval(() => {
        document.getElementById('today').innerHTML = new Date().toLocaleTimeString('en-US', {
            hour12: true,
            hour: 'numeric',
            minute: '2-digit'
        }).toLowerCase() + ' <br> ' + new Date().toLocaleDateString();
    }, 700);
}

function form_time(t) {
    if (isNaN(t)) return '--:--';
    const m = Math.floor(t / 60);
    const s = Math.floor(t % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
}

function truncate(text, truncate_max = 50) {
    if (text.length <= truncate_max) {
        return text;
    }
    return text.slice(0, truncate_max) + '...';
}


stat_up('<i class="fa-solid fa-tower-broadcast fa-beat" style="color: #ff7c24d0;"></i> Welcome to Audion!');


document.addEventListener('DOMContentLoaded', init) || init();