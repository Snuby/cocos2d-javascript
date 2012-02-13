'use strict'

var util = require('util'),
    geo = require('geometry'),
    Plist = require('Plist').Plist,
    SpriteFrame = require('./SpriteFrame').SpriteFrame,
    Texture2D = require('./Texture2D').Texture2D

/**
 * @class
 *
 * @memberOf cocos
 * @singleton
 */
function SpriteFrameCache () {
    SpriteFrameCache.superclass.constructor.call(this)

    this.spriteFrames = {}
    this.spriteFrameAliases = {}
}

SpriteFrameCache.inherit(Object, /** @lends cocos.SpriteFrameCache# */ {
    /**
     * List of sprite frames
     * @type Object
     */
    spriteFrames: null,

    /**
     * List of sprite frame aliases
     * @type Object
     */
    spriteFrameAliases: null,

    /**
     * Add SpriteFrame(s) to the cache
     *
     * @param {String} opts.file The filename of a Zwoptex .plist containing the frame definiitons.
     */
    addSpriteFrames: function (opts) {
        var plistPath = opts.file,
            plist = new Plist({file: plistPath}),
            plistData = plist.data


        var metaDataDict = plistData.metadata,
            framesDict = plistData.frames

        var format = 0,
            texturePath = null

        if (metaDataDict) {
            format = metaDataDict.format
            // Get texture path from meta data
            texturePath = metaDataDict.textureFileName
        }

        if (!texturePath) {
            // No texture path so assuming it's the same name as the .plist but ending in .png
            texturePath = plistPath.replace(/\.plist$/i, '.png')
        }


        var texture = new Texture2D({file: texturePath})

        // Add frames
        for (var frameDictKey in framesDict) {
            if (framesDict.hasOwnProperty(frameDictKey)) {
                var frameDict = framesDict[frameDictKey],
                    spriteFrame = null

                switch (format) {
                case 0:
                    var x = frameDict.x,
                        y =  frameDict.y,
                        w =  frameDict.width,
                        h =  frameDict.height,
                        ox = frameDict.offsetX,
                        oy = frameDict.offsetY,
                        ow = frameDict.originalWidth,
                        oh = frameDict.originalHeight

                    // check ow/oh
                    if (!ow || !oh) {
                        //console.log("cocos2d: WARNING: originalWidth/Height not found on the CCSpriteFrame. AnchorPoint won't work as expected. Regenerate the .plist")
                    }

                    if (FLIP_Y_AXIS) {
                        oy *= -1
                    }

                    // abs ow/oh
                    ow = Math.abs(ow)
                    oh = Math.abs(oh)

                    // create frame
                    spriteFrame = new SpriteFrame({texture: texture,
                                                         rect: geo.rectMake(x, y, w, h),
                                                       rotate: false,
                                                       offset: geo.ccp(ox, oy),
                                                 originalSize: geo.sizeMake(ow, oh)})
                    break

                case 1:
                case 2:
                    var frame      = geo.rectFromString(frameDict.frame),
                        rotated    = !!frameDict.rotated,
                        offset     = geo.pointFromString(frameDict.offset),
                        sourceSize = geo.sizeFromString(frameDict.sourceSize)

                    if (FLIP_Y_AXIS) {
                        offset.y *= -1
                    }


                    // create frame
                    spriteFrame = new SpriteFrame({texture: texture,
                                                         rect: frame,
                                                       rotate: rotated,
                                                       offset: offset,
                                                 originalSize: sourceSize})
                    break

                case 3:
                    var spriteSize       = geo.sizeFromString(frameDict.spriteSize),
                        spriteOffset     = geo.pointFromString(frameDict.spriteOffset),
                        spriteSourceSize = geo.sizeFromString(frameDict.spriteSourceSize),
                        textureRect      = geo.rectFromString(frameDict.textureRect),
                        textureRotated   = frameDict.textureRotated


                    if (FLIP_Y_AXIS) {
                        spriteOffset.y *= -1
                    }

                    // get aliases
                    var aliases = frameDict.aliases
                    for (var i = 0, len = aliases.length; i < len; i++) {
                        var alias = aliases[i]
                        this.spriteFrameAliases[frameDictKey] = alias
                    }

                    // create frame
                    spriteFrame = new SpriteFrame({texture: texture,
                                                         rect: geo.rectMake(textureRect.origin.x, textureRect.origin.y, spriteSize.width, spriteSize.height),
                                                       rotate: textureRotated,
                                                       offset: spriteOffset,
                                                 originalSize: spriteSourceSize})
                    break

                default:
                    throw "Unsupported Zwoptex format: " + format
                }

                // Add sprite frame
                this.spriteFrames[frameDictKey] = spriteFrame
            }
        }
    },

    /**
     * Get a single SpriteFrame
     *
     * @param {String} opts.name The name of the sprite frame
     * @returns {cocos.SpriteFrame} The sprite frame
     */
    getSpriteFrame: function (opts) {
        var name = opts.name || opts

        var frame = this.spriteFrames[name]

        if (!frame) {
            // No frame, look for an alias
            var key = this.spriteFrameAliases[name]

            if (key) {
                frame = this.spriteFrames[key]
            }

            if (!frame) {
                throw "Unable to find frame: " + name
            }
        }

        return frame
    }
})

Object.defineProperty(SpriteFrameCache, 'sharedSpriteFrameCache', {
    /**
     * A shared singleton instance of cocos.SpriteFrameCache
     *
     * @memberOf cocos.SpriteFrameCache
     * @getter {cocos.SpriteFrameCache} sharedSpriteFrameCache
     */
    get: function () {
        if (!SpriteFrameCache._instance) {
            SpriteFrameCache._instance = new this()
        }

        return SpriteFrameCache._instance
    }

  , enumerable: true
})

exports.SpriteFrameCache = SpriteFrameCache

// vim:et:st=4:fdm=marker:fdl=0:fdc=1
