(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory();
	else if(typeof define === 'function' && define.amd)
		define([], factory);
	else if(typeof exports === 'object')
		exports["SpinItUp"] = factory();
	else
		root["SpinItUp"] = factory();
})(typeof self !== 'undefined' ? self : this, () => {
return /******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ "./lib/slice.js":
/*!**********************!*\
  !*** ./lib/slice.js ***!
  \**********************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ Slice)
/* harmony export */ });
/* harmony import */ var _spinitup_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./spinitup.js */ "./lib/spinitup.js");


/**
 * Slice: Represents a single slice of the wheel.
 */
class Slice {
    /**
     * Creates an array of slices based on the segments and wheel size.
     * Each slice corresponds to a segment of the wheel and includes
     * its start and end angles, index, and associated data.
     * 
     * @param {Array} segments - The segments for the wheel. Each segment contains data for the slice.
     * @returns {Array<Slice>} - An array of Slice objects representing the slices of the wheel.
     */
    static create(segments) {
        _spinitup_js__WEBPACK_IMPORTED_MODULE_0__["default"].log('Creating slices with segments:', segments);

        const numberOfSlices = segments.length;
        let currentAngle = 0; // Starting angle for the first slice
        const slices = [];

        segments.forEach((segment, index) => {
            const sliceAngle = (1 / numberOfSlices) * 2 * Math.PI; // Calculate slice angle in radians
            slices.push(new Slice(currentAngle, currentAngle + sliceAngle, index, segment)); // Create a Slice object
            currentAngle += sliceAngle; // Update current angle for the next slice
        });

        return slices;
    }

    /**
     * Determines which slice was clicked on based on the user's click event.
     * This method calculates the angle and distance from the center of the wheel
     * to find the slice corresponding to the clicked position.
     * 
     * @param {MouseEvent} event - The mouse click event.
     * @param {HTMLCanvasElement} canvas - The canvas element representing the wheel.
     * @param {number} size - The size (diameter) of the wheel.
     * @param {Array<Slice>} slices - The array of Slice objects.
     * @returns {number|null} - The index of the clicked slice, or null if no slice was clicked.
     */
    static getClickedSliceIndex(event, canvas, size, slices) {
        _spinitup_js__WEBPACK_IMPORTED_MODULE_0__["default"].log('Determining clicked slice based on event:', event);

        // Get click coordinates relative to the canvas
        const rect = canvas.getBoundingClientRect();
        const x = event.clientX - rect.left - size / 2; // X coordinate relative to center
        const y = event.clientY - rect.top - size / 2; // Y coordinate relative to center
        const distanceFromCenter = Math.sqrt(x * x + y * y); // Distance from the center of the wheel

        // Check if click is outside the wheel
        if (distanceFromCenter > size / 2) {
            _spinitup_js__WEBPACK_IMPORTED_MODULE_0__["default"].log('Click outside the wheel.');
            return null; // Return null if clicked outside the wheel
        }

        // Calculate the angle of the click in radians
        const angle = Math.atan2(y, x);
        const normalizedAngle = angle < 0 ? angle + 2 * Math.PI : angle; // Normalize angle to [0, 2π]

        // Find the slice corresponding to the click angle
        for (const slice of slices) {
            if (
                normalizedAngle >= slice.startAngle &&
                normalizedAngle < slice.endAngle
            ) {
                _spinitup_js__WEBPACK_IMPORTED_MODULE_0__["default"].log(`Clicked slice index: ${slice.index}`);
                return slice.index;
            }
        }

        _spinitup_js__WEBPACK_IMPORTED_MODULE_0__["default"].log('No slice found for the click event.');
        return null;
    }

    /**
     * Constructs a Slice object representing a segment of the wheel.
     * 
     * @param {number} startAngle - The starting angle of the slice in radians.
     * @param {number} endAngle - The ending angle of the slice in radians.
     * @param {number} index - The index of the slice (used to identify it).
     * @param {Object} segment - The data associated with the slice, such as display text and appearance.
     */
    constructor(startAngle, endAngle, index, segment) {
        _spinitup_js__WEBPACK_IMPORTED_MODULE_0__["default"].log('Creating Slice:', {
            startAngle,
            endAngle,
            index,
            segment,
        });

        this.startAngle = startAngle; // Start angle of the slice in radians
        this.endAngle = endAngle; // End angle of the slice in radians
        this.index = index; // Index of the slice
        this.segment = segment; // Data associated with the slice
    }

    textPositions = {
        /**
         * Draws text from left to right.
         */
        'left-to-right': (context, text, x, y, angle) => {
            context.translate(x, y); // Move to the specified position
            context.rotate(angle); // Rotate the canvas for alignment
            context.fillText(text, 0, 0); // Render the text
            context.rotate(-angle); // Reset the rotation
            context.translate(-x, -y); // Reset the position
        },
    
        /**
         * Draws text from right to left (reversed characters).
         */
        'right-to-left': (context, text, x, y, angle) => {
            context.translate(x, y);
            context.rotate(angle);
            context.fillText(text.split("").reverse().join(""), 0, 0); // Reverse the text
            context.rotate(-angle);
            context.translate(-x, -y);
        },
    
        /**
         * Draws text vertically from top to bottom.
         */
        'top-to-bottom': (context, text, x, y) => {
            context.translate(x, y);
            text.split("").forEach((char, i) => {
                context.fillText(char, 0, i * 18); // Draw each character vertically
            });
            context.translate(-x, -y);
        },
    
        /**
         * Draws text vertically from bottom to top (reversed order).
         */
        'bottom-to-top': (context, text, x, y) => {
            context.translate(x, y);
            text.split("").reverse().forEach((char, i) => {
                context.fillText(char, 0, -i * 18); // Reverse and draw vertically
            });
            context.translate(-x, -y);
        },
    
        /**
         * Draws text diagonally from top-left to bottom-right.
         */
        'diagonal-top-left': (context, text, x, y, angle) => {
            context.translate(x, y); // Move to the specified position
            context.rotate(angle - Math.PI / 4); // Adjust angle for diagonal alignment
            context.fillText(text, 0, 0); // Render the text
            context.rotate(-(angle - Math.PI / 4)); // Reset the rotation
            context.translate(-x, -y); // Reset the position
        },
    };
    
    /**
     * Draws the slice on the provided canvas context.
     */
    draw(context, size, isSelected) {
        _spinitup_js__WEBPACK_IMPORTED_MODULE_0__["default"].log('Drawing slice:', {
            index: this.index,
            isSelected,
        });
    
        const {
            backgroundColor = 'transparent',
            color = '#000000',
            fontSize = 20,
            borderColor = 'transparent',
            borderWidth = 2,
            textOffset = 0.7,
            textAlign = 'center',
            textBaseline = 'middle',
            padding = 0,
            text = "",
            textPosition = "left-to-right",
            textAngleOffset = 0
        } = this.segment;
        
        const maxLength = 16; // Maximum text length
        const baseFontSize = 15; // Base font size for 16 characters
        
        // Slice the text to a maximum of maxLength characters
        const actualText = text.slice(0, maxLength);

        _spinitup_js__WEBPACK_IMPORTED_MODULE_0__["default"].log('Drawing slice: actualText', {actualText});
        
        const calculateProportionalFontSize = () => {
            // Calculate the scaling factor based on actualText length
            const scaleFactor = maxLength / Math.max(actualText.length, 1); // Prevent division by zero
            
            // Calculate new font size
            let newFontSize = baseFontSize * scaleFactor;
            
            // Cap the maximum font size at fontSize (provided in props)
            return Math.min(newFontSize, fontSize);
        };
        
        const calculatedFontSize = calculateProportionalFontSize();

        context.beginPath();
        context.moveTo(size / 2, size / 2);
        context.arc(size / 2, size / 2, size / 2, this.startAngle, this.endAngle);
        context.closePath();
    
        context.fillStyle = isSelected ? 'yellow' : backgroundColor;
        context.fill();
    
        if (borderWidth > 0) {
            context.lineWidth = borderWidth;
            context.strokeStyle = borderColor;
            context.stroke();
        }
    
        const textAngle = this.startAngle + (this.endAngle - this.startAngle) / 2;
        const radius = size / 2.5 - padding;
        const textX = size / 2 + radius * Math.cos(textAngle) * textOffset;
        const textY = size / 2 + radius * Math.sin(textAngle) * textOffset;
    
        context.fillStyle = color;
        context.font = `${calculatedFontSize}px Arial`;
        context.textAlign = textAlign;
        context.textBaseline = textBaseline;
    
        if (this.textPositions[textPosition]) {
            this.textPositions[textPosition](context, actualText, textX, textY, textAngle + textAngleOffset);
        } else {
            this.textPositions['left-to-right'](context, actualText, textX, textY, textAngle + textAngleOffset);
        }
    }
    
    
}


/***/ }),

/***/ "./lib/spinitup.js":
/*!*************************!*\
  !*** ./lib/spinitup.js ***!
  \*************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ SpinItUp)
/* harmony export */ });
/* harmony import */ var _slice_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./slice.js */ "./lib/slice.js");
/* harmony import */ var _wheel_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./wheel.js */ "./lib/wheel.js");



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
class SpinItUp {
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
        this.ENABLE_LOG =  false || true;
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

        const canvasWheel = new _wheel_js__WEBPACK_IMPORTED_MODULE_1__["default"](this.elem, this.options);
        const slices = _slice_js__WEBPACK_IMPORTED_MODULE_0__["default"].create(this.options.segments);

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
        const canvasWheel = new _wheel_js__WEBPACK_IMPORTED_MODULE_1__["default"](this.elem, this.options);
        const slices = _slice_js__WEBPACK_IMPORTED_MODULE_0__["default"].create(this.options.segments);

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


/***/ }),

/***/ "./lib/wheel.js":
/*!**********************!*\
  !*** ./lib/wheel.js ***!
  \**********************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ Wheel)
/* harmony export */ });
/* harmony import */ var _slice_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./slice.js */ "./lib/slice.js");
/* harmony import */ var _spinitup_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./spinitup.js */ "./lib/spinitup.js");






// Wheel class to handle canvas-specific logic and manage the wheel's behavior
class Wheel {
    /**
     * Constructs the Wheel instance, initializes the canvas, and sets its properties.
     * 
     * @param {HTMLElement} elem - The DOM element where the wheel will be rendered.
     * @param {Object} options - Configuration options for the wheel, such as rotation and pin placement.
     */
    constructor(elem, options) {
        this.elem = elem; // The element to replace with the wheel
        this.options = options; // Options for customizing the wheel
        this.size = Math.min(elem.offsetWidth, elem.offsetHeight); // Set wheel size to the smaller of the element's width or height

        // Create a canvas for rendering the wheel
        const canvas = document.createElement('canvas');
        canvas.width = canvas.height = this.size; // Set canvas dimensions to the wheel size

        // Create a container to hold the canvas and apply styles
        const container = document.createElement('div');
        container.style.cssText = `width: ${this.size}px; height: ${this.size}px; overflow: hidden;position:relative`;
        container.appendChild(canvas); // Add canvas to the container
        container.className = "spin-it-up-container";
        // Get the 2D rendering context for the canvas
        this.context = canvas.getContext('2d');

        // Replace the original element with the canvas container
        elem.parentElement.replaceChild(container, elem);
        this.elem = this.canvas = canvas; // Update the element reference to the canvas

        // Set the wheel shape to a circle
        this.elem.style.borderRadius = '50%';


        // Optionally, set the pin position
        this.setPin();
    }

    //  get edge of canvas to place pin
    getCircleEdge(position) {
        const rect = this.canvas.getBoundingClientRect(); // Get the bounding box of the element
        const centerX = rect.left + rect.width / 2; // Calculate the center X of the circle
        const centerY = rect.top + rect.height / 2; // Calculate the center Y of the circle

        switch (position) {
            case 'left':
                return { x: rect.left, y: centerY }; // Left edge
            case 'right':
                return { x: rect.right, y: centerY }; // Right edge
            case 'top':
                return { x: centerX, y: rect.top }; // Top edge
            case 'bottom':
                return { x: centerX, y: rect.bottom }; // Bottom edge
            case 'center':
                return { x: centerX, y: centerY }; // Center
            default:
                throw new Error('Invalid position. Valid values are left, right, top, bottom, center.');
        }
    }

    /**
     * Sets the position of the pin on the wheel based on the options provided.
     * 
     * @example
     * this.setPin({ position: "top-right" });
     */
    setPin() {
        const { position = "top" } = this.options.pin || { offsets: {} }; // Get the pin position from options or use "top" by default

        const pin = document.querySelector(".wheel-section__pin");
        let edges = this.getCircleEdge(position);
        pin.style.top = `${edges.y}px`;
        pin.style.left = `${edges.x}px`;

        let circleEdges = this.getCircleEdge("center");

        const circle = document.querySelector(".wheel-section__center");
        circle.style.top = `${circleEdges.y}px`;
        circle.style.left = `${circleEdges.x}px`;

        // document.body.style.setProperty("--pin-offset-x", offsetX || 0);
        // document.body.style.setProperty("--pin-offset-y", offsetY || 0);
    }

    /**
  * Draws a high-resolution image on the canvas wheel, ensuring it fits perfectly.
  * 
  * @param {HTMLImageElement} image - The image to draw on the wheel.
  */
    async drawImage(image) {

        // Get the device pixel ratio, falling back to 1 if unavailable
        const dpr = window.devicePixelRatio || 1;

        // Get the CSS dimensions of the canvas
        const displayWidth = this.size;
        const displayHeight = this.size;

        // Set the canvas buffer size to match the display size multiplied by DPR
        this.canvas.width = displayWidth * dpr;
        this.canvas.height = displayHeight * dpr;

        // Set the canvas CSS size to maintain visual dimensions
        this.canvas.style.width = `${displayWidth}px`;
        this.canvas.style.height = `${displayHeight}px`;

        // Scale all future drawing operations by the DPR
        this.context.scale(dpr, dpr);

        // Enable image smoothing for better quality
        this.context.imageSmoothingEnabled = true;
        this.context.imageSmoothingQuality = 'high';

        // Calculate the aspect ratios
        const canvasAspectRatio = displayWidth / displayHeight;
        const imageAspectRatio = image.width / image.height;

        let drawWidth = displayWidth;
        let drawHeight = displayHeight;
        let x = 0;
        let y = 0;

        // Determine dimensions to cover the canvas while maintaining aspect ratio
        if (imageAspectRatio > canvasAspectRatio) {
            // Image is wider than canvas
            drawHeight = displayHeight;
            drawWidth = drawHeight * imageAspectRatio;
            x = (displayWidth - drawWidth) / 2;
        } else {
            // Image is taller than canvas
            drawWidth = displayWidth;
            drawHeight = drawWidth / imageAspectRatio;
            y = (displayHeight - drawHeight) / 2;
        }

        // Clear the canvas before drawing
        // this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // Draw the image
        this.context.drawImage(
            image,
            x, y,
            drawWidth, drawHeight
        );
    }



    /**
     * Draws all slices of the wheel on the canvas, optionally highlighting a selected slice.
     * 
     * @param {Array<Slice>} slices - The array of Slice objects to draw.
     * @param {number|null} selectedSliceIndex - The index of the slice to highlight (if any).
     */
    drawSlices(slices, selectedSliceIndex = null) {
        slices.forEach(slice =>
            slice.draw(this.context, this.size, slice.index === selectedSliceIndex)
        );
    }

    // Select the slice by index
    selectSlice(index, drawAllSlices) {
        const centerX = this.size / 2; // X-coordinate of the wheel's center
        const centerY = this.size / 2; // Y-coordinate of the wheel's center

        // Clear the canvas
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // Restore the canvas state after clearing
        this.context.save();
        this.context.translate(centerX, centerY); // Move origin back to the center
        this.context.rotate((this.options.rotate * Math.PI) / 180); // Rotate to the specified angle
        this.context.restore();

        // Redraw slices with the clicked slice highlighted
        drawAllSlices(index);
    }

    /**
     * Adds a click event listener to the canvas to detect clicks on slices.
     * When a slice is clicked, it redraws the wheel and highlights the selected slice.
     * 
     * @param {Array<Slice>} slices - The array of Slice objects representing the wheel.
     * @param {Function} drawAllSlices - Callback to redraw all slices with an updated selection.
     */
    addClickListener(slices, drawAllSlices) {
        // this.canvas.addEventListener('click', (event) => {

        //     if (this.options.mode != "edit") return;
        //     // Determine which slice was clicked
        //     const clickedIndex = Slice.getClickedSliceIndex(event, this.canvas, this.size, slices);

        //     if (isNaN(clickedIndex)) return; // Ignore clicks outside the wheel

        //     this.selectSlice(clickedIndex); // Highlight the selected slice

        //     SpinItUp.log(`Slice clicked: ${clickedIndex}`); // Log the index of the clicked slice

        //     try {
        //         this.options.callback("SEGMENT_CLICKED", { index: clickedIndex, segment: slices[clickedIndex].segment })
        //     } catch (error) {

        //     }
        // });
    }
}

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/define property getters */
/******/ 	(() => {
/******/ 		// define getter functions for harmony exports
/******/ 		__webpack_require__.d = (exports, definition) => {
/******/ 			for(var key in definition) {
/******/ 				if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	(() => {
/******/ 		__webpack_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	(() => {
/******/ 		// define __esModule on exports
/******/ 		__webpack_require__.r = (exports) => {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	})();
/******/ 	
/************************************************************************/
/******/ 	
/******/ 	// startup
/******/ 	// Load entry module and return exports
/******/ 	// This entry module is referenced by other modules so it can't be inlined
/******/ 	var __webpack_exports__ = __webpack_require__("./lib/spinitup.js");
/******/ 	__webpack_exports__ = __webpack_exports__["default"];
/******/ 	
/******/ 	return __webpack_exports__;
/******/ })()
;
});
//# sourceMappingURL=spinitup.js.map