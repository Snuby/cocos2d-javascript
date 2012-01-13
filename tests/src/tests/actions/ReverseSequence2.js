'use strict'

//{{{ Imports
var util      = require('util')
  , path      = require('path')
  , cocos     = require('cocos2d')
  , geo       = require('geometry')
  , nodes     = cocos.nodes
  , actions   = cocos.actions

var TestCase = require('./ActionTestCase')
  , Director = cocos.Director
  , Point    = geo.Point
  , MoveBy   = actions.MoveBy
  , Hide     = actions.Hide
  , Sequence = actions.Sequence
  , Repeat   = actions.Repeat
  , ToggleVisibility = actions.ToggleVisibility
//}}} Imports

/**
 * @class
 */
function ReverseSequence2Test () {
    ReverseSequence2Test.superclass.constructor.call(this)
}

ReverseSequence2Test.inherit(TestCase, /** @lends ReverseSequence2Test# */ {
    title: 'Reverse a sequence 2'

  , onEnter: function () {
        ReverseSequence2Test.superclass.onEnter.call(this)

        this.alignSpritesLeft(2)

        // Sequence should work both with IntervalAction and InstantActions
        var move1  = new MoveBy({ duration: 1, position: new Point(250, 0) })
          , move2  = new MoveBy({ duration: 1, position: new Point(0, 50) })
          , tog1   = new ToggleVisibility()
          , tog2   = new ToggleVisibility()
          , seq    = new Sequence({ actions: [move1, tog1, move2, tog2, move1.reverse()] })
          , action = new Repeat({ action: new Sequence({ actions: [seq, seq.reverse()] }), times: 3})
        this.kathia.runAction(action)

        //   Also test that the reverse of Hide is Show, and vice-versa
        var move_t   = new MoveBy({ duration: 1, position: new Point(100, 0) })
          , move_t2  = new MoveBy({ duration: 1, position: new Point(50, 0) })
          , hide     = new Hide()
          , seq_t    = new Sequence({ actions: [ move_t, hide, move_t2] })
          , seq_back = seq_t.reverse()

        this.tamara.runAction(new Sequence({ actions: [seq_t, seq_back] }))
    }
})

module.exports = ReverseSequence2Test

// vim:et:st=4:fdm=marker:fdl=0:fdc=1
