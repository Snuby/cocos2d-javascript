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
  , Scheduler     = cocos.Scheduler
  , Rect          = geo.Rect
  , Sprite        = nodes.Sprite
  , Sequence      = actions.Sequence
  , RepeatForever = actions.RepeatForever
  , FadeIn        = actions.FadeIn
//}}} Imports

//{{{ Constants
var kTagSprite1 = 1
  , kTagSprite2 = 2
  , kTagSprite3 = 3
  , kTagSprite4 = 4
  , kTagSprite5 = 5
  , kTagSprite6 = 6
  , kTagSprite7 = 7
  , kTagSprite8 = 8
//}}} Constants

function SpriteColorOpacity () {
    SpriteColorOpacity.superclass.constructor.call(this)

    var atlasFilename = path.join(__dirname, '../resources/grossini_dance_atlas.png')

    var sprites = this.sprites = []
    sprites[0] = new Sprite({ file: atlasFilename, rect: new Rect(85 * 0, 121 * 1, 85, 121) })
    sprites[1] = new Sprite({ file: atlasFilename, rect: new Rect(85 * 1, 121 * 1, 85, 121) })
    sprites[2] = new Sprite({ file: atlasFilename, rect: new Rect(85 * 2, 121 * 1, 85, 121) })
    sprites[3] = new Sprite({ file: atlasFilename, rect: new Rect(85 * 3, 121 * 1, 85, 121) })
    sprites[4] = new Sprite({ file: atlasFilename, rect: new Rect(85 * 0, 121 * 1, 85, 121) })
    sprites[5] = new Sprite({ file: atlasFilename, rect: new Rect(85 * 1, 121 * 1, 85, 121) })
    sprites[6] = new Sprite({ file: atlasFilename, rect: new Rect(85 * 2, 121 * 1, 85, 121) })
    sprites[7] = new Sprite({ file: atlasFilename, rect: new Rect(85 * 3, 121 * 1, 85, 121) })

    var s = Director.sharedDirector.winSize

    sprites[0].position = ccp((s.width / 5) * 1, (s.height / 3) * 1)
    sprites[1].position = ccp((s.width / 5) * 2, (s.height / 3) * 1)
    sprites[2].position = ccp((s.width / 5) * 3, (s.height / 3) * 1)
    sprites[3].position = ccp((s.width / 5) * 4, (s.height / 3) * 1)

    sprites[4].position = ccp((s.width / 5) * 1, (s.height / 3) * 2)
    sprites[5].position = ccp((s.width / 5) * 2, (s.height / 3) * 2)
    sprites[6].position = ccp((s.width / 5) * 3, (s.height / 3) * 2)
    sprites[7].position = ccp((s.width / 5) * 4, (s.height / 3) * 2)

    var action = new FadeIn({ duration: 3 })
      , actionBack = action.reverse()
      , fade = new RepeatForever(new Sequence({actions: [action, actionBack]}))

    sprites[7].runAction(fade)

    // late add: test dirtyColor and dirtyPosition
    this.addChild({ child: sprites[0], z: 0, tag: kTagSprite1 })
    this.addChild({ child: sprites[1], z: 0, tag: kTagSprite2 })
    this.addChild({ child: sprites[2], z: 0, tag: kTagSprite3 })
    this.addChild({ child: sprites[3], z: 0, tag: kTagSprite4 })
    this.addChild({ child: sprites[4], z: 0, tag: kTagSprite5 })
    this.addChild({ child: sprites[5], z: 0, tag: kTagSprite6 })
    this.addChild({ child: sprites[6], z: 0, tag: kTagSprite7 })
    this.addChild({ child: sprites[7], z: 0, tag: kTagSprite8 })


    Scheduler.sharedScheduler.schedule({target: this, method: this.removeAndAddSprite, interval: 2})
}

SpriteColorOpacity.inherit(TestCase, /** @lends SpriteColorOpacity# */ {
    title: 'Sprite: Opacity'

  , removeAndAddSprite: function () {
        var sprite = this.getChild({ tag: kTagSprite5 })

        this.removeChild({ child: sprite, cleanup: false })
        this.addChild({ child: sprite, z: 0, tag: kTagSprite5 })
    }

  , adjustPositions: function () {
        SpriteColorOpacity.superclass.adjustPositions.call(this)
        var s = Director.sharedDirector.winSize

        var sprites = this.sprites
        sprites[0].position = ccp((s.width / 5) * 1, (s.height / 3) * 1)
        sprites[1].position = ccp((s.width / 5) * 2, (s.height / 3) * 1)
        sprites[2].position = ccp((s.width / 5) * 3, (s.height / 3) * 1)
        sprites[3].position = ccp((s.width / 5) * 4, (s.height / 3) * 1)

        sprites[4].position = ccp((s.width / 5) * 1, (s.height / 3) * 2)
        sprites[5].position = ccp((s.width / 5) * 2, (s.height / 3) * 2)
        sprites[6].position = ccp((s.width / 5) * 3, (s.height / 3) * 2)
        sprites[7].position = ccp((s.width / 5) * 4, (s.height / 3) * 2)
  }
})

module.exports = SpriteColorOpacity

// vim:et:st=4:fdm=marker:fdl=0:fdc=1
