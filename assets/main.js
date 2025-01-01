/**
 * @fileoverview Main game logic for the SpinItUp wheel game
 * This file handles the initialization and management of the spinning wheel game,
 * including prize configuration, event handling, and game state management.
 * 
 * @author Deepansu Mor (https://github.com/deepansumor)
 * @version 1.0.0
 */

// import SpinItUp from "../lib/spinitup.js";

// Constants and Configurations
/**
 * Game prize configuration defining all possible rewards
 * @typedef {Object} PrizeSegment
 * @property {string} message - Display message for the prize
 * @property {string} icon - URL path to the prize icon
 */
const PRIZE_SEGMENTS = [
    {
        message: "You have got 4 lives",
        icon: "4Lives.png",
    },
    {
        message: "You have got 4 powers",
        icon: "4Powers.png"
    },
    {
        message: "You have got 1 diamond",
        icon: "diamond.png"
    },
    {
        message: "You have got 3 powers",
        icon: "4Powers.png"
    },
    {
        message: "You have got 1 live",
        icon: "live.png"
    },
    {
        message: "You have got 2 tokens",
        icon: "2Tokens.png"
    }
];

/**
 * Wheel configuration options
 * @type {Object}
 */
const WHEEL_CONFIG = {
    spins: 8,
    duration: 5000,
    easing: 'ease-in-out',
    direction: 'clockwise',
    pin: { position: "top" }
};

// DOM Element Selectors
const DOM_ELEMENTS = {
    wheel: document.getElementById('wheel'),
    spinButton: document.getElementById('spin'),
    prizeModal: document.getElementById('showPrize'),
    prizeImage: document.querySelector(".prize-modal__prize-img"),
    spinAgainButton: document.querySelector('.prize-modal__spin-again')
};

/**
 * Utility function to generate full image URL path
 * @param {string} imageName - Name of the image file
 * @returns {string} Complete URL for the image
 */
const generateImagePath = (imageName) => {
    return `./assets/images/${imageName}`;
};

/**
 * Generates a random stop position for the wheel
 * @param {number} segmentCount - Total number of segments
 * @returns {number} Random position between 1 and segment count
 */
const generateRandomStopPosition = (segmentCount) => {
    return Math.floor(Math.random() * segmentCount + 1);
};

/**
 * Shows the prize modal with the won prize
 * @param {PrizeSegment} segment - The prize segment that was won
 */
const showPrizeModal = (segment) => {
    DOM_ELEMENTS.prizeImage.setAttribute('src', segment.icon);
    DOM_ELEMENTS.prizeImage.classList.add('shown');
    DOM_ELEMENTS.prizeModal.classList.add("prize-modal--visible");
};

/**
 * Callback function for wheel spin completion
 * @param {string} state - Current state of the wheel
 * @param {Object} data - Data containing the winning segment
 */
const handleSpinComplete = (state, { segment }) => {
    if (state === "finished") showPrizeModal(segment);
};

/**
 * Initializes the wheel with configuration and prize segments
 * @returns {SpinItUp} Configured wheel instance
 */
const initializeWheel = () => {
    // Transform prize segments to include full image paths
    const configuredSegments = PRIZE_SEGMENTS.map(segment => ({
        ...segment,
        icon: generateImagePath(segment.icon)
    }));

    return new SpinItUp(DOM_ELEMENTS.wheel, {
        ...WHEEL_CONFIG,
        stopAt: generateRandomStopPosition(configuredSegments.length),
        segments: configuredSegments,
        callback: handleSpinComplete
    });
};

/**
 * Sets up event listeners for game interactions
 * @param {SpinItUp} wheelInstance - The initialized wheel instance
 */
const setupEventListeners = (wheelInstance) => {
    // Start spinning when spin button is clicked
    DOM_ELEMENTS.spinButton.addEventListener('click', () => {
        wheelInstance.start();
    });

    // Reload page when spin again button is clicked
    DOM_ELEMENTS.spinAgainButton.addEventListener('click', () => {
        location.reload();
    });
};

/**
 * Main initialization function to set up the game
 */
const initializeGame = () => {
    const wheelInstance = initializeWheel();
    setupEventListeners(wheelInstance);
};

// Initialize the game when the script loads
initializeGame();