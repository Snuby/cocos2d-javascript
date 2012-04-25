var path = require('path')

exports.main = function () {
    require.paths.push(path.join(__dirname, 'libs'))

    require('./remote_resources_patch')

    require('./js_extensions')

    // Link to the parent window's XHR object, IE9 will fail with cross-origin
    // errors if we don't.
    window.XMLHttpRequest = parent.XMLHttpRequest

    // Load default cocos2d config
    var config = require('./config')
    for (var k in config) {
        if (config.hasOwnProperty(k)) {
            window[k] = config[k]
        }
    }

    // Load appliaction config
    if (path.exists('/config.js')) {
        config = require('/config')
        for (var k in config) {
            if (config.hasOwnProperty(k)) {
                window[k] = config[k]
            }
        }
    }

    if (ENABLE_DEPRECATED_METHODS) {
        require('./legacy')
    }
};
