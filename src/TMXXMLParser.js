'use strict'

var util = require('util'),
    path = require('path'),
    ccp = require('geometry').ccp,
    base64 = require('base64'),
    gzip   = require('gzip'),
    TMXOrientationOrtho = require('./TMXOrientation').TMXOrientationOrtho,
    TMXOrientationHex = require('./TMXOrientation').TMXOrientationHex,
    TMXOrientationIso = require('./TMXOrientation').TMXOrientationIso

/**
 * @class
 *
 * @memberOf cocos
 */
function TMXTilesetInfo () {
}

TMXTilesetInfo.inherit(Object, /** @lends cocos.TMXTilesetInfo# */ {
    name: '',
    firstGID: 0,
    tileSize: null,
    spacing: 0,
    margin: 0,
    sourceImage: null,

    rectForGID: function (gid) {
        var rect = {size: {}, origin: ccp(0, 0)}
        rect.size = util.copy(this.tileSize)

        gid = gid - this.firstGID

        var imgSize = this.imageSize

        var maxX = Math.floor((imgSize.width - this.margin * 2 + this.spacing) / (this.tileSize.width + this.spacing))

        rect.origin.x = (gid % maxX) * (this.tileSize.width + this.spacing) + this.margin
        rect.origin.y = Math.floor(gid / maxX) * (this.tileSize.height + this.spacing) + this.margin

        return rect
    }
})

/**
 * @class
 *
 * @memberOf cocos
 */
function TMXLayerInfo () {
    this.properties = {}
    this.offset = ccp(0, 0)
}

TMXLayerInfo.inherit(Object, /** @lends cocos.TMXLayerInfo# */ {
    name: '',
    layerSize: null,
    tiles: null,
    visible: true,
    opacity: 255,
    minGID: 100000,
    maxGID: 0,
    properties: null,
    offset: null
})

/**
 * @class
 *
 * @memberOf cocos
 */
function TMXObjectGroup () {
    this.properties = {}
    this.objects = {}
    this.offset = ccp(0, 0)
}

TMXObjectGroup.inherit(Object, /** @lends cocos.TMXObjectGroup# */ {
    name: '',
    properties: null,
    offset: null,
    objects: null,

    /**
     * Get the value for the specific property name
     *
     * @opt {String} name Property name
     * @returns {String} Property value
     */
    getProperty: function (opts) {
        var propertyName = opts.name
        return this.properties[propertyName]
    },

    /**
     * @deprected Since v0.2. You should now use cocos.TMXObjectGroup#getProperty
     */
    propertyNamed: function (opts) {
        console.warn('TMXObjectGroup#propertyNamed is deprected. Use TMXTiledMap#getProperty instread')
        return this.getProperty(opts)
    },

    /**
     * Get the object for the specific object name. It will return the 1st
     * object found on the array for the given name.
     *
     * @opt {String} name Object name
     * @returns {Object} Object
     */
    getObject: function (opts) {
        var objectName = opts.name
        var object = null

        this.objects.forEach(function (item) {
            if (item.name == objectName) {
                object = item
            }
        })
        if (object !== null) {
            return object
        }
    },

    /**
     * @deprected Since v0.2. You should now use cocos.TMXObjectGroup#getProperty
     */
    objectNamed: function (opts) {
        console.warn('TMXObjectGroup#objectNamed is deprected. Use TMXObjectGroup#getObject instread')
        return this.getObject(opts)
    }
})

/**
 * @class
 *
 * @memberOf cocos
 *
 * @param {String} tmxFile The file path of the TMX file to load
 */
function TMXMapInfo (tmxFile) {
    this.tilesets = []
    this.layers = []
    this.objectGroups = []
    this.properties = {}
    this.tileProperties = {}
    this.filename = tmxFile

    this.parseXMLFile(tmxFile)
}

TMXMapInfo.inherit(Object, /** @lends cocos.TMXMapInfo# */ {
    filename: '',
    orientation: 0,
    mapSize: null,
    tileSize: null,
    layer: null,
    tilesets: null,
    objectGroups: null,
    properties: null,
    tileProperties: null,

    parseXMLFile: function (xmlFile) {
        var parser = new DOMParser(),
            doc = parser.parseFromString(resource(xmlFile), 'text/xml')

        // PARSE <map>
        var map = doc.documentElement

        // Set Orientation
        switch (map.getAttribute('orientation')) {
        case 'orthogonal':
            this.orientation = TMXOrientationOrtho
            break
        case 'isometric':
            this.orientation = TMXOrientationIso
            break
        case 'hexagonal':
            this.orientation = TMXOrientationHex
            break
        default:
            throw "cocos2d: TMXFomat: Unsupported orientation: " + map.getAttribute('orientation')
        }
        this.mapSize = {width: parseInt(map.getAttribute('width'), 10), height: parseInt(map.getAttribute('height'), 10)}
        this.tileSize = {width: parseInt(map.getAttribute('tilewidth'), 10), height: parseInt(map.getAttribute('tileheight'), 10)}


        // PARSE <tilesets>
        var tilesets = map.getElementsByTagName('tileset')
        var i, j, len, jen, s
        for (i = 0, len = tilesets.length; i < len; i++) {
            var t = tilesets[i]
              , externalTilesetName = t.getAttribute('source')

            var tileset = new TMXTilesetInfo()
            tileset.firstGID = parseInt(t.getAttribute('firstgid'), 10)

            // Tileset is in external file, load in XML from there -- Must
            // happen AFTER 'firstGID' is obtained because firstGID is stored
            // in the main .tmx file, not the .tsx
            if (externalTilesetName) {
                var externalTilesetPath = path.join(path.dirname(xmlFile), externalTilesetName)
                t = parser.parseFromString(resource(externalTilesetPath), 'text/xml').documentElement
            }

            tileset.name = t.getAttribute('name')
            if (t.getAttribute('spacing')) {
                tileset.spacing = parseInt(t.getAttribute('spacing'), 10)
            }
            if (t.getAttribute('margin')) {
                tileset.margin = parseInt(t.getAttribute('margin'), 10)
            }

            s = {}
            s.width = parseInt(t.getAttribute('tilewidth'), 10)
            s.height = parseInt(t.getAttribute('tileheight'), 10)
            tileset.tileSize = s

            // PARSE <image> We assume there's only 1
            var image = t.getElementsByTagName('image')[0]
            if (externalTilesetName) {
                tileset.sourceImage = path.join(path.dirname(externalTilesetPath), image.getAttribute('source'))
            } else {
                tileset.sourceImage = path.join(path.dirname(this.filename), image.getAttribute('source'))
            }

            this.tilesets.push(tileset)
        }

        // PARSE <layer>s
        var layers = map.getElementsByTagName('layer')
        for (i = 0, len = layers.length; i < len; i++) {
            var l = layers[i]
            var data = l.getElementsByTagName('data')[0]
            var layer = new TMXLayerInfo()

            layer.name = l.getAttribute('name')
            if (l.getAttribute('visible') !== false) {
                layer.visible = true
            } else {
                layer.visible = !!parseInt(l.getAttribute('visible'), 10)
            }

            s = {}
            s.width = parseInt(l.getAttribute('width'), 10)
            s.height = parseInt(l.getAttribute('height'), 10)
            layer.layerSize = s

            var opacity = l.getAttribute('opacity')
            if (!opacity && opacity !== 0) {
                layer.opacity = 255
            } else {
                layer.opacity = 255 * parseFloat(opacity)
            }

            var x = parseInt(l.getAttribute('x'), 10),
                y = parseInt(l.getAttribute('y'), 10)
            if (isNaN(x)) {
                x = 0
            }
            if (isNaN(y)) {
                y = 0
            }
            layer.offset = ccp(x, y)


            // Firefox has a 4KB limit on node values. It will split larger
            // nodes up into multiple nodes. So, we'll stitch them back
            // together.
            var nodeValue = ''
            for (j = 0, jen = data.childNodes.length; j < jen; j++) {
                nodeValue += data.childNodes[j].nodeValue
            }

            // Unpack the tilemap data
            var compression = data.getAttribute('compression')
            switch (compression) {
            case 'gzip':
                layer.tiles = gzip.unzipBase64AsArray(nodeValue, 4)
                break

            // Uncompressed
            case null:
            case '':
                layer.tiles = base64.decodeAsArray(nodeValue, 4)
                break

            default:
                throw "Unsupported TMX Tile Map compression: " + compression
            }

            // Parties <properties> in <layer>
            var properties = l.querySelectorAll('properties > property')
              , propertiesValue = {}
              , property
            for (j = 0; j < properties.length; j++) {
                property = properties[j]
                if (property.getAttribute('name')) {
                    propertiesValue[property.getAttribute('name')] = property.getAttribute('value')
                }
            }

            layer.properties = propertiesValue
            this.layers.push(layer)
        }

        // TODO PARSE <tile>

        // PARSE <objectgroup>
        var objectgroups = map.getElementsByTagName('objectgroup')
        for (i = 0, len = objectgroups.length; i < len; i++) {
            var g = objectgroups[i],
                objectGroup = new TMXObjectGroup()

            objectGroup.name = g.getAttribute('name')

            properties = g.querySelectorAll('objectgroup > properties property')
            propertiesValue = {}
            property

            for (j = 0; j < properties.length; j++) {
                property = properties[j]
                if (property.getAttribute('name')) {
                    propertiesValue[property.getAttribute('name')] = property.getAttribute('value')
                }
            }

            objectGroup.properties = propertiesValue

            var objectsArray = [],
                objects = g.querySelectorAll('object')

            for (j = 0; j < objects.length; j++) {
                var object = objects[j]
                var objectValue = {
                    x       : parseInt(object.getAttribute('x'), 10),
                    y       : parseInt(object.getAttribute('y'), 10),
                    width   : parseInt(object.getAttribute('width'), 10),
                    height  : parseInt(object.getAttribute('height'), 10)
                }

                if (FLIP_Y_AXIS) {
                    objectValue.y = (this.mapSize.height * this.tileSize.height) - objectValue.y - objectValue.height
                }

                if (object.getAttribute('name')) {
                    objectValue.name = object.getAttribute('name')
                }
                if (object.getAttribute('type')) {
                    objectValue.type = object.getAttribute('type')
                }
                properties = object.querySelectorAll('property')
                for (var k = 0; k < properties.length; k++) {
                    property = properties[k]
                    if (property.getAttribute('name')) {
                        objectValue[property.getAttribute('name')] = property.getAttribute('value')
                    }
                }
                objectsArray.push(objectValue)

            }
            objectGroup.objects = objectsArray
            this.objectGroups.push(objectGroup)
        }


        // PARSE <map><property>
        var properties = doc.querySelectorAll('map > properties > property')

        for (i = 0; i < properties.length; i++) {
            var property = properties[i]
            if (property.getAttribute('name')) {
                this.properties[property.getAttribute('name')] = property.getAttribute('value')
            }
        }
    }
})

exports.TMXMapInfo = TMXMapInfo
exports.TMXLayerInfo = TMXLayerInfo
exports.TMXTilesetInfo = TMXTilesetInfo
exports.TMXObjectGroup = TMXObjectGroup

// vim:et:st=4:fdm=marker:fdl=0:fdc=1
