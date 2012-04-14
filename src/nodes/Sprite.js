'use strict'

var util = require('util')
  , evt  = require('events')
  , geo  = require('geometry')
  , ccp  = geo.ccp

var Director         = require('../Director').Director
  , SpriteFrameCache = require('../SpriteFrameCache').SpriteFrameCache
  , TextureAtlas     = require('../TextureAtlas').TextureAtlas
  , Node             = require('./Node').Node

/**
 * @class
 * A 2D graphic that can be animated
 *
 * @memberOf cocos.nodes
 * @extends cocos.nodes.Node
 *
 * @opt {String} file Path to image to use as sprite atlas
 * @opt {Rect} [rect] The rect in the sprite atlas image file to use as the sprite
 */
function Sprite (opts) {
    Sprite.superclass.constructor.call(this, opts)

    opts = opts || {}

    var file         = opts.file
      , textureAtlas = opts.textureAtlas
      , texture      = opts.texture
      , frame        = opts.frame
      , spritesheet  = opts.spritesheet
      , rect         = opts.rect
      , frameName    = opts.frameName

    this.anchorPoint = ccp(0.5, 0.5)

    this.offsetPosition = ccp(0, 0)
    this.unflippedOffsetPositionFromCenter = ccp(0, 0)

    if (frameName) {
        frame = SpriteFrameCache.sharedSpriteFrameCache.getSpriteFrame(frameName)
    }

    if (frame) {
        texture = frame.texture
        rect    = frame.rect
    }

    evt.addListener(this, 'dirtytransform', this._updateQuad.bind(this))
    evt.addPropertyListener(this, 'textureAtlas', 'change', this._updateTextureQuad.bind(this))

    if (file || texture) {
        textureAtlas = new TextureAtlas({file: file, texture: texture})
    } else if (spritesheet) {
        textureAtlas = spritesheet.textureAtlas
        this.useSpriteSheet = true
    } else if (!textureAtlas) {
        //throw "Sprite has no texture"
    }

    if (!rect && textureAtlas) {
        rect = new geo.Rect(0, 0, textureAtlas.texture.size.width, textureAtlas.texture.size.height)
    }

    if (rect) {
        this.rect = rect
        this.contentSize = rect.size

        this.quad = { drawRect: {origin: ccp(0, 0), size: rect.size}
                    , textureRect: rect
                    }
    }

    this.textureAtlas = textureAtlas

    if (frame) {
        this.displayFrame = frame
    }
}

Sprite.inherit(Node, /** @lends cocos.nodes.Sprite# */{
    textureAtlas: null
  , dirty: true
  , recursiveDirty: true
  , quad: null
  , flipX: false
  , flipY: false
  , offsetPosition: null
  , unflippedOffsetPositionFromCenter: null
  , untrimmedSize: null

    /**
     * The rectangle area in the source image where the sprite is
     * @type geometry.Rect
     */
  , get rect ()  { return this._rect }
  , set rect (x) { this._rect = x; evt.trigger(this, 'dirtytransform', {target: this, property: 'rect'}) }
  , _rect: null

    /**
     * @private
     */
  , _updateTextureQuad: function (obj, key, texture, oldTexture) {
        if (oldTexture) {
            oldTexture.removeQuad({quad: this.quad})
        }

        if (texture) {
            texture.insertQuad({quad: this.quad})
        }
    }

    /**
     * @type geometry.Rect
     */
  , set textureCoords (rect) {
        var quad = this.quad
        if (!quad) {
            quad = {
                drawRect: geo.rectMake(0, 0, 0, 0), 
                textureRect: geo.rectMake(0, 0, 0, 0)
            }
        }

        quad.textureRect = util.copy(rect)

        this.quad = quad
    }

    /**
     * @type geometry.Rect
     */
  , set textureRect (opts) {
        var rect = opts.rect
          , rotated = !!opts.rotated
          , untrimmedSize = opts.untrimmedSize || rect.size

        this.contentSize = untrimmedSize
        this.rect = util.copy(rect)
        this.textureCoords = rect

        var quad = this.quad

        var relativeOffset = util.copy(this.unflippedOffsetPositionFromCenter)

        if (this.flipX) {
            relativeOffset.x = -relativeOffset.x
        }
        if (this.flipY) {
            relativeOffset.y = -relativeOffset.y
        }

        var offsetPosition = util.copy(this.offsetPosition)
        offsetPosition.x =  relativeOffset.x + (this.contentSize.width  - rect.size.width) / 2
        offsetPosition.y = -relativeOffset.y + (this.contentSize.height - rect.size.height) / 2

        quad.drawRect.origin = util.copy(offsetPosition)
        quad.drawRect.size = util.copy(rect.size)
        if (this.flipX) {
            quad.drawRect.size.width *= -1
            quad.drawRect.origin.x = -rect.size.width
        }
        if (this.flipY) {
            quad.drawRect.size.height *= -1
            quad.drawRect.origin.y = -rect.size.height
        }

        this.quad = quad
    }

    /**
     * @private
     */
  , _updateQuad: function () {
        if (!this.rect) {
            return
        }
        if (!this.quad) {
            this.quad = { drawRect: geo.rectMake(0, 0, 0, 0)
                        , textureRect: geo.rectMake(0, 0, 0, 0)
                        }
        }

        var relativeOffset = util.copy(this.unflippedOffsetPositionFromCenter)

        if (this.flipX) {
            relativeOffset.x = -relativeOffset.x
        }
        if (this.flipY) {
            relativeOffset.y = -relativeOffset.y
        }

        var offsetPosition = util.copy(this.offsetPosition)
        offsetPosition.x = relativeOffset.x + (this.contentSize.width  - this.rect.size.width) / 2
        offsetPosition.y = relativeOffset.y + (this.contentSize.height - this.rect.size.height) / 2

        this.quad.textureRect = util.copy(this.rect)
        this.quad.drawRect.origin = util.copy(offsetPosition)
        this.quad.drawRect.size = util.copy(this.rect.size)

        if (this.flipX) {
            this.quad.drawRect.size.width *= -1
            this.quad.drawRect.origin.x = -this.rect.size.width
        }
        if (this.flipY) {
            this.quad.drawRect.size.height *= -1
            this.quad.drawRect.origin.y = -this.rect.size.height
        }
    }

  , updateTransform: function (ctx) {
        if (!this.useSpriteSheet) {
            throw "updateTransform is only valid when Sprite is being rendered using a SpriteSheet"
        }

        if (!this.visible) {
            this.dirty = false
            this.recursiveDirty = false
            return
        }

        // TextureAtlas has hard reference to this quad so we can just update it directly
        this.quad.drawRect.origin = new geo.Point( this.position.x - this.anchorPointInPixels.x * this.scaleX
                                                 , this.position.y - this.anchorPointInPixels.y * this.scaleY
                                                 )
        this.quad.drawRect.size = new geo.Size( this.rect.size.width * this.scaleX
                                              , this.rect.size.height * this.scaleY
                                              )

        this.dirty = false
        this.recursiveDirty = false
    }

  , draw: function (ctx) {
        if (!this.quad) {
            return
        }
        this.textureAtlas.drawQuad(ctx, this.quad)
    }

  , isFrameDisplayed: function (frame) {
        if (!this.rect || !this.textureAtlas) {
            return false
        }
        return (frame.texture === this.textureAtlas.texture && geo.rectEqualToRect(frame.rect, this.rect))
    }


    /**
     * @type cocos.SpriteFrame
     */
  , set displayFrame (frame) {
        if (!frame) {
            delete this.quad
            return
        }
        this.unflippedOffsetPositionFromCenter = util.copy(frame.offset)

        // change texture
        if (!this.textureAtlas || frame.texture !== this.textureAtlas.texture) {
            this.textureAtlas = new TextureAtlas({texture: frame.texture})
        }

        this.textureRect = {rect: frame.rect, rotated: frame.rotated, untrimmedSize: frame.originalSize}
    }
})

module.exports.Sprite = Sprite

// vim:et:st=4:fdm=marker:fdl=0:fdc=1
