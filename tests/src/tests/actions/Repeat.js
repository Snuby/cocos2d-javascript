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
  , Place    = actions.Place
  , MoveBy   = actions.MoveBy
  , Sequence = actions.Sequence
  , Repeat   = actions.Repeat
  , RepeatForever = actions.RepeatForever
//}}} Imports

/**
 * @class
 * Test Repeat Actions
 */
function RepeatTest () {
    RepeatTest.superclass.constructor.call(this)
}

RepeatTest.inherit(TestCase, /** @lends RepeatTest# */ {
    title: 'Repeat / RepeatForever actions'

  , onEnter: function () {
        RepeatTest.superclass.onEnter.call(this)

        this.alignSpritesLeft(2)

        var a1 = new MoveBy({ duration: 1, position: new Point(150, 0) })
          , action1 = new Repeat({ action: new Sequence({ actions: [ new Place({position: new Point(60, 60)})
                                                                   , a1 ]})
                                 , times: 3})

        var action2 = new RepeatForever(new Sequence({actions: [ a1.copy()
                                                               , a1.reverse()
                                                               ]}))

        this.kathia.runAction(action1)
        this.tamara.runAction(action2)
    }
})

module.exports = RepeatTest

// vim:et:st=4:fdm=marker:fdl=0:fdc=1
