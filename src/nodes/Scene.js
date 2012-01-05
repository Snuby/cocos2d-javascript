'use strict'

var Node     = require('./Node').Node
  , Director = require('../Director').Director
  , geo      = require('geometry')


/**
 * @class
 * A Scene defines the entire view. e.g. A welcome screen, settings menu and
 * game world will each be a differen Scene.
 *
 * Your Scene will contain one or more Layers which build up the user interface.
 *
 * Only one Scene can be visible at a time but you can swap between them when
 * you need to show different components of the application. Think of them like
 * full screen windows. Only the active Scene will receive calls to draw itself.
 *
 * @example
 * var scene = new Scene()
 *   , layer = new Layer()
 * scene.addChild(layer)
 * Director.sharedDirector.runWithScene(scene)
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
