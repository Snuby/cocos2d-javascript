'use strict'

var util    = require('util')
  , path    = require('path')
  , cocos   = require('cocos2d')
  , events  = require('events')
  , geo     = require('geometry')
  , nodes   = cocos.nodes
  , actions = cocos.actions

var TestCase   = require('../TestCase')
  , Director   = cocos.Director
  , LabelAtlas = nodes.LabelAtlas
  , Point      = geo.Point

var kTagSprite1 = 1
  , kTagSprite2 = 2
  , kTagSprite3 = 3
  , kTagSprite4 = 4
  , kTagSprite5 = 5
  , kTagSprite6 = 6
  , kTagSprite7 = 7
  , kTagSprite8 = 8


function TestLabelAtlas () {
    TestLabelAtlas.superclass.constructor.call(this)

    var label1 = new LabelAtlas({ string: "123 Test"
                                , charMapFile: path.join(__dirname, '../resources/fonts/tuffy_bold_italic-charmap.png')
                                , itemWidth: 48
                                , itemHeight: 64
                                , startCharMap: ' '
                                })

    label1.position = new Point(10, 100)
    label1.opacity  = 200

    this.addChild({ child: label1
                  , tag: kTagSprite1
                  , z: 0
                  })


    var label2 = new LabelAtlas({ string: "0123456789"
                                , charMapFile: path.join(__dirname, '../resources/fonts/tuffy_bold_italic-charmap.png')
                                , itemWidth: 48
                                , itemHeight: 64
                                , startCharMap: ' '
                                })

    label2.position = new Point(10, 200)
    label2.opacity  = 32

    this.addChild({ child: label2
                  , tag: kTagSprite2
                  , z: 0
                  })

    this.schedule('step')
}

TestLabelAtlas.inherit(TestCase, /** @lends TestLabelAtlas */ {
    title: "LabelAtlas"
  , subtitle: "Updating label should be fast"

  , time: 0

  , step: function (dt) {
        this.time += dt

        var string = this.time.toString() + ' Test'

        var label1 = this.getChild({ tag: kTagSprite1 })
        label1.string = string

        var label2 = this.getChild({ tag: kTagSprite2 })
        label2.string = parseInt(this.time).toString()
    }

})

module.exports = TestLabelAtlas
