import SpinItUp from "../lib/spinitup.js";

// Listener and Emitter for Iframe
const Emitter = (() => {
    const listeners = {};

    const addListener = (event, callback) => {
        if (!listeners[event]) {
            listeners[event] = [];
        }
        listeners[event].push(callback);
    };

    const emit = (event, data) => {
        if (window.parent) {
            window.parent.postMessage({ event, data }, '*');
        }
    };

    const handleMessage = (event) => {
        if (event.source !== window && event.data && event.data.event) {
            const callbacks = listeners[event.data.event] || [];
            callbacks.forEach((callback) => callback(event.data.data));
        }
    };

    window.addEventListener('message', handleMessage);

    return { addListener, emit };
})();

let wheelInstance;
const wheel = document.querySelector("#wheel");
const header = document.querySelector(".wheel-section__header-img");
const spinButton = document.querySelector(".wheel-section__spin-btn");
const pin = document.querySelector(".wheel-section__pin-img");
const center = document.querySelector(".wheel-section__center-img");

Emitter.addListener("configure", async function (data) {
    console.log(`configure recieved`, data);
    await updateLayout(data)
    wheelInstance = createWheel(data);
});

Emitter.addListener("select:segment", function (data) {
    console.log(`select:segment recieved`, data);
    (wheelInstance && wheelInstance.selectSlice) && wheelInstance.selectSlice(data)
});

const minMax = (min, max) => {
    return Math.floor(Math.random() * (max - min + 1) + min);
}
function createWheel({ settings: config, segments }) {
    if (!Object.keys(config).length) return;
    config.mode = "edit";
    config.callback = console.log
    config.stopAt = minMax(1, segments.length);
    const spinContainer = document.querySelector(".spin-it-up-container");
    if (spinContainer) {
        spinContainer.replaceWith(wheel)
    };
    return new SpinItUp(document.querySelector("#wheel"), config);
}


async function updateLayout({ theme }) {
    let { ["header-image"]: headerImage, ["spin-image"]: spinImage, ["wheel-image"]: wheelImage, ["pin-image"]: pinImage , ["center-image"] : centerImage } = theme;
    header.style.display = "none";
    spinButton.style.display = "none";
    pin.style.display = "none";
    wheel.style.display = "none";
    center.style.display = "none";

    // Update the header image if available
    if (headerImage) {
        header.style.display = "block";
        header.src = headerImage;
    }

    // Update the spin button image if available
    if (spinImage) {
        spinButton.style.display = "inline";
        spinButton.src = spinImage;
    }

    // Update the pin image if available
    if (pinImage) {
        pin.style.display = "block";
        pin.src = pinImage;
    }

    if(centerImage) {
        center.style.display = "block";
        center.src = centerImage;
    }

    Object.keys(theme).forEach(key => {
        key = String(key);
        if (key.startsWith("--")) {
            if (key.includes("image")) {
                document.body.style.setProperty(key , `url(${theme[key]})`);
            } else {
                document.body.style.setProperty(key, theme[key]);
            }
        }
    })

    // Wait for the wheel image to load before displaying
    if (wheelImage) {
        let imageSrc = await loadImage(wheelImage);
        wheel.src = imageSrc;
        wheel.style.display = "block"; // Once the image is loaded, display the wheel
    }
}

// Helper function to load the image and return a Promise
function loadImage(imageSrc) {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.src = imageSrc;

        // Resolve the promise when the image is loaded
        img.onload = () => resolve(imageSrc);

        // Reject the promise if the image fails to load
        img.onerror = () => reject(new Error('Image failed to load'));
    });
}


Emitter.addListener("css", function (data) {
    console.log(`css recieved`, data);
    let link = document.createElement("link");
    Object.keys(data).forEach(key => (link[key] = (data)[key]));
    link.rel = "stylesheet"
    document.head.appendChild(link);
    link.onload = () => (document.body.style.opacity = 1)
});


document.querySelector("#spin").addEventListener("click", function () {
    // wheelInstance.reset()
    wheelInstance.start();
})

// End of file
Emitter.emit('loaded', { type: "preview" });