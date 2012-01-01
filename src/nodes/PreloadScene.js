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
 * @memberOf cocos.nodes
 * @extends cocos.nodes.Scene
 */
function PreloadScene (opts) {
    PreloadScene.superclass.constructor.call(this, opts)
    var size = Director.sharedDirector.winSize

    // Setup 'please wait' label
    var label = new Label({
        fontSize: 14,
        fontName: 'Helvetica',
        fontColor: '#ffffff',
        string: 'Please wait...'
    })
    label.position = new geo.Point(size.width / 2, (size.height / 2) + 32)
    this.label = label
    this.addChild({child: label})

    // Setup preloader
    var preloader = new Preloader();    // The main preloader
    preloader.addEverythingToQueue()
    this.preloader = preloader

    // Listen for preload events
    events.addListener(preloader, 'load', function (preloader, uri) {
        var loaded = preloader.loaded,
            count = preloader.count
        events.trigger(this, 'load', preloader, uri)
    }.bind(this))

    events.addListener(preloader, 'complete', function (preloader) {
        events.trigger(this, 'complete', preloader)
    }.bind(this))




    // Preloader for the loading screen resources
    var loadingPreloader = new Preloader([this.emptyImage, this.fullImage])

    // When loading screen resources have loaded then draw them
    events.addListener(loadingPreloader, 'complete', function (preloader) {
        this.createProgressBar()
        if (this.isRunning) {
            this.preloader.load()
        }

        this.isReady = true
    }.bind(this))

    loadingPreloader.load()
}

PreloadScene.inherit(Scene, /** @lends cocos.nodes.PreloadScene# */ {
    progressBar: null,
    label: null,
    preloader: null,
    isReady: false, // True when both progress bar images have loaded
    emptyImage: "/libs/cocos2d/resources/progress-bar-empty.png",
    fullImage:  "/libs/cocos2d/resources/progress-bar-full.png",

    createProgressBar: function () {
        var preloader = this.preloader,
            size = Director.sharedDirector.winSize

        var progressBar = new ProgressBar({
            emptyImage: "/libs/cocos2d/resources/progress-bar-empty.png",
            fullImage:  "/libs/cocos2d/resources/progress-bar-full.png"
        })

        progressBar.position = new geo.Point(size.width / 2, size.height / 2)

        this.progressBar = progressBar
        this.addChild({child: progressBar})

        events.addListener(preloader, 'load', function (preloader, uri) {
            progressBar.maxValue = preloader.count
            progressBar.value = preloader.loaded
        })
    },

    onEnter: function () {
        PreloadScene.superclass.onEnter.call(this)
        var preloader = this.preloader

        // Preload everything
        if (this.isReady) {
            preloader.load()
        }
    }
})

exports.PreloadScene = PreloadScene

// vim:et:st=4:fdm=marker:fdl=0:fdc=1
