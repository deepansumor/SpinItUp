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
        SpinItUp.log('Drawing slice:', {
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

        SpinItUp.log('Drawing slice: actualText', {actualText});
        
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
