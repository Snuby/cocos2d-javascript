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
 * Test Orthographic TMX Map
 *
 * @extends TMXTestCase
 */
function TMXOrthoTest2 () {
    TMXOrthoTest2.superclass.constructor.call(this)

    this.isMouseEnabled = true

    var s = Director.sharedDirector.winSize
      , map = new TMXTiledMap({ file: path.join(__dirname, '../resources/TileMaps/orthogonal-test1.tmx') })

    this.addChild({ child: map
                  , tag: kTagTileMap
                  , z: 0
                  })


    map.runAction( new ScaleBy({ duration: 2, scale: 0.5 }) )
}

TMXOrthoTest2.inherit(TestCase, /** @lends TMXOrthoTest2# */ {
    title: 'Tile Map Test'
  , subtitle: 'drag screen'
})

module.exports = TMXOrthoTest2

// vim:et:st=4:fdm=marker:fdl=0:fdc=1
