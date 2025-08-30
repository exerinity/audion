document.addEventListener('keydown', (e) => {
    const t = e.target;
    const tag = t && t.tagName ? t.tagName.toLowerCase() : '';
    if (
        (t && t.isContentEditable) ||
        tag === 'input' || tag === 'textarea' || tag === 'select' || tag === 'button' ||
        (t && t.closest && t.closest('[role="textbox"], [contenteditable="true"]'))
    ) {
        return;
    }

    let hi = '<i class="fa-solid fa-volume-high"></i>';
    let med = '<i class="fa-solid fa-volume-low"></i>';
    let low = '<i class="fa-solid fa-volume-off"></i>';
    let mute = '<i class="fa-solid fa-volume-xmark"></i>';

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

    if (e.code === 'Space' || e.code === 'KeyK') {
        e.preventDefault();
        document.getElementById('plps').click();
    } else if (e.code === 'ArrowLeft' || e.code === 'KeyJ' || e.code === 'KeyA') {
        e.preventDefault();
        elements.player.currentTime -= e.shiftKey ? 1 : 10;
        stat_up(`<i class="fa-solid fa-music"></i> Scrubbing to: ${form_time(elements.index.value)} / ${form_time(elements.player.duration)} (${e.shiftKey ? '1 second' : '10 seconds'})`);
    } else if (e.code === 'ArrowRight' || e.code === 'KeyL' || e.code === 'KeyD') {
        e.preventDefault();
        elements.player.currentTime += e.shiftKey ? 1 : 10;
        stat_up(`<i class="fa-solid fa-music"></i> Scrubbing to: ${form_time(elements.index.value)} / ${form_time(elements.player.duration)} (${e.shiftKey ? '1 second' : '10 seconds'})`);
    } else if (e.code === 'KeyT') {
        document.getElementById('loop').click();
    }
    else if (e.code === 'KeyR' && !e.ctrlKey) {
        e.preventDefault();
        elements.player.currentTime = 0;
        stat_up('<i class="fa-solid fa-arrow-rotate-left"></i> Restarted the track');
    }
    else if (e.code === 'ArrowUp' || e.code === 'KeyW') {
        e.preventDefault();
        elements.vol.value = Math.min(2, parseFloat(elements.vol.value) + 0.02);
        elements.player.volume = elements.vol.value / 2;
        stat_up(`${icon} Volume: ${(elements.player.volume * 100).toFixed(0)}%`);
    } else if (e.code === 'ArrowDown' || e.code === 'KeyS') {
        e.preventDefault();
        elements.vol.value = Math.max(0, parseFloat(elements.vol.value) - 0.02);
        elements.player.volume = elements.vol.value / 2;
        stat_up(`${icon} Volume: ${(elements.player.volume * 100).toFixed(0)}%`);
    }
});