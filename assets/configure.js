
// Listener and Emitter for Parent
const Emitter = (() => {
    const listeners = {};

    const addListener = (event, callback) => {
        if (!listeners[event]) {
            listeners[event] = [];
        }
        listeners[event].push(callback);
    };

    const emit = (event, data) => {
        const iframe = document.querySelector('iframe');
        if (iframe && iframe.contentWindow) {
            iframe.contentWindow.postMessage({ event, data }, '*');
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

Emitter.addListener("loaded", function (data = {}) {
    data.type == "preview" && Emitter.emit("css", {
        href: (new URL("assets/wheel.css", location.origin)).href
    });
});

function getTimeZoneName() {
    return Intl.DateTimeFormat('en-US', { timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone }).resolvedOptions().timeZone;
}


const lightColors = [
    "#FFB3B3", // Light Red
    "#FFD9B3", // Light Orange
    "#FFFFB3", // Light Yellow
    "#D9FFB3", // Light Lime Green
    "#B3FFD9", // Light Mint Green
    "#B3FFFF", // Light Cyan
    "#B3D9FF", // Light Sky Blue
    "#D9B3FF", // Light Purple
    "#FFB3FF", // Light Pink
    "#FFCCCC", // Pale Red
    "#FFE6CC", // Pale Peach
    "#FFFFE6", // Pale Lemon
    "#E6FFCC", // Pale Green
    "#CCE6FF", // Pale Blue
    "#E6CCFF"  // Pale Lavender
];

// Function to get non-repeating random colors
function createNonRepeatingColorPicker(colors) {
    const availableColors = [...colors]; // Copy the array to preserve the original
    return function getRandomColor() {
        if (availableColors.length === 0) {
            throw new Error("No more colors available!");
        }
        const randomIndex = Math.floor(Math.random() * availableColors.length);
        return availableColors.splice(randomIndex, 1)[0];
    };
}

function formDataToJSON(formData) {
    const result = {};

    for (const [key, value] of formData.entries()) {
        const keys = key.split(/\[|\]\.|\.|\]/).filter(Boolean);
        let current = result;

        for (let i = 0; i < keys.length; i++) {
            const k = keys[i];
            if (i === keys.length - 1) {
                current[k] = value;
            } else {
                current[k] = current[k] || {};
                current = current[k];
            }
        }
    }

    return result;
}

document.getElementById('configurationForm').addEventListener('change', (e) => {
    if (e.target.classList.contains('is-invalid')) {
        e.target.classList.remove('is-invalid');
    }
});

document.getElementById('segmentConfigForm').addEventListener('change', (e) => {
    if (e.target.classList.contains('is-invalid')) {
        e.target.classList.remove('is-invalid');
    }
});

function addMonthsToCurrentDate(months) {
    const currentDate = new Date();
    currentDate.setMonth(currentDate.getMonth() + months);

    const year = currentDate.getFullYear();
    const month = String(currentDate.getMonth() + 1).padStart(2, '0');
    const day = String(currentDate.getDate()).padStart(2, '0');

    const hours = String(currentDate.getHours()).padStart(2, '0');
    const minutes = String(currentDate.getMinutes()).padStart(2, '0');
    const seconds = String(currentDate.getSeconds()).padStart(2, '0');

    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}

function validateConfig(config) {
    const form = document.getElementById('configurationForm');
    let isValid = true;

    // Required number fields
    ['spins', 'duration', "slices"].forEach(field => {
        const element = form.querySelector(`[name="${field}"]`);
        isValid &= validateField(element, !isNaN(Number(config[field])) && config[field] > 0);
    });

    // Pin position and offsets
    const pinPosition = form.querySelector('[name="pin[position]"]');
    isValid &= validateField(pinPosition, config.pin?.position);

    ['--pin-offset-x', '--pin-offset-y'].forEach(offset => {
        const element = form.querySelector(`[name="pin[offsets][${offset}]"]`);
        isValid &= validateField(element, config.pin?.offsets?.[offset]);
        if (config.pin.offsets[offset]) {
            config.pin.offsets[offset] = `${config.pin.offsets[offset]}%`;
        }
    });

    // Rewards snippet
    ['rewards_snippet[attempt]', 'rewards_snippet[unit]'].forEach(field => {
        const element = form.querySelector(`[name="${field}"]`);
        isValid &= validateField(element, element.value);
    });

    if (!isValid) throw new Error("Please fill all required fields correctly.");

    return {
        spins: Number(config.spins),
        duration: Number(config.duration) * 1000,
        direction: config.direction || 'clockwise',
        start_date: addMonthsToCurrentDate(0),
        end_date: addMonthsToCurrentDate(120),
        slices: Number(config.slices),
        pin: {
            position: config.pin.position.toLowerCase(),
            offsets: config.pin.offsets
        }
    };
}

let SpinTheWheelConfig;
let SpinTheWheelSegments = [];
document.getElementById("configurationForm").addEventListener("submit", async function (event) {
    event.preventDefault();
    try {
        const formData = new FormData(this);
        const baseConfig = formDataToJSON(formData);
        const validatedSettings = validateConfig(baseConfig);

        const files = this.querySelectorAll("input[type='file']");
        const blobs = await Promise.all([...files].map(file => inputFileToBlob(file)));

        const fileConfig = [...files].reduce((acc, file, index) => {
            if (blobs[index]) acc[file.name] = blobs[index];
            return acc;
        }, {});

        const hasInvalidFields = [...this.querySelectorAll('.is-invalid')].length > 0;
        if (hasInvalidFields) return alert("Please fill all required fields correctly.");


        SpinTheWheelSegments = setSegments(validatedSettings.slices);

        const config = {
            theme: {
                ...fileConfig,
                '--background-color': baseConfig['--background-color'] || '#000000'
            },
            segments: SpinTheWheelSegments,
            settings: validatedSettings,
            rewards_snippet: {
                override_default_settings: true,
                frequency: 1,
                attempt: baseConfig.rewards_snippet.attempt,
                unit: baseConfig.rewards_snippet.unit
            }
        };


        SpinTheWheelConfig = config;
        updateSegmentForm(0);
        this.classList.add('hidden');
        this.nextElementSibling.classList.remove('hidden');
        Emitter.emit("configure", config);
    } catch (error) {
        console.error("Configuration Error:", error.message);
        alert(error.message);
    }
});

function validateField(element, condition) {
    if (!condition) {
        element.classList.add('is-invalid');
        return false;
    }
    element.classList.remove('is-invalid');
    return true;
}

function inputFileToBlob(inputElement) {
    return new Promise((resolve, reject) => {
        if (!inputElement || inputElement.tagName !== "INPUT" || inputElement.type !== "file") {
            return reject(new Error("Invalid input element. Expected an input of type 'file'."));
        }

        const file = inputElement.files[0];
        if (!file) {
            inputElement.classList.add('is-invalid');
            return resolve(null);
        }

        const blobURL = URL.createObjectURL(file);
        resolve(blobURL);
    });
}
document.querySelector('[name="reward_type"]').addEventListener('change', function (e) {
    const rewardValue = document.querySelector('[name="reward_value"]');
    rewardValue.classList.remove('is-invalid');
    rewardValue.value = "";

    if (e.target.value === "offers") {
        // disable readonly attribute and invalid class
        rewardValue.removeAttribute('disabled');
    } else {
        rewardValue.setAttribute('disabled', "disabled");
    }
});
function updateSegegmentData(segmentIndex, data) {
    SpinTheWheelSegments[segmentIndex] = { ...SpinTheWheelSegments[segmentIndex], ...data };
    return true
}

function updateSegmentForm(segmentIndex) {
    const segmentForm = document.getElementById('segmentConfigForm');
    let currentIndex = Number(segmentForm.getAttribute('data-index'));

    let isValid = true;
    // validate current form
    const formElements = segmentForm.querySelectorAll('input, select');


    formElements.forEach(element => {
        if (!element.checkValidity()) {
            element.classList.add('is-invalid');
            isValid = false;
        } else {
            element.classList.remove('is-invalid');
        }
    });

    const rewardType = segmentForm.querySelector('[name="reward_type"]');
    const rewardValue = segmentForm.querySelector('[name="reward_value"]');
    if (rewardType.value === "offers" && (!rewardValue.value || rewardValue.value === "0")) {
        rewardValue.classList.add('is-invalid');
        isValid = false;
    } else {
        rewardValue.classList.remove('is-invalid');
        isValid = true;
    }

    if (!isValid) return false;

    const data = formDataToJSON(new FormData(segmentForm));


    let segment = SpinTheWheelSegments[segmentIndex];
    if (!segment) return updateSegegmentData(currentIndex, data);;

    Object.keys(segment).forEach(key => {
        const input = segmentForm.querySelector(`[name="${key}"]`);
        if (input) {
            input.value = segment[key];
            input.classList.remove('is-invalid');
        };
        // remove invalid class

    });
    // trigger change event to update the form
    rewardType.dispatchEvent(new Event('change'));
    rewardValue.removeAttribute('disabled');
    rewardValue.value = segment.reward_value || 0;
    segmentForm.setAttribute('data-index', segmentIndex);

    // enable disable next and previous buttons
    const previousButton = document.getElementById('previousSegment');
    const nextButton = document.getElementById('nextSegment');
    previousButton.disabled = segmentIndex === 0;

    if (segmentIndex === SpinTheWheelSegments.length - 1) {
        nextButton.innerHTML = "Finish";
    }

    Emitter.emit("select:segment", segmentIndex);

    updateSegegmentData(currentIndex, data);

    return true;
}

document.getElementById('previousSegment').addEventListener('click', function () {
    const segmentForm = document.getElementById('segmentConfigForm');
    const index = Number(segmentForm.getAttribute('data-index'));
    document.getElementById('nextSegment').innerHTML = "Next Prize &#187;";
    if (index === 0) return;
    updateSegmentForm(index - 1);
});

document.getElementById('backToSettings').addEventListener('click', function () {
    if (!confirm("Moving back to settings will discard all changes, if made to the Prizes. Do you want to continue?")) return;
    document.getElementById('configurationForm').classList.remove('hidden');
    document.getElementById('segmentConfigForm').classList.add('hidden');
});

document.getElementById('nextSegment').addEventListener('click', function () {
    const segmentForm = document.getElementById('segmentConfigForm');
    const index = Number(segmentForm.getAttribute('data-index'));
    this.innerHTML = "Next Prize &#187;";
    if (index === SpinTheWheelSegments.length - 1) {
        this.innerHTML = "Finish";
        if (!updateSegmentForm(index + 1)) return;
        this.innerHTML = "Finishing...";
        // this name has to be plural 
        SpinTheWheelConfig.segment = SpinTheWheelSegments;
        return SaveConfig();
    };
    updateSegmentForm(index + 1);
});


function SaveConfig() {
    const config = SpinTheWheelConfig;
    delete config.segments;

    config.segment = SpinTheWheelSegments.map(segment => {
        delete segment.borderColor;
        return segment;
    });

    console.log("Final Config", config);
}

function setSegments(count) {
    const getRandomColor = createNonRepeatingColorPicker(lightColors);
    const segments = Array.from({ length: count }, (_, index) => {
        return {
            text: `Prize ${index + 1}`,
            borderColor: getRandomColor(),
            max_number_of_win: 100,
            reward_value: 0,
            reward_type: "offers",
            winning_message: "Congratulations! You have won a reward",
            index,
        };
    });
    return segments;
}

function updateFileName(input, selector) {
    const display = document.querySelector(selector);
    const preview = input.parentElement.parentElement.querySelector('.image-preview');

    if (input.files && input.files[0]) {
        display.textContent = input.files[0].name;

        const reader = new FileReader();
        reader.onload = function (e) {
            preview.src = e.target.result;
            preview.style.display = 'block';
        }
        reader.readAsDataURL(input.files[0]);
    }
}

window.updateFileName = updateFileName;