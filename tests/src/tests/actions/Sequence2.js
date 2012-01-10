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
  , Label    = nodes.Label
  , Point    = geo.Point
  , Sequence = actions.Sequence
  , MoveBy   = actions.MoveBy
  , RotateBy = actions.RotateBy
  , CallFunc = actions.CallFunc
//}}} Imports

/**
 * @class
 * Sequence action test
 *
 * @extends ActionTestCase
 */
function Sequence2Test () {
    Sequence2Test.superclass.constructor.call(this)
}

Sequence2Test.inherit(TestCase, /** @lends Sequence2Test# */ {
    title: 'Sequence of InstantActions'

  , onEnter: function () {
        Sequence2Test.superclass.onEnter.call(this)

        this.alignSpritesLeft(1)

        var action = new Sequence({ actions: [ new MoveBy({ duration: 1, position: new Point(100, 0) })
                                             , new CallFunc({ target: this, method: 'callback1' })
                                             , new CallFunc({ target: this, method: 'callback2' })
                                             , new CallFunc({ target: this, method: 'callback3' })
                                             ]})
        this.grossini.runAction(action)
    }

  , callback1: function(target) {
        var s = Director.sharedDirector.winSize
        var label = new Label({ string: 'callback 1 called', fontName: 'Marker Felt', fontSize: 16 })
        label.position = new Point(s.width / 4, s.height / 2)
        this.addChild(label)
    }

  , callback2: function(target) {
        var s = Director.sharedDirector.winSize
        var label = new Label({ string: 'callback 2 called', fontName: 'Marker Felt', fontSize: 16 })
        label.position = new Point(s.width / 4 * 2, s.height / 2)
        this.addChild(label)
    }

  , callback3: function(target) {
        var s = Director.sharedDirector.winSize
        var label = new Label({ string: 'callback 3 called', fontName: 'Marker Felt', fontSize: 16 })
        label.position = new Point(s.width / 4 * 3, s.height / 2)
        this.addChild(label)
    }
})

module.exports = Sequence2Test

// vim:et:st=4:fdm=marker:fdl=0:fdc=1
