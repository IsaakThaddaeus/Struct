export class SoundManager {
    static play(src, volume = 1.0) {
        const audio = new Audio(src);
        audio.volume = volume;
        audio.play();
    }
}
