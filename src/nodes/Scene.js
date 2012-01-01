'use strict'

var Node     = require('./Node').Node
  , Director = require('../Director').Director
  , geo      = require('geometry')


/**
 * @class
 * Everything in your view will be a child of this object. You need at least 1 scene per app.
 *
 * @memberOf cocos.nodes
 * @extends cocos.nodes.Node
 */
function Scene () {
    Scene.superclass.constructor.call(this)

    var s = Director.sharedDirector.winSize

    this.isRelativeAnchorPoint = false
    this.anchorPoint = new geo.Point(0.5, 0.5)
    this.contentSize = s
}

Scene.inherit(Node)

module.exports.Scene = Scene

// vim:et:st=4:fdm=marker:fdl=0:fdc=1
