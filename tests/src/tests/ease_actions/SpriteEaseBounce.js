'use strict'

//{{{ Imports
var util      = require('util')
  , path      = require('path')
  , cocos     = require('cocos2d')
  , geo       = require('geometry')
  , nodes     = cocos.nodes
  , actions   = cocos.actions

var TestCase      = require('./ActionTestCase')
  , Director      = cocos.Director
  , Scheduler     = cocos.Scheduler
  , Point         = geo.Point
  , MoveBy        = actions.MoveBy
  , EaseBounceIn  = actions.EaseBounceIn
  , EaseBounceOut = actions.EaseBounceOut
  , Sequence      = actions.Sequence
  , DelayTime     = actions.DelayTime
  , RepeatForever = actions.RepeatForever
//}}} Imports

/**
 * @class
 */
function SpriteEaseBounceTest () {
    SpriteEaseBounceTest.superclass.constructor.call(this)
}

SpriteEaseBounceTest.inherit(TestCase, /** @lends SpriteEaseBounceTest# */ {
    title: 'EaseBounce action'

  , onEnter: function () {
        SpriteEaseBounceTest.superclass.onEnter.call(this)

        var s = Director.sharedDirector.winSize

        var move = new MoveBy({ duration: 3, position: new Point(s.width - 130, 0) })
          , move_back = move.reverse()

          , move_ease_in = new EaseBounceIn({ action: move.copy() })
          , move_ease_in_back = move_ease_in.reverse()

          , move_ease_out = new EaseBounceOut({ action: move.copy() })
          , move_ease_out_back = move_ease_out.reverse()

          , delay = new DelayTime({ duration: 0.25 })

        var seq1 = new Sequence({ actions: [move, delay, move_back, delay.copy()] })
          , seq2 = new Sequence({ actions: [move_ease_in, delay.copy(), move_ease_in_back, delay.copy()] })
          , seq3 = new Sequence({ actions: [move_ease_out, delay.copy(), move_ease_out_back, delay.copy()] })

        this.tamara.runAction(new RepeatForever(seq1))
        this.kathia.runAction(new RepeatForever(seq2))
        this.grossini.runAction(new RepeatForever(seq3))
    }
})

module.exports = SpriteEaseBounceTest

// vim:et:st=4:fdm=marker:fdl=0:fdc=1
