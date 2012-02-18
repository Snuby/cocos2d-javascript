'use strict'

//{{{ Imports
var util      = require('util')
  , path      = require('path')
  , cocos     = require('cocos2d')
  , geo       = require('geometry')
  , nodes     = cocos.nodes
  , actions   = cocos.actions

var TestCase    = require('./TMXTestCase')
  , Director    = cocos.Director
  , Texture2D   = cocos.Texture2D
  , TMXTiledMap = nodes.TMXTiledMap
  , Point       = geo.Point
//}}} Imports

var kTagTileMap = 1

/**
 * @class
 * Test Orthographic TMX Map
 *
 * @extends TMXTestCase
 */
function TMXOrthoZorder () {
    TMXOrthoZorder.superclass.constructor.call(this)

    this.isMouseEnabled = true

    var s = Director.sharedDirector.winSize
      , map = new TMXTiledMap({ file: path.join(__dirname, '../resources/TileMaps/orthogonal-test-vertexz.tmx') })

    this.addChild({ child: map
                  , tag: kTagTileMap
                  , z: 0
                  })

    var layer = map.getLayer({name: 'trees'})
      , tamara = layer.tileAt(new Point(0, 11))

    var move = new actions.MoveBy({ duration: 6, position: new Point(400, 450) })
      , back = move.reverse()
      , seq = new actions.Sequence({ actions: [move, back] })

    tamara.runAction(new actions.RepeatForever(seq))

    this.tamara = tamara
    this.schedule('repositionSprite')
}

TMXOrthoZorder.inherit(TestCase, /** @lends TMXOrthoZorder# */ {
    title: 'TMX Ortho Zorder'
  , subtitle: 'Sprite should hide behind the trees'

  , repositionSprite: function () {
        var p = this.tamara.position
        this.tamara.parent.reorderChild({child: this.tamara, z: Math.floor(-( (p.y + 81) /81)) })
    }
})

module.exports = TMXOrthoZorder

// vim:et:st=4:fdm=marker:fdl=0:fdc=1
