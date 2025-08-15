document.getElementById('plps').addEventListener('click', debounce(() => {
    if (elements.player.paused) {
        elements.player.play();
        document.getElementById('plps').innerHTML = '<i class="fa-solid fa-pause"></i>';
        stat_up('<i class="fa-solid fa-circle-play"></i> Playing...');
    } else {
        elements.player.pause();
        document.getElementById('plps').innerHTML = '<i class="fa-solid fa-play"></i>';
        stat_up('<i class="fa-solid fa-circle-pause"></i> Paused');
    }
}));

document.getElementById('rwd').addEventListener('click', debounce(() => {
    elements.player.currentTime -= 10;
    stat_up(`<i class="fa-solid fa-music"></i> Scrubbing to: ${form_time(elements.index.value)} / ${form_time(elements.player.duration)}`);
}));

document.getElementById('fwd').addEventListener('click', debounce(() => {
    elements.player.currentTime += 10;
    stat_up(`<i class="fa-solid fa-music"></i> Scrubbing to: ${form_time(elements.index.value)} / ${form_time(elements.player.duration)}`);
}));

document.getElementById('stop').addEventListener('click', debounce(() => {
    elements.player.currentTime = 0;
    stat_up('<i class="fa-solid fa-arrow-rotate-left"></i> Restarted the track');
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

document.getElementById('cover-art').addEventListener('click', debounce(() => {
    if (globalart) {
        msg(`<img src="${globalart}" title="Click to open full image in a new tab" alt="Cover art" style="max-width: 100%; height: auto; border-radius: 8px; cursor: pointer;" id="msgart">`);
        setTimeout(() => {
            const img = document.getElementById('msgart');
            if (img) {
                img.onclick = () => window.open(globalart, '_blank'); // using javascript, because base64 links can be massive and the preview takes up your entire screen
            }
        }, 0);
    }
}));

document.getElementById('toys').addEventListener('click', debounce(() => {
    msg(`
        <h2>Toys</h2>
        <p>Throw an error:</p>
        <div style="display: flex; flex-direction: column; gap: 0.5rem; margin: 1rem 0;">
            <div style="display: flex; gap: 0.5rem; align-items: center;">
                <input id="cuserrinp" type="text" placeholder="Error message (can be ANYTHING)" 
                    style="flex: 1; padding: 0.5rem; border-radius: 6px; border: 1px solid #444; background: #2a2a2a; color: white;">
                <button id="cuserrbtn" 
                    style="padding: 10px 20px; background: #c0392b; color: white; border: none; border-radius: 4px; cursor: pointer; white-space: nowrap;">
                    Throw error
                </button>
            </div>
            <label style="display: flex;">
                <input type="checkbox" id="cuserrsuccess">
                Success
            </label>
        </div>

        <p>Visualizer color:</p>
        <input type="color" id="vizcuscop" value="${viz_color}" 
            style="width: 100%; height: 50px; border: none; cursor: pointer; background: none; margin: 1rem 0;">
        <footer>More toys coming soon :D</footer>
    `);

    setTimeout(() => {
        const btn = document.getElementById('cuserrbtn');
        const input = document.getElementById('cuserrinp');
        const sch = document.getElementById('cuserrsuccess');

        if (btn && input) {
            btn.addEventListener('click', () => {
                const message = input.value.trim();
                const succ = sch?.checked || false;

                if (message) {
                    throw_error(message, succ);
                } else {
                    throw_error('You must enter a message, that\'s <i>your</i> error!', succ);
                }
            });
        }

        const vizcusco = document.getElementById('vizcuscop');
        if (vizcusco) {
            vizcusco.addEventListener('input', () => {
                viz_color = vizcusco.value;
            });
        }
    }, 0);
}));




document.getElementById('info').addEventListener('click', debounce(() => {
    window.open("https://github.com/exerinity/audion", '_blank');
}));