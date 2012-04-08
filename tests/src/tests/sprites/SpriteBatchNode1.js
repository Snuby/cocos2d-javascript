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
  , Size          = geo.Size
  , Rect          = geo.Rect
  , Sprite        = nodes.Sprite
  , Sequence      = actions.Sequence
  , RepeatForever = actions.RepeatForever
  , ScaleBy       = actions.ScaleBy
  , RotateBy      = actions.RotateBy
  , Blink         = actions.Blink
  , FadeOut       = actions.FadeOut
  , SpriteBatchNode = nodes.SpriteBatchNode
//}}} Imports

var kTagSpriteBatchNode = 1

/**
 * @class
 *
 * Example SpriteBatchNode 1
 */
function SpriteBatchNode1 () {
    if (Director.sharedDirector.isTouchScreen) {
        this.subtitle = 'Tap screen'
    }

    SpriteBatchNode1.superclass.constructor.call(this)

    if (Director.sharedDirector.isTouchScreen) {
        this.isTouchEnabled = true
    } else {
        this.isMouseEnabled = true
    }

    var batch = new SpriteBatchNode({ file: path.join(__dirname, '../resources/grossini_dance_atlas.png')
                                    , size: Director.sharedDirector.winSize
                                    })
    this.addChild({ child: batch
                  , tag: kTagSpriteBatchNode
                  , z: 0
                  })

    var s = Director.sharedDirector.winSize
    this.addNewSprite(ccp(s.width / 2, s.height / 2))
}

SpriteBatchNode1.inherit(TestCase, /** @lends SpriteBatchNode1# */ {
    title: 'SpriteBatchNode'
  , subtitle: 'Click screen'

  , addNewSprite: function (point) {
        var batch = this.getChild({tag: kTagSpriteBatchNode})
          , idx = Math.floor(Math.random() * 1400 / 100)
          , x = (idx % 5) * 85
          , y = (idx % 3) * 121

        var sprite = new Sprite({ textureAtlas: batch.textureAtlas
                                , rect: new Rect(x, y, 85, 121)
                                })

        sprite.position = ccp(point.x, point.y)

        batch.addChild({ child: sprite })

        var action
          , actionBack
          , seq
          , rand = Math.random()

        if (rand < 0.2) {
            action = new ScaleBy({ duration: 3
                                 , scale: 2
                                 })

        } else if (rand < 0.4) {
            action = new RotateBy({ duration: 3
                                  , angle: 360
                                  })

        } else if (rand < 0.6) {
            action = new Blink({ duration: 1
                               , blinks: 3
                               })

        } else if (rand < 0.8) {
            action = new RotateBy({ duration: 3
                                  , angle: 360
                                  })

            //action = new cocos.TintBy({duration:3, scale:2})
        } else {
            action = new FadeOut({ duration: 2
                                 })
        }

        actionBack = action.reverse()
        seq = new Sequence({ actions: [action, actionBack] })
        sprite.runAction(new RepeatForever(seq))
    }

  , mouseUp: function (event) {
        var location = Director.sharedDirector.convertEventToCanvas(event)
        this.addNewSprite(location)

        return true
    }

  , touchesEnded: function (event) {
        var location = event.touches[0].locationInCanvas
        this.addNewSprite(location)

        return true
    }
})

module.exports = SpriteBatchNode1

// vim:et:st=4:fdm=marker:fdl=0:fdc=1
