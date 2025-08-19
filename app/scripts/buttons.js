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

document.getElementById('viscolchange').addEventListener('click', debounce(() => {
    const button = document.getElementById('viscolchange');
    const colchange = document.createElement('input');
    colchange.type = 'color';
    colchange.value = viz_color;
    colchange.style.position = 'absolute';
    colchange.style.left = `${button.offsetLeft}px`;
    colchange.style.top = `${button.offsetTop + button.offsetHeight}px`;
    colchange.style.zIndex = '1000';
    colchange.style.width = '100px';
    colchange.style.height = '50px';
    colchange.style.border = 'none';
    colchange.style.cursor = 'pointer';
    colchange.style.background = 'none';
    document.body.appendChild(colchange);
    colchange.addEventListener('input', () => {
        viz_color = colchange.value;
        button.style.color = viz_color;
        stat_up(`<i class="fa-solid fa-palette"></i> Visualizer color set to: <span style="color: ${viz_color};">${viz_color}</span>`);
    });
    colchange.addEventListener('blur', () => {
        document.body.removeChild(colchange);
    });
}));

document.getElementById('toys').addEventListener('click', debounce(() => {
    msg(`
        <h2>Toys</h2>
        <p>Throw an error:</p>
        <div style="display: flex; flex-direction: column; gap: 0.5rem; margin: 1rem 0;">
            <div style="display: flex; gap: 0.5rem; align-items: center;">
                <input id="cuserrinp" type="text" placeholder="Error message" 
                    style="flex: 1; padding: 0.5rem; border-radius: 6px; border: 1px solid #444; background: #2a2a2a; color: white;">
                <button id="cuserrbtn" 
                    style="padding: 10px 20px; background: #c0392b; color: white; border: none; border-radius: 4px; cursor: pointer; white-space: nowrap;">
                    Throw!
                </button>
            </div>
            <label style="display: flex;">
                <input type="checkbox" id="cuserrsuccess">
                Success? (purple, no error sound)
            </label>
        </div>
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
    }, 0);
}));




document.getElementById('info').addEventListener('click', debounce(() => {
    window.open("https://github.com/exerinity/audion", '_blank');
}));