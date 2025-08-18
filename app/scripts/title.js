const wm = document.querySelector('title');
let now = 0;
// This is shitty, but hopefully works
function tabtitle() {
    const scroll = [
        metadata.title || 'Audion',
        metadata.artist || 'Audion',
        metadata.album || 'Audion',
        `Audion`
    ];
    wm.textContent = scroll[now];
    now = (now + 1) % scroll.length;
}

setInterval(tabtitle, 5000);
tabtitle();

/* This script is inspired by Windows Media Player's title bar, most prominently the miniplayer, on XP and above
   (I probably got that wrong, but I seen this on XP, 7, and 10)
   What I mean: https://i.exerinity.com/wmp.gif
*/