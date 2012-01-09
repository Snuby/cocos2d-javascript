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
  , Point       = geo.Point
//}}} Imports

var kTagTileMap = 1

/**
 * @class
 * Test Isometric TMX Map
 *
 * @extends TMXTestCase
 */
function TMXIsoTest () {
    TMXIsoTest.superclass.constructor.call(this)

    this.isMouseEnabled = true

    /*
    CCLayerColor *color = [CCLayerColor layerWithColor:ccc4(64,64,64,255)]
    [self addChild:color z:-1]
    */

    var map = new TMXTiledMap({ file: path.join(__dirname, '../resources/TileMaps/iso-test.tmx') })
    this.addChild({ child: map
                  , tag: kTagTileMap
                  , z: 0
                  })

    // move map to the center of the screen
    var ms = map.mapSize
      , ts = map.tileSize

    map.position = new Point(-ms.width * ts.width / 2, -ms.height * ts.height / 2)

    //map.runAction(actions.MoveTo.create({duration: 1.0, position: ccp(-ms.width * ts.width / 2, -ms.height * ts.height / 2)}))
}

TMXIsoTest.inherit(TestCase, /** @lends TMXIsoTest# */ {
    title: 'TMX Isometric test 0'
})

module.exports = TMXIsoTest

// vim:et:st=4:fdm=marker:fdl=0:fdc=1
