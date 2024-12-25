import Slice from "./slice.js";
import SpinItUp from "./spinitup.js";

// Define pin positions with their corresponding rotation angles in degrees
const pinPositions = {
    top: "-90deg",
    right: "0deg",
    bottom: "90deg",
    left: "180deg",
    "top-right": "-45deg",
    "bottom-right": "45deg",
    "bottom-left": "135deg",
    "top-left": "-135deg",
};

// Wheel class to handle canvas-specific logic and manage the wheel's behavior
export default class Wheel {
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
        container.style.cssText = `width: ${this.size}px; height: ${this.size}px; overflow: hidden;`;
        container.appendChild(canvas); // Add canvas to the container

        // Get the 2D rendering context for the canvas
        this.context = canvas.getContext('2d');

        // Replace the original element with the canvas container
        elem.parentElement.replaceChild(container, elem);
        this.elem = this.canvas = canvas; // Update the element reference to the canvas

        // Set the wheel shape to a circle
        this.elem.style.borderRadius = '50%';

        // Optionally, set the pin position
        // this.setPin();
    }

    /**
     * Sets the position of the pin on the wheel based on the options provided.
     * 
     * @example
     * this.setPin({ position: "top-right" });
     */
    setPin() {
        const { position = "top" } = this.options.pin || {}; // Get the pin position from options or use "top" by default
        const deg = pinPositions[position]; // Get the rotation angle for the specified position
        this.elem.style.rotate = deg; // Apply the rotation angle to the wheel
    }

    /**
     * Draws an image on the wheel, rotating it by the specified angle.
     * 
     * @param {HTMLImageElement} image - The image to draw on the wheel.
     */
    async drawImage(image) {
        const rotationAngle = this.options.rotate || 0; // Get the rotation angle from options
        const centerX = this.size / 2; // X-coordinate of the wheel's center
        const centerY = this.size / 2; // Y-coordinate of the wheel's center

        this.context.save(); // Save the current drawing state
        this.context.translate(centerX, centerY); // Move the origin to the center of the wheel
        this.context.rotate((rotationAngle * Math.PI) / 180); // Rotate the context by the specified angle (in radians)
        this.context.drawImage(image, -this.size / 2, -this.size / 2, this.size, this.size); // Draw the image centered on the wheel
        this.context.restore(); // Restore the original drawing state
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

    /**
     * Adds a click event listener to the canvas to detect clicks on slices.
     * When a slice is clicked, it redraws the wheel and highlights the selected slice.
     * 
     * @param {Array<Slice>} slices - The array of Slice objects representing the wheel.
     * @param {Function} drawAllSlices - Callback to redraw all slices with an updated selection.
     */
    addClickListener(slices, drawAllSlices) {
        this.canvas.addEventListener('click', (event) => {

            if(this.options.mode != "edit") return;
            // Determine which slice was clicked
            const clickedIndex = Slice.getClickedSliceIndex(event, this.canvas, this.size, slices);

            if (isNaN(clickedIndex)) return; // Ignore clicks outside the wheel

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
            drawAllSlices(clickedIndex);
            SpinItUp.log(`Slice clicked: ${clickedIndex}`); // Log the index of the clicked slice
        });
    }
}