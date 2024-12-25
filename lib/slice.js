import SpinItUp from "./spinitup.js";

/**
 * Slice: Represents a single slice of the wheel.
 */
export default class Slice {
    /**
     * Creates an array of slices based on the segments and wheel size.
     * Each slice corresponds to a segment of the wheel and includes
     * its start and end angles, index, and associated data.
     * 
     * @param {Array} segments - The segments for the wheel. Each segment contains data for the slice.
     * @returns {Array<Slice>} - An array of Slice objects representing the slices of the wheel.
     */
    static create(segments) {
        SpinItUp.log('Creating slices with segments:', segments);

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
        SpinItUp.log('Determining clicked slice based on event:', event);

        // Get click coordinates relative to the canvas
        const rect = canvas.getBoundingClientRect();
        const x = event.clientX - rect.left - size / 2; // X coordinate relative to center
        const y = event.clientY - rect.top - size / 2; // Y coordinate relative to center
        const distanceFromCenter = Math.sqrt(x * x + y * y); // Distance from the center of the wheel

        // Check if click is outside the wheel
        if (distanceFromCenter > size / 2) {
            SpinItUp.log('Click outside the wheel.');
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
                SpinItUp.log(`Clicked slice index: ${slice.index}`);
                return slice.index;
            }
        }

        SpinItUp.log('No slice found for the click event.');
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
        SpinItUp.log('Creating Slice:', {
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

    /**
     * Draws the slice on the provided canvas context.
     * Each slice is rendered with specified styles and a label.
     * 
     * @param {CanvasRenderingContext2D} context - The canvas rendering context.
     * @param {number} size - The size (diameter) of the wheel.
     * @param {boolean} isSelected - Indicates whether the slice is currently selected (for visual highlight).
     */
    draw(context, size, isSelected) {
        SpinItUp.log('Drawing slice:', {
            index: this.index,
            isSelected,
        });

        // Destructure properties from the segment for styling and display
        const {
            backgroundColor = 'transparent', // Fill color of the slice
            color = '#000000', // Text color for the slice label
            fontSize = 16, // Font size for the slice label
            borderColor = 'transparent', // Border color of the slice
            borderWidth = 2, // Border width of the slice
            textOffset = 0.5, // Offset for label positioning within the slice
            textAlign = 'center', // Text alignment for the label
            textBaseline = 'middle', // Text baseline for the label
            padding = 0, // Padding for label positioning
            text = "", // Default label is the index + 1
        } = this.segment;

        // Begin drawing the slice
        context.beginPath();
        context.moveTo(size / 2, size / 2); // Move to center of the wheel
        context.arc(size / 2, size / 2, size / 2, this.startAngle, this.endAngle); // Draw slice arc
        context.closePath();

        // Set fill style and fill the slice
        context.fillStyle = isSelected ? 'yellow' : backgroundColor;
        context.fill();

        // Draw slice border if specified
        if (borderWidth > 0) {
            context.lineWidth = borderWidth;
            context.strokeStyle = borderColor;
            context.stroke();
        }

        // Calculate text position within the slice
        const textAngle = this.startAngle + (this.endAngle - this.startAngle) / 2; // Center angle of the slice
        const radius = size / 2.5 - padding; // Radius for text placement
        const textX = size / 2 + radius * Math.cos(textAngle) * textOffset; // X-coordinate of text
        const textY = size / 2 + radius * Math.sin(textAngle) * textOffset; // Y-coordinate of text

        // Set text properties and render the label
        context.fillStyle = color;
        context.font = `${fontSize}px Arial`;
        context.textAlign = textAlign;
        context.textBaseline = textBaseline;
        context.fillText(text, textX, textY);
    }
}
