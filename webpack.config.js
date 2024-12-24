const path = require('path');

// Common configuration
const commonConfig = {
    entry: path.resolve(__dirname, 'lib', 'spinitup.js'), // Entry point
    output: {
        path: path.resolve(__dirname, 'dist'), // Output directory
        library: 'SpinItUp',                  // Library name
        libraryTarget: 'umd',                 // Universal module definition
        globalObject: 'this',                 // Ensures compatibility in Node.js
    },
    resolve: {
        extensions: ['.js'], // Automatically resolve these extensions
    },
};

// Development build configuration
const devConfig = {
    ...commonConfig,
    mode: 'development', // Development mode (unminified)
    output: {
        ...commonConfig.output,
        filename: 'spinitup.js', // Output filename for dev
    },
    devtool: 'source-map', // Include source maps for debugging
};

// Production build configuration
const prodConfig = {
    ...commonConfig,
    mode: 'production', // Production mode (minified)
    output: {
        ...commonConfig.output,
        filename: 'spinitup.min.js', // Output filename for prod
    },
};

// Export both configurations
module.exports = [devConfig, prodConfig];
