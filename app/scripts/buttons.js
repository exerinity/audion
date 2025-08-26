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
            <li><strong>R</strong>: Restart track</li>
            </ul>
        `);
}));

document.getElementById('cover-art').addEventListener('click', debounce(() => {
    if (globalart) {
        msg(`<img src="${globalart}" title="Click to open full image in a new tab" alt="Cover art" style="max-width: 100%; height: auto; border-radius: 8px; cursor: pointer;" id="msgart">`);
        setTimeout(() => {
            const img = document.getElementById('msgart');
            if (img) {
                img.onclick = () => {
                    const ua = navigator.userAgent;
                    if (ua.includes('Firefox')) {
                        window.open(globalart, '_blank');
                    } else if (ua.includes('Chrome')) {
                        return msg(`You will need to right-click the image and select <strong>Open image in new tab</strong> on Chrome.<br><small>For some reason, on Chrome, with base64 encoded images, <strong>window.open()</strong> gives you <strong>about:blank</strong> instead of the image.</small>`);
                    } else {
                        window.open(globalart, '_blank');
                    }
                };
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
        <div style="display: flex; flex-direction: column; gap: 1rem; margin: 1rem 0;">
            <div>
                <p style="margin: 0 0 0.5rem 0;">Throw an error:</p>
                <div style="display: flex; gap: 0.5rem; align-items: center;">
                    <input id="cuserrinp" type="text" placeholder="Error message" 
                        style="flex: 1; padding: 0.5rem; border-radius: 6px; border: 1px solid #444; background: #2a2a2a; color: white;">
                    <button id="cusbtn1" 
                        style="padding: 10px 20px; background: #c0392b; color: white; border: none; border-radius: 4px; cursor: pointer; white-space: nowrap;">
                        Throw!
                    </button>
                </div>
            </div>

            <div>
                <p style="margin: 0 0 0.5rem 0;">Push a status:</p>
                <div style="display: flex; gap: 0.5rem; align-items: center;">
                    <input id="statinp" type="text" placeholder="Status message" 
                        style="flex: 1; padding: 0.5rem; border-radius: 6px; border: 1px solid #444; background: #2a2a2a; color: white;">
                    <button id="btn2" 
                        style="padding: 10px 20px; background: #2980b9; color: white; border: none; border-radius: 4px; cursor: pointer; white-space: nowrap;">
                        Send
                    </button>
                </div>
            </div>

            <div>
                <p style="margin: 0 0 0.5rem 0;">Show a message popup:</p>
                <div style="display: flex; gap: 0.5rem; align-items: center;">
                    <input id="msginp" type="text" placeholder="Dialog HTML or text" 
                        style="flex: 1; padding: 0.5rem; border-radius: 6px; border: 1px solid #444; background: #2a2a2a; color: white;">
                    <button id="msgbtn" 
                        style="padding: 10px 20px; background: #27ae60; color: white; border: none; border-radius: 4px; cursor: pointer; white-space: nowrap;">
                        Show
                    </button>
                </div>
            </div>
        </div>
    `);

    setTimeout(() => {
        const btn1 = document.getElementById('cusbtn1');
        const input1 = document.getElementById('cuserrinp');

        const btn2 = document.getElementById('btn2');
        const input2 = document.getElementById('statinp');

        const btn3 = document.getElementById('msgbtn');
        const input3 = document.getElementById('msginp');

        if (btn1 && input1) {
            btn1.addEventListener('click', () => {
                const message = input1.value.trim();
                if (message) {
                    throw_error(message, false);
                } else {
                    throw_error('You must enter a message, that\'s <i>your</i> error!', false);
                }
            });
        }

        if (btn2 && input2) {
            btn2.addEventListener('click', () => {
                const message = input2.value.trim();
                if (message) {
                    stat_up(message);
                } else {
                    stat_up('<span style="display: inline-flex; align-items: center;"><img src="https://upload.wikimedia.org/wikipedia/commons/0/0d/Winamp-logo.svg" style="width: 1.2em; height: 1.2em; margin-right: 0.4em; vertical-align: middle;">This is inspired by Winamp!</span>');
                }
            });
        }

        if (btn3 && input3) {
            btn3.addEventListener('click', () => {
                const message = input3.value.trim();
                if (message) {
                    msg(message);
                } else {
                    msg('???');
                }
            });
        }
    }, 0);
}));

document.getElementById('info').addEventListener('click', debounce(() => {
    window.open("https://github.com/exerinity/audion", '_blank');
}));

document.getElementById('status').addEventListener('click', debounce(() => {
    if (!metadata.title && !metadata.artist) {
        return throw_error('No track playing!');
    }
    const name = metadata.title + ' by ' + metadata.artist;
    navigator.clipboard.writeText(name).then(() => {
        throw_error(`Copied song to clipboard`, true);
    }).catch(err => {
        throw_error('Failed to copy - is Audion allowed to access your clipboard?');
    });
}));

document.getElementById('np2').addEventListener('click', debounce(() => {
    if (!metadata.title) {
        return throw_error('No title to copy!');
    }
    navigator.clipboard.writeText(metadata.title).then(() => {
        throw_error('Copied title to clipboard', true);
    }).catch(err => {
        throw_error('Failed to copy - is Audion allowed to access your clipboard?');
    });
}));

document.getElementById('artist').addEventListener('click', debounce(() => {
    if (!metadata.artist) {
        return throw_error('No artist to copy!');
    }
    navigator.clipboard.writeText(metadata.artist).then(() => {
        throw_error('Copied artist to clipboard', true);
    }).catch(err => {
        throw_error('Failed to copy - is Audion allowed to access your clipboard?');
    });
}));

document.getElementById('album').addEventListener('click', debounce(() => {
    if (!metadata.album) {
        return throw_error('No album to copy!');
    }
    navigator.clipboard.writeText(metadata.album).then(() => {
        throw_error('Copied album to clipboard', true);
    }).catch(err => {
        throw_error('Failed to copy - is Audion allowed to access your clipboard?');
    });
}));