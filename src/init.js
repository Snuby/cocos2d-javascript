var path = require('path')

exports.main = function () {
    require.paths.push(path.join(__dirname, 'libs'))

    require('./js_extensions')

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
};
