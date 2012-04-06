'use strict'

//{{{ Imports
var util      = require('util')
  , path      = require('path')
  , cocos     = require('cocos2d')
  , geo       = require('geometry')
  , nodes     = cocos.nodes
  , actions   = cocos.actions
  , ccp       = geo.ccp

var TestCase  = require('../TestCase')
  , Director  = cocos.Director
  , Scheduler = cocos.Scheduler
  , Rect      = geo.Rect
  , Sprite    = nodes.Sprite
//}}} Imports

//{{{ Constants
var kTagSprite1 = 1
//}}} Constants

/**
 * @class
 *
 * Example Sprite Z ORder
 */
function SpriteZOrder () {
    SpriteZOrder.superclass.constructor.call(this)

    var s = Director.sharedDirector.winSize
      , step = s.width / 11
      , sprite
      , i

    this.sprites = []
    for (i = 0; i < 5; i++) {
        this.sprites[i] = sprite = new Sprite({ file: path.join(__dirname, '../resources/grossini_dance_atlas.png')
                                              , rect: new Rect(85 * 0, 121 * 1, 85, 121)
                                              })
        sprite.position = ccp((i + 1) * step, s.height / 2)
        this.addChild({ child: sprite
                      , z: i
                      })
    }

    for (i = 5; i < 10; i++) {
        this.sprites[i] = sprite = new Sprite({ file: path.join(__dirname, '../resources/grossini_dance_atlas.png')
                                              , rect: new Rect(85 * 1, 121 * 0, 85, 121)
                                              })
        sprite.position = ccp((i + 1) * step, s.height / 2)
        this.addChild({ child: sprite
                      , z: 14 - i
                      })
    }

    this.sprites[10] = sprite = new Sprite({ file: path.join(__dirname, '../resources/grossini_dance_atlas-red.png')
                                           , rect: new Rect(85 * 3, 121 * 0, 85, 121)
                                           })
    sprite.position = ccp(s.width / 2, s.height / 2 + 20)
    sprite.scaleX = 6
    this.addChild({ child: sprite
                  , tag: kTagSprite1
                  , z: -1
                  })


    Scheduler.sharedScheduler.schedule({ target: this
                                       , method: this.reorderSprite
                                       , interval: 1
                                       })
}

SpriteZOrder.inherit(TestCase, /** @lends SpriteZOrder# */ {
    title: 'Sprite Z Order'
  , dir: 1

  , reorderSprite: function (dt) {
        var sprite = this.getChild({ tag: kTagSprite1 })
          , z = sprite.zOrder

        if (z < -1) {
            this.dir = 1
        }
        if (z > 10) {
            this.dir = -1
        }

        z += this.dir * 3

        this.reorderChild({ child: sprite
                          , z: z
                          })
    }

  , adjustPositions: function () {
        SpriteZOrder.superclass.adjustPositions.call(this)
        var s = Director.sharedDirector.winSize
            , step = s.width / 11

        var sprite, i
        for (i = 0; i < 5; i++) {
            sprite = this.sprites[i]
            sprite.position = ccp((i + 1) * step, s.height / 2)
        }
        for (i = 5; i < 10; i++) {
            sprite = this.sprites[i]
            sprite.position = ccp((i + 1) * step, s.height / 2)
        }
        sprite = this.sprites[10]
        sprite.position = ccp(s.width / 2, s.height / 2 + 20)
    }
})


module.exports = SpriteZOrder

// vim:et:st=4:fdm=marker:fdl=0:fdc=1
