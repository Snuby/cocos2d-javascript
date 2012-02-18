'use strict'

var util = require('util'),
    geo = require('geometry'),
    ccp = geo.ccp,
    Node = require('./Node').Node,
    TMXOrientationOrtho = require('../TMXOrientation').TMXOrientationOrtho,
    TMXOrientationHex   = require('../TMXOrientation').TMXOrientationHex,
    TMXOrientationIso   = require('../TMXOrientation').TMXOrientationIso,
    TMXLayer   = require('./TMXLayer').TMXLayer,
    TMXMapInfo = require('../TMXXMLParser').TMXMapInfo

/**
 * @class
 * A TMX Map loaded from a .tmx file
 *
 * @memberOf cocos.nodes
 * @extends cocos.nodes.Node
 *
 * @opt {String} file The file path of the TMX map to load
 */
function TMXTiledMap (opts) {
    TMXTiledMap.superclass.constructor.call(this, opts)

    this.anchorPoint = ccp(0, 0)

    var mapInfo = new TMXMapInfo(opts.file)

    this.mapSize        = mapInfo.mapSize
    this.tileSize       = mapInfo.tileSize
    this.mapOrientation = mapInfo.orientation
    this.objectGroups   = mapInfo.objectGroups
    this.properties     = mapInfo.properties
    this.tileProperties = mapInfo.tileProperties

    // Add layers to map
    var idx = 0
    mapInfo.layers.forEach(function (layerInfo) {
        if (layerInfo.visible) {
            var child = this.parseLayer({layerInfo: layerInfo, mapInfo: mapInfo})
            this.addChild({child: child, z: idx, tag: idx})

            var childSize   = child.contentSize
            var currentSize = this.contentSize
            currentSize.width  = Math.max(currentSize.width,  childSize.width)
            currentSize.height = Math.max(currentSize.height, childSize.height)
            this.contentSize = currentSize

            idx++
        }
    }.bind(this))
}


TMXTiledMap.inherit(Node, /** @lends cocos.nodes.TMXTiledMap# */ {
    mapSize: null,
    tileSize: null,
    mapOrientation: 0,
    objectGroups: null,
    properties: null,
    tileProperties: null,

    parseLayer: function (opts) {
        var tileset = this.tilesetForLayer(opts)
        var layer = new TMXLayer({tilesetInfo: tileset, layerInfo: opts.layerInfo, mapInfo: opts.mapInfo})

        layer.setupTiles()

        return layer
    },

    tilesetForLayer: function (opts) {
        var layerInfo = opts.layerInfo,
            mapInfo = opts.mapInfo,
            size = layerInfo.layerSize

        // Reverse loop
        var tileset
        for (var i = mapInfo.tilesets.length - 1; i >= 0; i--) {
            tileset = mapInfo.tilesets[i]

            for (var y = 0; y < size.height; y++) {
                for (var x = 0; x < size.width; x++) {
                    var pos = x + size.width * y,
                        gid = layerInfo.tiles[pos]

                    if (gid !== 0 && gid >= tileset.firstGID) {
                        return tileset
                    }
                } // for (var x
            } // for (var y
        } // for (var i

        //console.log("cocos2d: Warning: TMX Layer '%s' has no tiles", layerInfo.name)
        return tileset
    },

    /**
     * Get a layer
     *
     * @opt {String} name The name of the layer to get
     * @returns {cocos.nodes.TMXLayer} The layer requested
     */
    getLayer: function (opts) {
        var layerName = opts.name,
            layer = null

        this.children.forEach(function (item) {
            if (item instanceof TMXLayer && item.layerName == layerName) {
                layer = item
            }
        })
        if (layer !== null) {
            return layer
        }
    },

    /**
     * Return the ObjectGroup for the secific group
     *
     * @opt {String} name The object group name
     * @returns {cocos.TMXObjectGroup} The object group
     */
    getObjectGroup: function (opts) {
        var objectGroupName = opts.name,
            objectGroup = null

        this.objectGroups.forEach(function (item) {
            if (item.name == objectGroupName) {
                objectGroup = item
            }
        })
        if (objectGroup !== null) {
            return objectGroup
        }
    },

    /**
     * @deprected Since v0.2. You should now use cocos.TMXTiledMap#getObjectGroup.
     */
    objectGroupNamed: function (opts) {
        console.warn('TMXTiledMap#objectGroupNamed is deprected. Use TMXTiledMap#getObjectGroup instread')
        return this.getObjectGroup(opts)
    }
})

exports.TMXTiledMap = TMXTiledMap

