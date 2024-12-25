import Slice from "./slice.js";
import SpinItUp from "./spinitup.js";


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
        container.className = "spin-it-up-container";
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

    /**
     * Adds a click event listener to the canvas to detect clicks on slices.
     * When a slice is clicked, it redraws the wheel and highlights the selected slice.
     * 
     * @param {Array<Slice>} slices - The array of Slice objects representing the wheel.
     * @param {Function} drawAllSlices - Callback to redraw all slices with an updated selection.
     */
    addClickListener(slices, drawAllSlices) {
        this.canvas.addEventListener('click', (event) => {

            if (this.options.mode != "edit") return;
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