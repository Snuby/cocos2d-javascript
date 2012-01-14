'use strict'

//{{{ Imports
var util      = require('util')
  , path      = require('path')
  , cocos     = require('cocos2d')
  , geo       = require('geometry')
  , nodes     = cocos.nodes
  , actions   = cocos.actions

var TestCase  = require('./ActionTestCase')
  , Director  = cocos.Director
  , Scheduler = cocos.Scheduler
  , Point     = geo.Point
  , MoveBy    = actions.MoveBy
  , EaseInOut = actions.EaseInOut
  , Sequence  = actions.Sequence
  , DelayTime = actions.DelayTime
  , RepeatForever = actions.RepeatForever
//}}} Imports

/**
 * @class
 */
function SpriteEaseInOutTest () {
    SpriteEaseInOutTest.superclass.constructor.call(this)
}

SpriteEaseInOutTest.inherit(TestCase, /** @lends SpriteEaseInOutTest# */ {
    title: 'EaseInOut and rates'

  , onEnter: function () {
        SpriteEaseInOutTest.superclass.onEnter.call(this)

        var s = Director.sharedDirector.winSize

        var move                  = new MoveBy({ duration: 3, position: new Point(s.width - 130, 0) })

          , move_ease_inout1      = new EaseInOut({ action: move.copy(), rate: 2 })
          , move_ease_inout_back1 = move_ease_inout1.reverse()

          , move_ease_inout2      = new EaseInOut({ action: move.copy(), rate: 3 })
          , move_ease_inout_back2 = move_ease_inout2.reverse()

          , move_ease_inout3      = new EaseInOut({ action: move.copy(), rate: 4 })
          , move_ease_inout_back3 = move_ease_inout3.reverse()

          , delay                 = new DelayTime({ duration: 0.25 })

        var seq1 = new Sequence({ actions: [move_ease_inout1, delay, move_ease_inout_back1, delay.copy()] })
          , seq2 = new Sequence({ actions: [move_ease_inout2, delay.copy(), move_ease_inout_back2, delay.copy()] })
          , seq3 = new Sequence({ actions: [move_ease_inout3, delay.copy(), move_ease_inout_back3, delay.copy()] })

        this.tamara.runAction(new RepeatForever(seq1))
        this.kathia.runAction(new RepeatForever(seq2))
        this.grossini.runAction(new RepeatForever(seq3))
    }
})

module.exports = SpriteEaseInOutTest

// vim:et:st=4:fdm=marker:fdl=0:fdc=1
