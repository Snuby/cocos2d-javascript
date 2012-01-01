'use strict'

var util = require('util'),
    path = require('path')

var modules = 'Action ActionInterval ActionInstant ActionEase'.split(' ')

/**
 * @memberOf cocos
 * @namespace Actions used to animate or change a Node
 */
var actions = {}

util.each(modules, function (mod, i) {
    util.extend(actions, require('./' + mod))
})

module.exports = actions

// vim:et:st=4:fdm=marker:fdl=0:fdc=1
