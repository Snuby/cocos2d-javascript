'use strict'

//{{{ Imports
var util      = require('util')
  , path      = require('path')
  , cocos     = require('cocos2d')
  , geo       = require('geometry')
  , nodes     = cocos.nodes
  , actions   = cocos.actions
  , ccp       = geo.ccp

var TestCase      = require('../TestCase')
  , Director      = cocos.Director
  , Rect          = geo.Rect
  , Sprite        = nodes.Sprite
  , RepeatForever = actions.RepeatForever
  , ScaleBy       = actions.ScaleBy
  , RotateBy      = actions.RotateBy
//}}} Imports

/**
 * @class
 *
 * Example Sprite Anchor Point
 */
function SpriteAnchorPoint () {
    SpriteAnchorPoint.superclass.constructor.call(this)

    var s = Director.sharedDirector.winSize

    var rotate = new RotateBy({ duration: 10, angle: 360 })
      , action = new RepeatForever(rotate)
      , sprite
      , point
      , copy
      , i

    this.sprites = []
    this.points = []
    for (i = 0; i < 3; i++) {
        this.sprites[i] = sprite = new Sprite({ file: path.join(__dirname, '../resources/grossini_dance_atlas.png')
                                              , rect: new Rect(85 * i, 121 * 1, 85, 121)
                                              })
        sprite.position = ccp(s.width / 4 * (i + 1), s.height / 2)

        this.points[i] = point = new Sprite({ file: path.join(__dirname, '../resources/r1.png') })
        point.scale = 0.25
        point.position = sprite.position
        this.addChild({ child: point
                      , z: 10
                      })

        switch (i) {
        case 0:
            sprite.anchorPoint = ccp(0, 0)
            break
        case 1:
            sprite.anchorPoint = ccp(0.5, 0.5)
            break
        case 2:
            sprite.anchorPoint = ccp(1, 1)
            break
        }

        copy = action.copy()
        sprite.runAction(copy)
        this.addChild({ child: sprite
                      , z: 1
                      })
    }
}

SpriteAnchorPoint.inherit(TestCase, /** @lends SpriteAnchorPoint# */ {
    title: 'Sprite Anchor Point'
  , adjustPositions: function () {
        SpriteAnchorPoint.superclass.adjustPositions.call(this)
        var s = Director.sharedDirector.winSize

        var sprite, point, i
        for (i = 0; i < this.sprites.length; i++) {
            sprite = this.sprites[i]
            point = this.points[i]
            point.position = sprite.position = ccp(s.width / 4 * (i + 1), s.height / 2)
        }
    }
})

module.exports = SpriteAnchorPoint

// vim:et:st=4:fdm=marker:fdl=0:fdc=1
