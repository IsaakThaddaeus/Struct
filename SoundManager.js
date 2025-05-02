export class SoundManager {
    constructor() {
        this.context = new (window.AudioContext || window.webkitAudioContext)();
        this.buffers = {};

        this.loadSound('pop', 'Sounds/Pop.mp3');
        this.loadSound('select', 'Sounds/Select.mp3');
        this.loadSound('pause', 'Sounds/Pause.mp3');
        this.loadSound('play', 'Sounds/Play.mp3');
        this.loadSound('spring', 'Sounds/Spring.mp3');
        this.loadSound('springBackwards', 'Sounds/SpringBackwards.mp3');
    }

    async loadSound(name, url) {
        const response = await fetch(url);
        const arrayBuffer = await response.arrayBuffer();
        this.buffers[name] = await this.context.decodeAudioData(arrayBuffer);
    }

    play(name, volume = 1.0) {
        const buffer = this.buffers[name];
        if (!buffer) return;

        const source = this.context.createBufferSource();
        source.buffer = buffer;

        const gainNode = this.context.createGain();
        gainNode.gain.value = volume;

        source.connect(gainNode).connect(this.context.destination);
        source.start(0);
    }

    playPop() {
        this.play('pop');
    }

    playSelect() {
        this.play('select');
    }

    playPause() {
        this.play('pause');
    }

    playPlay() {
        this.play('play');
    }

    playSpring() {
        this.play('spring');
    }
    
    playSpringBackwards() {
        this.play('springBackwards');
    }
}
