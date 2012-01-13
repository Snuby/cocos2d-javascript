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
  , Point     = geo.Point
  , Place     = actions.Place
  , CallFunc  = actions.CallFunc
  , RotateBy  = actions.RotateBy
  , Sequence  = actions.Sequence
  , DelayTime = actions.DelayTime
  , RepeatForever = actions.RepeatForever
//}}} Imports

/**
 * @class
 * Test RepeatForever Actions
 */
function RepeatForeverTest () {
    RepeatForeverTest.superclass.constructor.call(this)
}

RepeatForeverTest.inherit(TestCase, /** @lends RepeatForeverTest# */ {
    title: 'CallFunc + RepeatForever'

  , onEnter: function () {
        RepeatForeverTest.superclass.onEnter.call(this)

        this.centerSprites(1)

        this.grossini.runAction(new Sequence({ actions: [ new DelayTime({ duration: 1 })
                                                        , new CallFunc({ target: this, method: 'repeatForever' })
                                                        ]}))
    }

  , repeatForever: function (target) {
        target.runAction(new RepeatForever(new RotateBy({duration: 1, angle: 360})))
    }
})

module.exports = RepeatForeverTest

// vim:et:st=4:fdm=marker:fdl=0:fdc=1
