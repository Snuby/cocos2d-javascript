#!/usr/bin/env node

/**
 * @fileOverview Generates a standalone build
 */

var path     = require('path')
  , sys      = require('util')
  , fs       = require('fs')
  , opts     = require('../../lib/cocos2d/opts')
  , spawn    = require('child_process').spawn
  , Template = require('../../lib/cocos2d/template').Template
  , Compiler = require('../../lib/cocos2d/compiler').Compiler

;(function main() {
    'use strict'

    sys.puts("Generating cocos2d.js")

    var compiler = new Compiler
    compiler.parseConfig({ libs: ["cocos2d"]
                         , externalize: { cocos2d: "cocos2d.js"
                                        , jah: "cocos2d.js"
                                        }
                         })

    var pkg = JSON.parse(fs.readFileSync(path.join(__dirname, '../../package.json'), 'utf8'))
      , version = 'v' + pkg.version
      , src = compiler.buildPackages()['cocos2d.js']
      , wrapper = new Template(fs.readFileSync(path.join(__dirname, 'standalone.template'), 'utf8'))
      , filename = 'cocos2d-' + version

    // Pad version so copyright frame lines up
    while (version.length < 20) version += ' '

    var code = wrapper.substitute({"cocos2d.js": src, "version": version})

    if (!path.existsSync('build')) {
        fs.mkdirSync('build', 511);
    }
    fs.writeFileSync('build/' + filename + '.js', code, 'utf8')
    sys.puts('Wrote to build/' + filename + '.js')

    var uglify = spawn('uglifyjs', ['-o', path.join('build', filename + '.min.js'), path.join('build', filename + '.js')], {cwd: __dirname});
    uglify.on('exit', function (data) {
        // Fix the missing newline after copyright
        var minified = fs.readFileSync(path.join(__dirname, 'build/' + filename + '.min.js'), 'utf8')
        minified = minified.replace('*/', '*/\n\n')
        fs.writeFileSync('build/' + filename + '.min.js', minified, 'utf8')

        sys.puts('Wrote to build/' + filename + '.min.js')
    })
})();

