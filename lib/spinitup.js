import Slice from "./slice.js";
import Wheel from "./wheel.js";

// Define pin positions with their corresponding rotation angles in degrees
const pinPositions = {
    top: 90,
    right: 0,
    bottom: -90,
    left: 180,
};

/**
 * SpinItUp: A customizable Spin-the-Wheel class.
 * Author: Deepansu Mor (https://github.com/deepansumor)
 */

// Main SpinItUp class
export default class SpinItUp {
    /**
     * Constructor for initializing the SpinItUp class.
     * @param {HTMLElement} elem - The HTML element representing the wheel.
     * @param {Object} options - Configuration options for the wheel.
     */
    constructor(elem, options = {}) {
        SpinItUp.log('Initializing SpinItUp instance with element:', elem, 'and options:', options);

        if (!(elem instanceof HTMLElement)) {
            throw new Error('Element is not a valid HTMLElement');
        }

        this.elem = elem;

        // Define possible states
        this.states = {
            SPINNING: 'spinning',
            STOPPED: 'stopped',
            FINISHED: 'finished',
            ERROR: 'error',
            INITIALIZED:"init"
        };

        // Default options and user-provided overrides
        this.options = {
            spins: 2,
            easing: 'linear',
            callback: (type, data) => SpinItUp.log(type, data),
            segments: Array.from({ length: 6 }, (_, i) => ({ segment: i + 1 })),
            stopAt: null,
            direction: 'clockwise',
            rotate: 0,
            pin: {
                position: "top",
            },
            mode: "view",
            ...options,
            type: this.elem instanceof HTMLImageElement ? "image" : "draw",
        };

        this.options.pin.offsets = options.pin.offsets || {
            "--pin-offset-x": "0%",
            "--pin-offset-y": "25%"
        };

        this.directions = ['clockwise', 'anti-clockwise'];
        this.key = `spin-it-up-${Math.random().toString(36).substring(7)}`;
        SpinItUp.log('Generated unique key for instance:', this.key);

        this.pinOffset = pinPositions[this.options.pin.position] != undefined ? pinPositions[this.options.pin.position] : pinPositions.top;
        SpinItUp.log(this.pinOffset);


        this.elem.style.overflow = 'hidden';
        this.options.rotate = 0;
        this.state = this.states.STOPPED;

        ((async () => {
            await this.draw();
            SpinItUp.log('SpinItUp instance initialized.');
            this.callback(this.states.INITIALIZED,{})
        })());

    }

    static log() {
        this.ENABLE_LOG = typeof ENABLE_LOG == "undefined" || ENABLE_LOG;
        this.ENABLE_LOG && console.log("[SPIN-IT-UP]", ...arguments);
    }
    /**
     * Generates a unique class name based on the instance key.
     * @param {string} name - The base name for the class.
     * @returns {string} - The generated class name.
     */
    getClassName(name) {
        return `${this.key}-${name}`;
    }

    /**
     * Draws the wheel based on the type (image or canvas).
     */
    async draw() {
        SpinItUp.log('Drawing wheel in type:', this.options.type);
        if (this.options.type === "image") {
            await this.drawImageBackground();
        } else {
            this.drawCanvas();
        }
    }

    /**
     * Draws the wheel using an image background.
     */
    async drawImageBackground() {
        SpinItUp.log('Drawing wheel using image background.');
        const image = new Image();
        image.src = this.elem.src;

        await new Promise((resolve, reject) => {
            image.onload = resolve;
            image.onerror = reject;
        });

        const canvasWheel = new Wheel(this.elem, this.options);
        const slices = Slice.create(this.options.segments);

        /**
         * Redraws the slices with the selected slice highlighted.
         * @param {number} selectedSliceIndex - The index of the selected slice.
         */
        const drawAllSlices = async (selectedSliceIndex) => {
            await canvasWheel.drawImage(image); // Redraw image
            canvasWheel.drawSlices(slices, selectedSliceIndex);
        };

        // Add event listener for clicks
        canvasWheel.addClickListener(slices, drawAllSlices);

        drawAllSlices();

        this.canvas = canvasWheel.canvas;

        SpinItUp.log(this.canvas);

        if (this.options.mode == "edit") {
            this.selectSlice = (index) => canvasWheel.selectSlice(index, drawAllSlices);
            this.updateSlice = (index,data) => {
                this.options.segments[index] = data;
                slices[index].segment = data;
                slices[index].draw(canvasWheel.context,canvasWheel.size,false);
            };
            this.selectSlice(0);
        };
    }

    /**
     * Draws the wheel using a canvas element.
     */
    drawCanvas() {
        SpinItUp.log('Drawing wheel using canvas.');
        const canvasWheel = new Wheel(this.elem, this.options);
        const slices = Slice.create(this.options.segments);

        /**
         * Redraws the slices with the selected slice highlighted.
         * @param {number} selectedSliceIndex - The index of the selected slice.
         */
        const drawAllSlices = (selectedSliceIndex) => canvasWheel.drawSlices(slices, selectedSliceIndex);
        canvasWheel.addClickListener(slices, drawAllSlices);
        drawAllSlices();

        this.canvas = canvasWheel.canvas;

        SpinItUp.log(this.canvas);

        if (this.options.mode == "edit") {
            this.selectSlice = (index) => canvasWheel.selectSlice(index, drawAllSlices);
            this.updateSlice = (index,data) => {
                this.options.segments[index] = data;
                slices[index].draw(canvasWheel.context,canvasWheel.size,false,data)
            };
            this.selectSlice(0);
        };
    }

    /**
     * Updates the stop angle based on the segment count and target segment.
     */
    updateStopAngle() {
        const slice = 360 / this.options.segments.length;
        this.stopAngle = this.minMax(
            this.options.stopAt * slice - slice + slice * 0.25,
            this.options.stopAt * slice - slice * 0.25
        ) + this.pinOffset;
        SpinItUp.log(`stopAngle`, this.stopAngle);
    }

    /**
     * Generates a random number within a given range.
     * @param {number} min - The minimum value.
     * @param {number} max - The maximum value.
     * @returns {number} - The generated random number.
     */
    minMax(min, max) {
        return Math.floor(Math.random() * (max - min + 1) + min);
    }

    /**
     * Creates the CSS animation for spinning the wheel.
     */
    style() {
        SpinItUp.log('Generating CSS keyframe animation.');
        this.updateStopAngle();

        let deg = 360 * this.options.spins;
        if (!this.directions.includes(this.options.direction)) {
            this.options.direction = 'clockwise';
        }

        if (this.options.direction === "random") {
            const randomIndex = Math.floor(Math.random() * this.directions.length);
            this.options.direction = this.directions[randomIndex];
        }

        if (this.options.direction === "clockwise") {
            deg = deg + (360 - this.stopAngle);
        } else if (this.options.direction === "anti-clockwise") {
            deg = -(deg + this.stopAngle);
        }

        this.options.speed = deg / this.options.duration;

        const style = document.createElement('style');
        style.innerHTML = `@keyframes ${this.getClassName('animation-rotate')} { 100% { transform: rotate(${deg}deg); } }`;
        document.head.appendChild(style);
    }

    /**
     * Starts the spinning of the wheel.
     */
    async start() {
        if (!this.options.segments[this.options.stopAt - 1]) {
            throw new Error(`stopAt must be a valid Number within the segments array 1 - ${this.options.segments.length}`);
        }
        if (this.state != this.states.STOPPED && this.state != this.states.FINISHED) {
            return this.callback(this.state, { message: 'Wheel is already spinning' });
        }
        this.state = this.states.SPINNING;
        this.#spin();
    }

    /**
     * Executes the spinning logic with animations.
     * @private
     */
    #spin() {
        this.style();
        this.callback(this.state);
        this.canvas.style.animation = "none";
        // a delay
        setTimeout(() => {
            this.canvas.style.animation = `${this.getClassName('animation-rotate')} ${this.options.duration}ms ${this.options.easing} 1 forwards`;
            this.timeout = setTimeout(() => this.stop(), this.options.duration);
            this.options._mode = this.options.mode;
            this.options.mode = null;
        }, 0);
    }

    /**
     * Stops the spinning of the wheel and determines the winning segment.
     */
    stop() {
        if (this.state !== this.states.SPINNING && this.state !== this.states.FINISHED) {
            return this.callback(this.state, { message: 'Cannot stop; wheel is not spinning' });
        }
        this.state = this.states.FINISHED;
        this.callback(this.state, { ...this.getWinningSegment() });
        clearTimeout(this.timeout);
        this.options.mode = this.options._mode;
        this.canvas.style.animation = "none";
    }

    reset() {
        this.canvas.style.animation = "none";
        this.stop();
    }

    /**
     * Retrieves the winning segment based on the stop position.
     * @returns {Object} - The winning segment.
     */
    getWinningSegment() {
        let index = this.options.stopAt - 1;
        return { index, segment: this.options.segments[index] };
    }

    /**
     * Executes the callback function with the specified type and data.
     * @param {string} type - The type of event (e.g., state change).
     * @param {Object} data - Additional data to pass to the callback.
     */
    callback(type, data = {}) {
        if (typeof this.options.callback === 'function') {
            this.options.callback(type, { ...data, timestamp: Date.now() });
        }
    }
}
