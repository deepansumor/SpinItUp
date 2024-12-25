import SpinItUp from "../lib/spinitup.js";

const wheel = new SpinItUp(document.getElementById('wheel'), {
    spins: 15,
    duration: 10000,
    easing: 'ease-in-out',
    direction: 'clockwise',
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

    // setTimeout(() => {
    //     wheel.stop();
    // }, 1000);
}, 2000);
window.wheel = wheel;