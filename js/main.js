// Main Application Entry Point

window.addEventListener('DOMContentLoaded', () => {
    const game = new Game();
    window.gameInstance = game;

    // Start rendering loop
    requestAnimationFrame(t => game.loop(t));

    // Show Character Selection
    game.start();

    // User gesture to allow Web Audio API on first click
    const unlockAudio = () => {
        if (window.soundFx) {
            window.soundFx.init();
        }
        window.removeEventListener('click', unlockAudio);
        window.removeEventListener('keydown', unlockAudio);
    };
    window.addEventListener('click', unlockAudio);
    window.addEventListener('keydown', unlockAudio);
});
