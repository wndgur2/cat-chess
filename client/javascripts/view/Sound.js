export default class Sound {
    static muted = true;
    static taps = [];
    static playClick() {
        if (Sound.muted) return;
        const randIdx = Math.floor(Math.random() * 7);
        Sound.taps[randIdx].play();
    }
    static mute() {
        Sound.muted = !Sound.muted;
    }
}

for (let i = 0; i < 7; i++) {
    Sound.taps.push(new Audio(`/audio/tap/tap${i}.wav`));
    Sound.taps[i].volume = 0.4;
}
