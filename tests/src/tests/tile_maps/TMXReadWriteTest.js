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
  , ScaleBy     = actions.ScaleBy
  , MoveBy      = actions.MoveBy
  , RotateBy    = actions.RotateBy
  , Sequence    = actions.Sequence
  , Point       = geo.Point
//}}} Imports

var kTagTileMap = 1

/**
 * @class
 * Test Orthographic TMX Map
 *
 * @extends TMXTestCase
 */
function TMXReadWriteTest () {
    TMXReadWriteTest.superclass.constructor.call(this)

    var map = new TMXTiledMap({ file: path.join(__dirname, '../resources/TileMaps/orthogonal-test2.tmx') })
    this.addChild({ child: map
                  , tag: kTagTileMap
                  , z: 0
                  })

    var s = map.contentSize
    console.log('ContentSize: %f, %f', s.width, s.height)


    var layer = map.getLayer({ name: 'Layer 0' })
      , tile0 = layer.tileAt(new Point(1, 63))
      , tile1 = layer.tileAt(new Point(2, 63))
      , tile2 = layer.tileAt(new Point(2, 62))


    tile0.anchorPoint = new Point(0.5, 0.5)
    tile1.anchorPoint = new Point(0.5, 0.5)
    tile2.anchorPoint = new Point(0.5, 0.5)

    var move   = new MoveBy({ duration: 0.5, position: new Point(0, 160) })
      , rotate = new RotateBy({ duration: 2.0, angle: 360 })
      , scale  = new ScaleBy({ duration: 2.0, scale: 5 })


    var seq0 = new Sequence({ actions: [move, rotate, scale] }) /*, scale, opacity, fadein, scaleback, finish, nil];*/
      , seq1 = seq0.copy()
      , seq2 = seq0.copy()

    tile0.runAction(seq0)
    tile1.runAction(seq1)
    tile2.runAction(seq2)

}

TMXReadWriteTest.inherit(TestCase, /** @lends TMXReadWriteTest# */ {
    title: 'TMX Read/Write test'
})

module.exports = TMXReadWriteTest

// vim:et:st=4:fdm=marker:fdl=0:fdc=1
