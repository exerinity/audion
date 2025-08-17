const wm = document.querySelector('title');
let now = 0;

function tabtitle() {
    const scroll = [
        metadata.title,
        metadata.artist,
        metadata.album,
        `Audion`
    ];
    wm.textContent = scroll[now];
    now = (now + 1) % scroll.length;
}