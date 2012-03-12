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
 * Test Orthographic Objects in a TMX Map
 *
 * @extends TMXTestCase
 */
function TMXOrthoObjectsTest () {
    TMXOrthoObjectsTest.superclass.constructor.call(this)

    this.isMouseEnabled = true

    var map = new TMXTiledMap({ file: path.join(__dirname, '../resources/TileMaps/ortho-objects.tmx') })

    this.addChild({ child: map
                  , tag: kTagTileMap
                  , z: -1
                  })

    var s = map.contentSize

    console.log('ContentSize: %f, %f', s.width, s.height)
    console.log('----> Iterating over all the group objects')

    var group = map.getObjectGroup({ name: 'Object Group 1' })
      , objs  = group.objects
      , i, obj
      , len = objs.length
    for (i = 0; i < len; i++) {
        obj = objs[i]
        console.log('Object: ', obj)
    }

    console.log('----> Fetching 1 object by name')
    var platform = group.getObject({ name: 'platform' })
    console.log('platform: ', platform)
}

TMXOrthoObjectsTest.inherit(TestCase, /** @lends TMXOrthoObjectsTest# */ {
    title: 'TMX Ortho object test'
  , subtitle: 'You should see a white box around the 3 platforms'

    /**
     * Extends normal draw function to add white boxes around all objects in
     * the map
     */
  , draw: function (ctx) {
        var map = this.getChild({ tag: kTagTileMap })
          , group = map.getObjectGroup({ name: 'Object Group 1' })
          , objs = group.objects

        ctx.save()
        ctx.strokeStyle = '#fff'
        ctx.lineWidth = 3
        ctx.beginPath()

        var i, obj, len = objs.length
        for (i = 0; i < len; i++) {
            obj = objs[i]

            var x = obj.x
              , y = obj.y
              , w = obj.width
              , h = obj.height

            ctx.moveTo(x,     y)
            ctx.lineTo(x + w, y)
            ctx.lineTo(x + w, y + h)
            ctx.lineTo(x,     y + h)
            ctx.lineTo(x,     y)
        }
        ctx.closePath()
        ctx.stroke()
        ctx.restore()
    }
})

module.exports = TMXOrthoObjectsTest

// vim:et:st=4:fdm=marker:fdl=0:fdc=1
