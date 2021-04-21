/* eslint-disable no-console */
// Log method
function log(...msg) {
    if (process.env.NODE_ENV !== "production" && 
        process.env.ENV !== "production") {
        console.log(msg.toString().replace(",", " ")) // Print the json response
    }
}

module.exports = {
    log: log
}