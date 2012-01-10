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
  , Sequence = actions.Sequence
  , MoveBy   = actions.MoveBy
  , RotateBy = actions.RotateBy
//}}} Imports

/**
 * @class
 * Sequence action test
 *
 * @extends ActionTestCase
 */
function SequenceTest () {
    SequenceTest.superclass.constructor.call(this)
}

SequenceTest.inherit(TestCase, /** @lends SequenceTest# */ {
    title: 'Sequence: Move + Rotate'

  , onEnter: function () {
        SequenceTest.superclass.onEnter.call(this)

        this.alignSpritesLeft(1)

        var action = new Sequence({ actions: [ new MoveBy({ duration: 2, position: new Point(240, 0) })
                                             , new RotateBy({ duration: 2, angle: 540 })
                                             ]})
        this.grossini.runAction(action)
    }
})

module.exports = SequenceTest

// vim:et:st=4:fdm=marker:fdl=0:fdc=1
