'use strict'

var PreloadScene = require('./PreloadScene').PreloadScene
  , Director    = require('../Director').Director
  , Label       = require('./Label').Label
  , ProgressBar = require('./ProgressBar').ProgressBar
  , Preloader   = require('preloader').Preloader
  , RemoteResource = require('remote_resources').RemoteResource
  , geo         = require('geometry')
  , util        = require('util')
  , events      = require('events')


/**
 * @class
 * PreloadScene that draws a progress bar and 'please wait' message
 *
 * @memberOf cocos.nodes
 * @extends cocos.nodes.PreloadScene
 */
function ProgressBarPreloadScene (opts) {
    ProgressBarPreloadScene.superclass.constructor.call(this, opts)
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

    // Preloader for the progress bar assets
    var loadingPreloader = new Preloader([this.emptyImage, this.fullImage])

    // When progress bar resources have loaded then draw them and load all the rest
    events.addListener(loadingPreloader, 'complete', function (preloader) {
        this.createProgressBar()
        this.load()
    }.bind(this))

    loadingPreloader.load()
}

ProgressBarPreloadScene.inherit(PreloadScene, /** @lends cocos.nodes.ProgressBarPreloadScene# */ {
    progressBar: null,
    label: null,
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
    }
})

exports.ProgressBarPreloadScene = ProgressBarPreloadScene

// vim:et:st=4:fdm=marker:fdl=0:fdc=1
