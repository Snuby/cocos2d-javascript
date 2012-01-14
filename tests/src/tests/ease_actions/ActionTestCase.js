'use strict'

var cocos    = require('cocos2d')
  , path     = require('path')
  , nodes    = cocos.nodes
  , geo      = require('geometry')

var TestCase = require('../TestCase')
  , Sprite   = nodes.Sprite
  , Rect     = geo.Rect
  , Point    = geo.Point

var kTagTileMap = 1

var kTagSprite1 = 1
  , kTagSprite2 = 2
  , kTagSprite3 = 3

function ActionTestCase () {
    ActionTestCase.superclass.constructor.call(this)

    this.isMouseEnabled = true

    this.grossini = new Sprite({ file: path.join(__dirname, '../resources/grossini.png')
                               , rect: new Rect(0, 0, 85, 121)
                               })

    this.tamara = new Sprite({ file: path.join(__dirname, '../resources/grossinis_sister1.png')
                             , rect: new Rect(0, 0, 52, 139)
                             })

    this.kathia = new Sprite({ file: path.join(__dirname, '../resources/grossinis_sister2.png')
                             , rect: new Rect(0, 0, 56, 138)
                             })

    var s = cocos.Director.sharedDirector.winSize

    this.grossini.position = new Point(60, 50)
    this.kathia.position   = new Point(60, 150)
    this.tamara.position   = new Point(60, 250)

    this.addChild({ child: this.grossini
                  , tag: kTagSprite1
                  , z: 1
                  })
    this.addChild({ child: this.tamara
                  , tag: kTagSprite2
                  , z: 2
                  })
    this.addChild({ child: this.kathia
                  , tag: kTagSprite3
                  , z: 3
                  })
}

ActionTestCase.inherit(TestCase, /** @lends ActionTestCase# */ {
    /**
     * @type cocos.nodes.Sprite
     */
    grossini: null

    /**
     * @type cocos.nodes.Sprite
     */
  , tamara: null

    /**
     * @type cocos.nodes.Sprite
     */
  , kathia: null

  , positionForTwo: function () {
        this.grossini.position = new Point(60, 120)
        this.tamara.position = new Point(60, 220)
        this.kathia.visible = false
    }
})

module.exports = ActionTestCase

// vim:et:st=4:fdm=marker:fdl=0:fdc=1
