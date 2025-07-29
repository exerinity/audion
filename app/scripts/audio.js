let au_con = null;
let analyser = null;
let source = null;
let nodes = [];

const bands = [
    { freq: 60, type: 'lowshelf' },
    { freq: 170, type: 'peaking' },
    { freq: 310, type: 'peaking' },
    { freq: 600, type: 'peaking' },
    { freq: 1000, type: 'peaking' },
    { freq: 3000, type: 'peaking' },
    { freq: 6000, type: 'peaking' },
    { freq: 12000, type: 'peaking' },
    { freq: 14000, type: 'peaking' },
    { freq: 16000, type: 'highshelf' }
];

const presets = {
    flat: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    pop: [2, 4, 4, 0, -2, -4, -4, -2, 0, 0],
    rock: [4, 3, 0, -2, -4, 0, 4, 6, 4, 2],
    jazz: [2, 2, 0, 2, 4, 4, 2, 0, 0, 0],
    classical: [2, 2, 0, 0, 0, 2, 4, 4, 2, 2],
    more_bass: [6, 5, 4, 2, 0, -2, -4, -6, -8, -10],
    less_bass: [-6, -5, -4, -2, 0, 2, 4, 6, 8, 10],
    treble_boost: [-4, -4, -2, 0, 2, 4, 6, 8, 10, 12],
    treble_reduce: [4, 4, 2, 0, -2, -4, -6, -8, -10, -12],
    vocal_boost: [-2, -2, 0, 2, 4, 4, 2, 0, -2, -2],
    treble_bass_boost: [6, 4, 2, 0, 0, 0, 2, 4, 6, 8],
    loudness: [5, 4, 2, 0, 0, 0, 2, 4, 5, 6]
};

function context_init(player) {
    if (!au_con) {
        try {
            au_con = new AudioContext();
            source = au_con.createMediaElementSource(player);
            analyser = au_con.createAnalyser();
            analyser.fftSize = 256;

            nodes = bands.map(band => {
                const filter = au_con.createBiquadFilter();
                filter.type = band.type;
                filter.frequency.value = band.freq;
                filter.gain.value = 0;
                return filter;
            });

            let lastNode = source;
            nodes.forEach(node => {
                lastNode.connect(node);
                lastNode = node;
            });
            lastNode.connect(analyser);
            analyser.connect(au_con.destination);
        } catch (e) {
            throw_error(e.message);
        }
    }
}

function clean() {
    if (au_con) {
        au_con.close();
        au_con = null;
        analyser = null;
        source = null;
        nodes = [];
    }
}

function eq_apply(presetName) {
    const gains = presets[presetName];
    bands.forEach((band, i) => {
        nodes[i].gain.value = gains[i];
        document.getElementById(`eq-${band.freq}`).value = gains[i];
    });
}

function eq_init() {
    bands.forEach(band => {
        const slider = document.getElementById(`eq-${band.freq}`);
        slider.addEventListener('input', () => {
            const index = bands.findIndex(b => b.freq === band.freq);
            nodes[index].gain.value = parseFloat(slider.value);
            document.getElementById('eq-preset').value = 'custom';
            stat_up(`EQ ${band.freq}Hz: ${slider.value}dB`);
        });
    });
}

function getAnalyser() {
    return analyser;
}