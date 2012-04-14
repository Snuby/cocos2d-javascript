'use strict'

var Scene       = require('./Scene').Scene,
    Director    = require('../Director').Director,
    Label       = require('./Label').Label,
    ProgressBar = require('./ProgressBar').ProgressBar,
    Preloader   = require('preloader').Preloader,
    RemoteResource = require('remote_resources').RemoteResource,
    geo         = require('geometry'),
    util        = require('util'),
    events      = require('events')


/**
 * @class
 * To customise the preload screen you should inherit from
 * cocos.nodes.PreloadScene and then set Director.sharedDirector.preloadSceneConstructor
 * to your PreloadScene.
 *
 * @memberOf cocos.nodes
 * @extends cocos.nodes.Scene
 */
function PreloadScene (opts) {
    PreloadScene.superclass.constructor.call(this, opts)

    // Setup preloader
    var preloader = new Preloader()    // The main preloader
    this.preloader = preloader

    // Listen for preload events
    events.addListener(preloader, 'load', function (preloader, uri) {
        events.trigger(this, 'load', preloader, uri)
    }.bind(this))

    events.addListener(preloader, 'complete', function (preloader) {
        events.trigger(this, 'complete', preloader)
    }.bind(this))
}

PreloadScene.inherit(Scene, /** @lends cocos.nodes.PreloadScene# */ {
    preloader: null

    /**
     * True when we're going to preload the queue
     * @type Boolean
     */
  , isReady: false

  , load: function () {
        if (this.isRunning) {
            this.populateQueue()
            this.preloader.load()
        }

        this.isReady = true
    }
  , populateQueue: function () {
        this.preloader.addEverythingToQueue()
    }
  , onEnter: function () {
        PreloadScene.superclass.onEnter.call(this)

        if (this.isReady) {
            this.preloader.load()
        }
    }

})

exports.PreloadScene = PreloadScene

// vim:et:st=4:fdm=marker:fdl=0:fdc=1
