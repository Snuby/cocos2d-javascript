"use strict"

var jah  = require('jah')
  , Compiler = require('../compiler').Compiler
  , opts = jah.opts
  , Template = jah.Template

var OPTIONS = [ { short:       'c'
                , long:        'config'
                , description: 'Configuration file. Default is jah.json'
                , value:       true
                }
              ]

exports.description = 'Build the current Cocos2D project';
exports.run = function () {
    opts.parse(OPTIONS, true)

    var config = opts.get('config') || 'jah.json'
      , compiler = new Compiler(config)

    compiler.build()
}
