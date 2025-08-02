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
    stopnow: document.getElementById('cancel')
};

function throw_error(msg) {
    document.getElementById('errsound').play();
    elements.err_tab.innerHTML = `<i class="fa-solid fa-triangle-exclamation"></i>` + msg;
    console.error(msg);
    elements.err_tab.classList.remove('hidden');
    setTimeout(() => elements.err_tab.classList.add('hidden'), 6000);
}

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
                elements.status.innerHTML = window.location.hostname || "music";
            } else if (elements.player.paused) {
                elements.status.innerHTML = `Now paused: <strong>${metadata.title || 'Unknown track'}</strong> by ${metadata.artist || 'Unknown artist'}`;
            } else {
                elements.status.innerHTML = `Now playing: <strong>${metadata.title || 'Unknown track'}</strong> by ${metadata.artist || 'Unknown artist'}`;
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

stat_up("Loading...");


function play(fileOrUrl, name) {
    lrc_wipe();
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
          //  eq_init();
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
            stat_up(`Loading: ${file.name}`);
            play(file, file.name);
        }
    });

    elements.url.addEventListener('change', function () {
        const link = elements.url.value.trim();
        if (link) {
                stat_up(`Loading: ${link}`);
                play(link, link);
        }
    });

    document.getElementById('plps').addEventListener('click', debounce(() => {
        if (elements.player.paused) {
            elements.player.play();
            document.getElementById('plps').innerHTML = '<i class="fa-solid fa-pause"></i>';
        } else {
            elements.player.pause();
            document.getElementById('plps').innerHTML = '<i class="fa-solid fa-play"></i>';
            stat_up('Paused');
        }
    }));

    document.getElementById('rwd').addEventListener('click', debounce(() => {
        elements.player.currentTime -= 10;
        stat_up('Going back 10 seconds...');
    }));

    document.getElementById('fwd').addEventListener('click', debounce(() => {
        elements.player.currentTime += 10;
        stat_up('Going forward 10 seconds...');
    }));

    document.getElementById('stop').addEventListener('click', debounce(() => {
        elements.player.currentTime = 0;
        stat_up('Restarted the track');
    }));

    document.getElementById('hotkeys').addEventListener('click', debounce(() => {
        msg(`
            <h2>Hotkeys</h2>
            <ul style="list-style-type: none; padding: 0;">
            <li><strong>Space</strong>: Toggle playback (Play/Pause)</li>
            <li><strong>Arrow Left</strong>: Seek backward 10 seconds</li>
            <li><strong>Shift + Arrow Left</strong>: Seek backward 1 second</li>
            <li><strong>Arrow Right</strong>: Seek forward 10 seconds</li>
            <li><strong>Shift + Arrow Right</strong>: Seek forward 1 second</li>
            <li><strong>Arrow Up</strong>: Increase volume by 2%</li>
            <li><strong>Arrow Down</strong>: Decrease volume by 2%</li>
            <li><strong>L</strong>: Toggle loop</li>
            </ul>
        `);
    }));
    document.getElementById('info').addEventListener('click', debounce(() => {
        window.open('/info', '_blank');
    }));

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
        stat_up(onrepeat ? 'Loop ON' : 'Loop OFF');
    }));

    elements.player.addEventListener('play', () => {
        stat_up('Playing...');
        if (frame_id) {
            cancelAnimationFrame(frame_id);
        }
        frame_id = requestAnimationFrame(vis_init);
    });

    elements.player.addEventListener('pause', () => {
        stat_up(`Pausing...`);
        if (frame_id) {
            cancelAnimationFrame(frame_id);
            frame_id = null;
        }
    });

    elements.player.addEventListener('ended', () => {
        stat_up('Stopped');
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
        stat_up('Error! Check the box below');
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
        elements.player.volume = elements.vol.value / 2;
        elements.vol_min.innerHTML = '0';
        elements.vol_max.innerHTML = '1';
        stat_up(`Volume: ${elements.player.volume.toFixed(2)}`);
    });

    elements.speed.addEventListener('input', () => {
        elements.player.playbackRate = elements.speed.value;
        elements.speed_min.innerHTML = '0.1x';
        elements.speed_max.innerHTML = '2.0x';
        stat_up(`Speed: ${elements.speed.value}x`);
    });

    elements.index.addEventListener('input', () => {
        elements.player.currentTime = elements.index.value;
        stat_up(`Scrubbing to: ${form_time(elements.index.value)} / ${form_time(elements.player.duration)}`);
    });

    elements.viz_mo.addEventListener('change', () => {
        stat_up(`Visualizer mode: ${elements.viz_mo.value}`);
    });

   /* elements.eq_pre.addEventListener('change', () => {
        eq_apply(elements.eq_pre.value);
        stat_up(`Equalizer preset: ${elements.eq_pre.value}`);
    });*/

    document.addEventListener('keydown', (e) => {
        if (e.code === 'Space') {
            e.preventDefault();
            document.getElementById('plps').click();
        } else if (e.code === 'ArrowLeft') {
            e.preventDefault();
            elements.player.currentTime -= e.shiftKey ? 1 : 10;
            stat_up(`Scrubbing to: ${form_time(elements.index.value)} / ${form_time(elements.player.duration)}`);
        } else if (e.code === 'ArrowRight') {
            e.preventDefault();
            elements.player.currentTime += e.shiftKey ? 1 : 10;
            stat_up(`Scrubbing to: ${form_time(elements.index.value)} / ${form_time(elements.player.duration)}`);
        } else if (e.code === 'KeyL') {
            document.getElementById('loop').click();
        } else if (e.code === 'ArrowUp') {
            e.preventDefault();
            elements.vol.value = Math.min(2, parseFloat(elements.vol.value) + 0.02);
            elements.player.volume = elements.vol.value / 2;
            stat_up(`Volume: ${elements.player.volume.toFixed(2)}`);
        } else if (e.code === 'ArrowDown') {
            e.preventDefault();
            elements.vol.value = Math.max(0, parseFloat(elements.vol.value) - 0.02);
            elements.player.volume = elements.vol.value / 2;
            stat_up(`Volume: ${elements.player.volume.toFixed(2)}`);
        }
    });

    setInterval(() => {
        document.getElementById('today').innerHTML = new Date().toLocaleTimeString('en-US', {
            hour12: true,
            hour: 'numeric',
            minute: '2-digit'
        }).toLowerCase() + ' <br> ' + new Date().toLocaleDateString(); // putting a line break here, i think a thicker top bar would look better :D
    }, 700);
}

function form_time(t) {
    if (isNaN(t)) return '--:--';
    const m = Math.floor(t / 60);
    const s = Math.floor(t % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
}

document.addEventListener('DOMContentLoaded', init) || init();