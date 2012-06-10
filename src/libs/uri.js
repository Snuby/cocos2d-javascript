/**
 * @namespace
 * URI utilities
 */
var uri = {
    isURL: function (uri) {
        return /^(file|http|https):\/\//.test(uri)
    }
}

module.exports = uri
