'use strict'

var util = require('util'),
    path = require('path')

var modules = 'TextureAtlas Texture2D SpriteFrame SpriteFrameCache Director Animation AnimationCache Scheduler ActionManager TMXXMLParser'.split(' ')

/**
 * @namespace All cocos2d objects live in this namespace
 */
var cocos = {
    nodes: require('./nodes'),
    actions: require('./actions')
}

util.each(modules, function (mod, i) {
    util.extend(cocos, require('./' + mod))
})

module.exports = cocos

// vim:et:st=4:fdm=marker:fdl=0:fdc=1
