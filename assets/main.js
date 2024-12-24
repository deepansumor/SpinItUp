import SpinItUp from "../lib/spinitup.js";

const wheel = new SpinItUp(document.getElementById('wheel'), {
    spins: 5,
    duration: 3000,
    easing: 'ease-in-out',
    direction: 'clockwise',
    rotate: 360 / 12,
    segments: [
        { backgroundColor: 'red', color: 'black', fontSize: '16px' },
        { backgroundColor: 'teal', color: 'white', fontSize: '16px' },
        { backgroundColor: 'violet', color: 'black', fontSize: '16px' },
        { backgroundColor: 'magenta', color: 'yellow', fontSize: '16px' },
        { backgroundColor: 'turquoise', color: 'black', fontSize: '16px' },
        { backgroundColor: 'chartreuse', color: 'blue', fontSize: '16px' }
    ],
    callback: (state, data) => {
        console.log(`State: ${state}`, data);
    },
});

setTimeout(() => {
    wheel.options.stopAt = 5;
    wheel.start();
}, 2000);
window.wheel = wheel;