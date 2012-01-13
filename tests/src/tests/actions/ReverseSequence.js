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
  , Sequence = actions.Sequence
//}}} Imports

/**
 * @class
 */
function ReverseSequenceTest () {
    ReverseSequenceTest.superclass.constructor.call(this)
}

ReverseSequenceTest.inherit(TestCase, /** @lends ReverseSequenceTest# */ {
    title: 'Reverse a sequence'

  , onEnter: function () {
        ReverseSequenceTest.superclass.onEnter.call(this)

        this.alignSpritesLeft(1)

        var move1  = new MoveBy({ duration: 1, position: new Point(250, 0) })
          , move2  = new MoveBy({ duration: 1, position: new Point(0, 50) })
          , seq    = new Sequence({ actions: [move1, move2, move1.reverse()] })
          , action = new Sequence({ actions: [seq, seq.reverse()] })

        this.grossini.runAction(action)
    }
})

module.exports = ReverseSequenceTest

// vim:et:st=4:fdm=marker:fdl=0:fdc=1
