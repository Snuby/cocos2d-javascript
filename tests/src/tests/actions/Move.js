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
  , MoveTo   = actions.MoveTo
  , MoveBy   = actions.MoveBy
  , Sequence = actions.Sequence
//}}} Imports

/**
 * @class
 *
 * MoveTo and MoveBy actions
 */
function Move () {
    Move.superclass.constructor.call(this)
}

Move.inherit(TestCase, /** @lends Move# */ {
    title: 'MoveTo / MoveBy'

  , onEnter: function () {
        Move.superclass.onEnter.call(this)

        this.centerSprites(3)

        var s = cocos.Director.sharedDirector.winSize

        var actionTo = new MoveTo({ duration: 2, position: new Point(s.width - 40, s.height - 40) })
          , actionBy = new MoveBy({ duration: 2, position: new Point(80, 80) })
          , actionByBack = actionBy.reverse()

        this.tamara.runAction(actionTo)
        this.grossini.runAction(new Sequence({actions: [actionBy, actionByBack]}))
        this.kathia.runAction(new MoveTo({duration: 1, position: new Point(40, 40)}))
    }
})

module.exports = Move

// vim:et:st=4:fdm=marker:fdl=0:fdc=1
