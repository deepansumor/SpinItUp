import Slice from "./slice.js";
import Wheel from "./wheel.js";

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
        console.log('Initializing SpinItUp instance with element:', elem, 'and options:', options);

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
        };

        // Default options and user-provided overrides
        this.options = {
            spins: 2,
            easing: 'linear',
            callback: (type, data) => console.log(type, data),
            segments: Array.from({ length: 6 }, (_, i) => ({ segment: i + 1 })),
            stopAt: null,
            direction: 'clockwise',
            pin: {},
            rotate: 0,
            ...options,
            mode: this.elem instanceof HTMLImageElement ? "image" : "draw",
        };

        this.directions = ['clockwise', 'anti-clockwise'];
        this.key = `spin-it-up-${Math.random().toString(36).substring(7)}`;
        console.log('Generated unique key for instance:', this.key);

        this.elem.style.overflow = 'hidden';
        this.options.rotate = 0;
        this.state = this.states.STOPPED;

        ((async () => {
            await this.draw();
            console.log('SpinItUp instance initialized.');
        })());
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
     * Draws the wheel based on the mode (image or canvas).
     */
    async draw() {
        console.log('Drawing wheel in mode:', this.options.mode);
        if (this.options.mode === "image") {
            await this.drawImageBackground();
        } else {
            this.drawCanvas();
        }
    }

    /**
     * Draws the wheel using an image background.
     */
    async drawImageBackground() {
        console.log('Drawing wheel using image background.');
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

        console.log(this.canvas);
    }

    /**
     * Draws the wheel using a canvas element.
     */
    drawCanvas() {
        console.log('Drawing wheel using canvas.');
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

        console.log(this.canvas);
    }

    /**
     * Resets the wheel to its initial state and visuals.
     */
    reset() {
        console.log('Resetting spin state and visuals.');
        this.state = this.states.STOPPED;
        if (this.options.mode === "image") {
            const image = new Image();
            image.src = this.elem.src;
            this.elem.parentElement.replaceChild(image, this.elem);
            this.elem = image;
        } else {
            this.elem.style.animation = 'none';
        }
        this.callback(this.state);
    }

    /**
     * Updates the stop angle based on the segment count and target segment.
     */
    updateStopAngle() {
        const slice = 360 / this.options.segments.length;
        this.stopAngle = this.minMax(
            this.options.stopAt * slice - slice + 10,
            this.options.stopAt * slice - 10
        );
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
        console.log('Generating CSS keyframe animation.');
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
        if (this.state !== this.states.STOPPED) {
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
        this.canvas.style.animation = `${this.getClassName('animation-rotate')} ${this.options.duration}ms ${this.options.easing} 1 forwards`;
        setTimeout(() => this.stop(), this.options.duration);
    }

    /**
     * Stops the spinning of the wheel and determines the winning segment.
     */
    stop() {
        if (this.state !== this.states.SPINNING) {
            return this.callback(this.state, { message: 'Cannot stop; wheel is not spinning' });
        }
        this.state = this.states.FINISHED;
        this.callback(this.state, { segment: this.getWinningSegment() });
    }

    /**
     * Retrieves the winning segment based on the stop position.
     * @returns {Object} - The winning segment.
     */
    getWinningSegment() {
        let index = this.options.stopAt - 1;
        return this.options.segments[index];
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
