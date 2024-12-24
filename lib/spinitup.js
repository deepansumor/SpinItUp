/**
 * SpinItUp: A customizable Spin-the-Wheel class.
 * Author: Deepansu Mor (https://github.com/deepansumor)
 */

export default class SpinItUp {
    /**
     * Initializes the SpinItUp instance with the provided element and options.
     * @param {HTMLElement} elem - The HTML element representing the wheel.
     * @param {Object} [options={}] - Configuration options for the spin.
     * @throws {Error} - If the provided element is not a valid HTMLElement.
     */
    constructor(elem, options = {}) {
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
            spins: 2, // Number of full rotations
            easing: 'linear', // Animation easing
            callback: (type, data) => console.log(type, data), // Default callback function
            segments: Array.from({ length: 6 }, (_, i) => ({ segment: i + 1 })), // Default segments
            stopAt: null, // Winning segment index or function returning the stop segment
            direction: 'clockwise', // Spin direction
            rotate: 0,
            ...options,
        };

        if (!this.options.segments[this.options.stopAt - 1]) {
            throw new Error(`stopAt must be a valid Number within the segments array 1 - ${this.options.segments.length}`);
        }

        this.directions = ['clockwise', 'anti-clockwise'];

        this.options.duration = this.options.duration;
        this.state = this.states.STOPPED;
        this.style();

        this.options.rotate = +this.options.rotate || 0;
        this.elem.style.transform = `rotate(${this.options.rotate}deg)`;
    }

    /**
     * Updates the stop angle for the winning segment.
     */
    updateStopAngle() {
        const slice = 360 / this.options.segments.length;
        this.stopAngle = this.minMax(
            this.options.stopAt * slice - slice + 10,
            this.options.stopAt * slice - 10
        );
    }

    /**
     * Generates a random number between the given minimum and maximum values.
     * @param {number} min - The minimum value.
     * @param {number} max - The maximum value.
     * @returns {number} - A random number within the range.
     */
    minMax(min, max) {
        return Math.floor(Math.random() * (max - min + 1) + min);
    }

    /**
     * Generates the CSS keyframe animation for the spinning effect.
     */
    style() {
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

        this.spinAnimationKey = `spin-${Math.random().toString(36).substring(7)}`;
        const style = document.createElement('style');
        style.innerHTML = `
            @keyframes ${this.spinAnimationKey} {
                100% { transform: rotate(${deg}deg); }
            }
        `;
        document.head.appendChild(style);
    }

    /**
     * Starts the spinning process.
     * @returns {void}
     */
    async start() {
        if (this.state !== this.states.STOPPED) {
            return this.callback(this.state, { message: 'Wheel is already spinning' });
        }
        this.state = this.states.SPINNING;
        this.#spin();
    }

    /**
     * Internal method to handle the spinning animation.
     * @private
     */
    #spin() {
        this.style();
        this.callback(this.state);
        this.elem.style.animation = `${this.spinAnimationKey} ${this.options.duration}ms ${this.options.easing} 1 forwards`;
        setTimeout(() => this.stop(), this.options.duration);
    }

    /**
     * Stops the spinning and determines the winning segment.
     * @returns {void}
     */
    stop() {
        if (this.state !== this.states.SPINNING) {
            return this.callback(this.state, { message: 'Cannot stop; wheel is not spinning' });
        }
        this.state = this.states.FINISHED;
        this.callback(this.state, { segment: this.getWinningSegment() });
    }

    /**
     * Resets the spin wheel to its initial state.
     * @returns {void}
     */
    reset() {
        this.state = this.states.STOPPED;
        this.elem.style.animation = 'none';
        this.callback(this.state);
    }

    /**
     * Retrieves the winning segment based on the stop angle.
     * @returns {Object} - The winning segment.
     */
    getWinningSegment() {
        return this.options.segments[this.options.stopAt - 1];
    }

    /**
     * Executes the callback function with the provided type and data.
     * @param {string} type - The type of the event (e.g., spinning, stopped).
     * @param {Object} [data={}] - Additional data to pass to the callback.
     */
    callback(type, data = {}) {
        if (typeof this.options.callback === 'function') {
            this.options.callback(type, { ...data, timestamp: Date.now() });
        }
    }
}