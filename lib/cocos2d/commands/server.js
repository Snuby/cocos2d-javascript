"use strict"

var sys  = require('util')
  , path = require('path')
  , fs   = require('fs')
  , jah  = require('jah')
  , opts = jah.opts
  , logger = jah.logger
  , mimetypes = jah.mimetypes
  , Template = jah.Template

var options = [
    {   short: 'u',
        long: 'url',
        description: 'URL to serve the JavaScript as. Default is output defined in the config file',
        value: true },

    {   short: 'c',
        long: 'config',
        description: 'Project configuration file. Default is jah.json',
        value: true },

    {   short: 'h',
        long: 'host',
        description: 'Hostname or IP address to listen on. Default is 127.0.0.1',
        value: true },

    {   short: 'p',
        long: 'port',
        description: 'Port to listen on. Default is 4000',
        value: true }
];

exports.description = 'Run the Cocos2D JavaScript development web server';
exports.run = function () {
    opts.parse(options, true);
    var host     = opts.get('host')   || '127.0.0.1',
        port     = opts.get('port')   || 4000,
        config   = opts.get('config') || 'jah.json',
        server   = new Server(config)

    server.start(host, port)
};

function Server () {
    jah.Server.apply(this, arguments)
}

Server.prototype = Object.create(jah.Server.prototype)

Server.prototype.serveUnmatchedFile = function (response, filename) {
    if (filename == 'app_init.js') {
        var template = new Template(fs.readFileSync(path.join(__dirname, '../app_init.js.template')).toString())
        this.serve(response, template.substitute(this.substitutions()), 'text/javascript')
    } else {
        this.serveNotFound(response)
    }
}

Server.prototype.substitutions = function () {
    var subs = Object.getPrototypeOf(Server.prototype).substitutions.call(this)

    subs.scriptArray = this.scriptArrayJSON()
    subs.assetPath = ''

    return subs
}

Server.prototype.scriptHTML = function () {
    return '\n        <script src="/__jah__/app_init.js" type="text/javascript"></script>'
}

Server.prototype.scriptArrayJSON = function () {
    var allFiles = this.compiler.getAllMountFilenames()
      , scripts = []
      , filename
      , i
      , l

    scripts.push('/__jah__/header.js')
    for (i=0, l = allFiles.length; i<l; i++) {
        filename = allFiles[i]
        scripts.push(path.join('/__jah__/modules', filename))
    }
    scripts.push('/__jah__/footer.js')

    return JSON.stringify(scripts)
}
