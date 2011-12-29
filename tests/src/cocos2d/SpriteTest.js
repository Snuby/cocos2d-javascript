'use strict'

//{{{ Imports
var util      = require('util')
  , path      = require('path')
  , events    = require('events')
  , cocos     = require('cocos2d')
  , geo       = require('geometry')
  , nodes     = cocos.nodes
  , actions   = cocos.actions
  , ccp       = geo.ccp

var Texture2D   = cocos.Texture2D
  , Director    = cocos.Director
  , Scheduler   = cocos.Scheduler
  , SpriteFrame = cocos.SpriteFrame
  , Animation   = cocos.Animation
  , AnimationCache   = cocos.AnimationCache
  , SpriteFrameCache = cocos.SpriteFrameCache

var Size  = geo.Size
  , Point = geo.Point
  , Rect  = geo.Rect

var Layer           = nodes.Layer
  , Scene           = nodes.Scene
  , Sprite          = nodes.Sprite
  , Label           = nodes.Label
  , Menu            = nodes.Menu
  , MenuItemImage   = nodes.MenuItemImage
  , SpriteBatchNode = nodes.SpriteBatchNode

var Sequence      = actions.Sequence
  , RepeatForever = actions.RepeatForever
  , ScaleBy       = actions.ScaleBy
  , RotateBy      = actions.RotateBy
  , Blink         = actions.Blink
  , FadeOut       = actions.FadeOut
  , FadeIn        = actions.FadeIn
  , Animate       = actions.Animate
  , FlipX         = actions.FlipX
  , FlipY         = actions.FlipY
//}}} Imports

//{{{ Test List
var testList = [ 'Sprite1'
               , 'SpriteBatchNode1'
               , 'SpriteAnchorPoint'
               , 'SpriteZOrder'
               , 'SpriteAnimationFlip'
               , 'SpriteColorOpacity'
               , 'SpriteAnimationCache'
               ]
//}}}

//{{{ Constants
var kTagTileMap         = 1
  , kTagSpriteBatchNode = 1
  , kTagNode            = 2
  , kTagAnimation1      = 1
  , kTagSpriteLeft      = 2
  , kTagSpriteRight     = 3

var kTagSprite1 = 1
  , kTagSprite2 = 2
  , kTagSprite3 = 3
  , kTagSprite4 = 4
  , kTagSprite5 = 5
  , kTagSprite6 = 6
  , kTagSprite7 = 7
  , kTagSprite8 = 8
//}}} Constants

//{{{ Test Actions
var tests = {
    sceneIdx: -1
  , next: function () {
        this.sceneIdx++
        this.sceneIdx = this.sceneIdx % testList.length

        var r = testList[this.sceneIdx]
        return this[r]
    }
  , back: function () {
        this.sceneIdx--
        if (this.sceneIdx < 0) {
            this.sceneIdx += testList.length
        }

        var r = testList[this.sceneIdx]
        return this[r]
    }
  , restart: function () {
        var r = testList[this.sceneIdx]
        return this[r]
    }
}
//}}} Test Actions

//{{{ SpriteDemo Base
function SpriteDemo () {
    SpriteDemo.superclass.constructor.call(this)

    var s = Director.sharedDirector.winSize

    var label = new Label({ string:   this.title
                          , fontName: 'Arial'
                          , fontSize: 26
                          })

    label.position = ccp(s.width / 2, s.height - 50)

    this.addChild({child: label
                  , z: 1
                  })



    if (this.subtitle) {
        label = new Label({string:    this.subtitle
                          , fontName: 'Thonburi'
                          , fontSize: 16
                          })

        label.position = ccp(s.width / 2, s.height - 80)

        this.addChild({child: label
                      , z: 1
                      })
    }


    var item1 = new MenuItemImage({ normalImage: path.join(__dirname, 'resources/b1.png')
                                  , selectedImage: path.join(__dirname, 'resources/b2.png')
                                  , callback: this.backCallback.bind(this)
                                  })
    var item2 = new MenuItemImage({ normalImage: path.join(__dirname, 'resources/r1.png')
                                  , selectedImage: path.join(__dirname, 'resources/r2.png')
                                  , callback: this.restartCallback.bind(this)
                                  })
    var item3 = new MenuItemImage({ normalImage: path.join(__dirname, 'resources/f1.png')
                                  , selectedImage: path.join(__dirname, 'resources/f2.png')
                                  , callback: this.nextCallback.bind(this)
                                  })

    var menu = new Menu({items: [item1, item2, item3]})

    menu.position  = ccp(0, 0)
    item1.position = ccp(s.width / 2 - 100, 30)
    item2.position = ccp(s.width / 2, 30)
    item3.position = ccp(s.width / 2 + 100, 30)

    this.addChild({child: menu
                  , z: 1
                  })
}

SpriteDemo.inherit(Layer, /** @lends SpriteDemo# */ {
    title: 'No title'
  , subtitle: null

  , restartCallback: function () {
        var director = Director.sharedDirector
          , scene = new Scene()
          , NextTest = tests.restart()

        scene.addChild(new NextTest)
        director.replaceScene(scene)
    }

  , backCallback: function () {
        var director = Director.sharedDirector
          , scene = new Scene()
          , NextTest = tests.back()

        scene.addChild(new NextTest)
        director.replaceScene(scene)
    }

  , nextCallback: function () {
        var director = Director.sharedDirector
          , scene = new Scene()
          , NextTest = tests.next()

        scene.addChild(new NextTest)
        director.replaceScene(scene)
    }
})
//}}} SpriteDemo Base

//{{{ Test: Sprite1
/**
 * @class
 *
 * Example Sprite 1
 */
function Sprite1 () {
    Sprite1.superclass.constructor.call(this)

    this.isMouseEnabled = true

    var s = Director.sharedDirector.winSize
    this.addNewSprite(ccp(s.width / 2, s.height / 2))
}
tests.Sprite1 = Sprite1

Sprite1.inherit(SpriteDemo, /** @lends Sprite1# */ {
    title: 'Sprite'
  , subtitle: 'Click screen'

  , addNewSprite: function (point) {
        var idx = Math.floor(Math.random() * 1400 / 100)
          , x = (idx % 5) * 85
          , y = (idx % 3) * 121

        var sprite = new Sprite({ file: path.join(__dirname, 'resources/grossini_dance_atlas.png')
                                , rect: new Rect(x, y, 85, 121)
                                })

        sprite.position = ccp(point.x, point.y)

        this.addChild({child: sprite
                      , z: 0
                      })

        var action
          , actionBack
          , seq
          , rand = Math.random()

        if (rand < 0.2) {
            action = new ScaleBy({ duration: 3
                                 , scale: 2
                                 })

        } else if (rand < 0.4) {
            action = new RotateBy({ duration: 3
                                  , angle: 360
                                  })

        } else if (rand < 0.6) {
            action = new Blink({ duration: 1
                               , blinks: 3
                               })

        } else if (rand < 0.8) {
            action = new RotateBy({ duration: 3
                                  , angle: 360
                                  })

            //action = cocos.TintBy.create({duration:3, scale:2})
        } else {
            action = new FadeOut({ duration: 2
                                 })
        }

        actionBack = action.reverse()
        seq = new Sequence({ actions: [action, actionBack] })
        sprite.runAction(new RepeatForever(seq))
    }

  , mouseUp: function (event) {
        var location = Director.sharedDirector.convertEventToCanvas(event)
        this.addNewSprite(location)

        return true
    }
})
//}}} Test: Sprite1

//{{{ Test: SpriteBatchNode1
/**
 * @class
 *
 * Example SpriteBatchNode 1
 */
function SpriteBatchNode1 () {
    SpriteBatchNode1.superclass.constructor.call(this)

    this.isMouseEnabled = true

    var batch = new SpriteBatchNode({ file: path.join(__dirname, '/resources/grossini_dance_atlas.png')
                                    , size: new Size(480, 320)
                                    })
    this.addChild({ child: batch
                  , tag: kTagSpriteBatchNode
                  , z: 0
                  })

    var s = Director.sharedDirector.winSize
    this.addNewSprite(ccp(s.width / 2, s.height / 2))
}
tests.SpriteBatchNode1 = SpriteBatchNode1

SpriteBatchNode1.inherit(SpriteDemo, /** @lends SpriteBatchNode1# */{
    title: 'SpriteBatchNode'
  , subtitle: 'Click screen'

  , addNewSprite: function (point) {
        var batch = this.getChild({tag: kTagSpriteBatchNode})
          , idx = Math.floor(Math.random() * 1400 / 100)
          , x = (idx % 5) * 85
          , y = (idx % 3) * 121

        var sprite = new Sprite({ textureAtlas: batch.textureAtlas
                                , rect: new Rect(x, y, 85, 121)
                                })

        sprite.position = ccp(point.x, point.y)

        batch.addChild({ child: sprite })

        var action
          , actionBack
          , seq
          , rand = Math.random()

        if (rand < 0.2) {
            action = new ScaleBy({ duration: 3
                                 , scale: 2
                                 })

        } else if (rand < 0.4) {
            action = new RotateBy({ duration: 3
                                  , angle: 360
                                  })

        } else if (rand < 0.6) {
            action = new Blink({ duration: 1
                               , blinks: 3
                               })

        } else if (rand < 0.8) {
            action = new RotateBy({ duration: 3
                                  , angle: 360
                                  })

            //action = cocos.TintBy.create({duration:3, scale:2})
        } else {
            action = new FadeOut({ duration: 2
                                 })
        }

        actionBack = action.reverse()
        seq = new Sequence({ actions: [action, actionBack] })
        sprite.runAction(new RepeatForever(seq))
    }

  , mouseUp: function (event) {
        var location = Director.sharedDirector.convertEventToCanvas(event)
        this.addNewSprite(location)

        return true
    }
})
//}}}

//{{{ Test: SpriteAnimationFlip
/**
 * @class
 *
 * Example Sprite Animation and flip
 */
function SpriteAnimationFlip () {
    SpriteAnimationFlip.superclass.constructor.call(this)

    var s = Director.sharedDirector.winSize

    var texture = new Texture2D({ file: path.join(__dirname, 'resources/animations/dragon_animation.png') })

    var animFrames = [ new SpriteFrame({ texture: texture, rect: new Rect(132 * 0, 132 * 0, 132, 132) })
                     , new SpriteFrame({ texture: texture, rect: new Rect(132 * 1, 132 * 0, 132, 132) })
                     , new SpriteFrame({ texture: texture, rect: new Rect(132 * 2, 132 * 0, 132, 132) })
                     , new SpriteFrame({ texture: texture, rect: new Rect(132 * 3, 132 * 0, 132, 132) })
                     , new SpriteFrame({ texture: texture, rect: new Rect(132 * 0, 132 * 1, 132, 132) })
                     , new SpriteFrame({ texture: texture, rect: new Rect(132 * 1, 132 * 1, 132, 132) })
                     ]

    var sprite = new Sprite({ frame: animFrames[0] })
    sprite.position = ccp(s.width / 2 - 80, s.height / 2)

    this.addChild(sprite)

    var animation = new Animation({ frames: animFrames, delay: 0.2 })
      , animate   = new Animate({ animation: animation, restoreOriginalFrame: false })
      , seq       = new Sequence({ actions: [ animate
                                            , new FlipX({flipX: true})
                                            , animate.copy()
                                            , new FlipX({flipX: false})
                                            ]
                                 })

    sprite.runAction(new RepeatForever(seq))

}
tests.SpriteAnimationFlip = SpriteAnimationFlip

SpriteAnimationFlip.inherit(SpriteDemo, /** @lends SpriteAnimationFlip# */{
    title: 'Sprite Animation + Flip'
})
//}}}

//{{{ Test: SpriteAnchorPoint
/**
 * @class
 *
 * Example Sprite Anchor Point
 */
function SpriteAnchorPoint () {
    SpriteAnchorPoint.superclass.constructor.call(this)

    var s = Director.sharedDirector.winSize

    var rotate = new RotateBy({ duration: 10, angle: 360 })
      , action = new RepeatForever(rotate)
      , sprite
      , point
      , copy
      , i

    for (i = 0; i < 3; i++) {
        sprite = new Sprite({ file: path.join(__dirname, 'resources/grossini_dance_atlas.png')
                            , rect: new Rect(85 * i, 121 * 1, 85, 121)
                            })
        sprite.position = ccp(s.width / 4 * (i + 1), s.height / 2)

        point = new Sprite({ file: path.join(__dirname, 'resources/r1.png') })
        point.scale = 0.25
        point.position = sprite.position
        this.addChild({ child: point
                      , z: 10
                      })

        switch (i) {
        case 0:
            sprite.anchorPoint = ccp(0, 0)
            break
        case 1:
            sprite.anchorPoint = ccp(0.5, 0.5)
            break
        case 2:
            sprite.anchorPoint = ccp(1, 1)
            break
        }

        point.position = sprite.position

        copy = action.copy()
        sprite.runAction(copy)
        this.addChild({ child: sprite
                      , z: 1
                      })
    }
}

tests.SpriteAnchorPoint = SpriteAnchorPoint

SpriteAnchorPoint.inherit(SpriteDemo, /** @lends SpriteAnchorPoint# */ {
    title: 'Sprite Anchor Point'
})
//}}}

//{{{ Test: SpriteZOrder
/**
 * @class
 *
 * Example Sprite Z ORder
 */
function SpriteZOrder () {
    SpriteZOrder.superclass.constructor.call(this)

    var s = Director.sharedDirector.winSize
      , step = s.width / 11
      , sprite
      , i

    for (i = 0; i < 5; i++) {
        sprite = new Sprite({ file: path.join(__dirname, 'resources/grossini_dance_atlas.png')
                            , rect: new Rect(85 * 0, 121 * 1, 85, 121)
                            })
        sprite.position = ccp((i + 1) * step, s.height / 2)
        this.addChild({ child: sprite
                      , z: i
                      })
    }

    for (i = 5; i < 10; i++) {
        sprite = new Sprite({ file: path.join(__dirname, 'resources/grossini_dance_atlas.png')
                            , rect: new Rect(85 * 1, 121 * 0, 85, 121)
                            })
        sprite.position = ccp((i + 1) * step, s.height / 2)
        this.addChild({ child: sprite
                      , z: 14 - i
                      })
    }

    sprite = new Sprite({ file: path.join(__dirname, 'resources/grossini_dance_atlas-red.png')
                        , rect: new Rect(85 * 3, 121 * 0, 85, 121)
                        })
    sprite.position = ccp(s.width / 2, s.height / 2 + 20)
    sprite.scaleX = 6
    this.addChild({ child: sprite
                  , tag: kTagSprite1
                  , z: -1
                  })


    Scheduler.get('sharedScheduler').schedule({ target: this
                                       , method: this.reorderSprite
                                       , interval: 1
                                       })
}

tests.SpriteZOrder = SpriteZOrder
SpriteZOrder.inherit(SpriteDemo, /** @lends SpriteZOrder# */ {
    title: 'Sprite Z Order'
  , dir: 1

  , reorderSprite: function (dt) {
        var sprite = this.getChild({ tag: kTagSprite1 })
          , z = sprite.zOrder

        if (z < -1) {
            this.dir = 1
        }
        if (z > 10) {
            this.dir = -1
        }

        z += this.dir * 3

        this.reorderChild({ child: sprite
                          , z: z
                          })
    }
})
//}}}

//{{{ Test: SpriteAnimationCache
/**
 * @class
 *
 * Example using AnimationCache and loading from a Zwoptex .plist file
 */
function SpriteAnimationCache () {
    SpriteAnimationCache.superclass.constructor.call(this)

    var frameCache = SpriteFrameCache.get('sharedSpriteFrameCache')
      , animCache  = AnimationCache.get('sharedAnimationCache')

    frameCache.addSpriteFrames({ file: path.join(__dirname, 'resources/animations/grossini.plist') })
    frameCache.addSpriteFrames({ file: path.join(__dirname, 'resources/animations/grossini_gray.plist') })
    frameCache.addSpriteFrames({ file: path.join(__dirname, 'resources/animations/grossini_blue.plist') })


    // create 'dance' animation
    var animFrames = []
      , frame
      , i
    for (i = 1; i < 15; i++) {
        frame = frameCache.getSpriteFrame({ name: 'grossini_dance_' + (i >= 10 ? i : '0' + i) + '.png' })
        animFrames.push(frame)
    }

    var animation = new Animation({ frames: animFrames
                                  , delay: 0.2
                                  })

    // Add an animation to the Cache
    animCache.addAnimation({ animation: animation
                           , name: 'dance'
                           })


    // create animation 'dance gray'
    animFrames = []
    for (i = 1; i < 15; i++) {
        frame = frameCache.getSpriteFrame({ name: 'grossini_dance_gray_' + (i >= 10 ? i : '0' + i) + '.png' })
        animFrames.push(frame)
    }

    animation = new Animation({ frames: animFrames
                              , delay: 0.2
                              })

    // Add an animation to the Cache
    animCache.addAnimation({ animation: animation
                           , name: 'dance_gray'
                           })


    // create animation 'dance blue'
    animFrames = []
    for (i = 1; i < 4; i++) {
        frame = frameCache.getSpriteFrame({ name: 'grossini_blue_0' + i + '.png' })
        animFrames.push(frame)
    }

    animation = new Animation({ frames: animFrames
                              , delay: 0.2
                              })

    // Add an animation to the Cache
    animCache.addAnimation({ animation: animation
                           , name: 'dance_blue'
                           })


    var normal     = animCache.getAnimation({ name: 'dance' })
      , dance_gray = animCache.getAnimation({ name: 'dance_gray' })
      , dance_blue = animCache.getAnimation({ name: 'dance_blue' })

    var animN = new Animate({ animation: normal })
      , animG = new Animate({ animation: dance_gray })
      , animB = new Animate({ animation: dance_blue })

    var seq = new Sequence({ actions: [animN, animG, animB] })

    // create an sprite without texture
    var grossini = new Sprite()

    var winSize = Director.sharedDirector.winSize

    grossini.position = ccp(winSize.width / 2, winSize.height / 2)

    this.addChild({ child: grossini })


    // run the animation
    grossini.runAction(seq)
}
tests.SpriteAnimationCache = SpriteAnimationCache
SpriteAnimationCache.inherit(SpriteDemo, /** @lends SpriteAnimationCache# */ {
    title: 'AnimationCache'
  , subtitle: 'Sprite should be animated'
})
//}}}

//{{{ Test: SpriteColorOpacity
function SpriteColorOpacity () {
    SpriteColorOpacity.superclass.constructor.call(this)

    var sprite1 = new Sprite({ file: path.join(__dirname, 'resources/grossini_dance_atlas.png'), rect: new Rect(85 * 0, 121 * 1, 85, 121) })
      , sprite2 = new Sprite({ file: path.join(__dirname, 'resources/grossini_dance_atlas.png'), rect: new Rect(85 * 1, 121 * 1, 85, 121) })
      , sprite3 = new Sprite({ file: path.join(__dirname, 'resources/grossini_dance_atlas.png'), rect: new Rect(85 * 2, 121 * 1, 85, 121) })
      , sprite4 = new Sprite({ file: path.join(__dirname, 'resources/grossini_dance_atlas.png'), rect: new Rect(85 * 3, 121 * 1, 85, 121) })
      , sprite5 = new Sprite({ file: path.join(__dirname, 'resources/grossini_dance_atlas.png'), rect: new Rect(85 * 0, 121 * 1, 85, 121) })
      , sprite6 = new Sprite({ file: path.join(__dirname, 'resources/grossini_dance_atlas.png'), rect: new Rect(85 * 1, 121 * 1, 85, 121) })
      , sprite7 = new Sprite({ file: path.join(__dirname, 'resources/grossini_dance_atlas.png'), rect: new Rect(85 * 2, 121 * 1, 85, 121) })
      , sprite8 = new Sprite({ file: path.join(__dirname, 'resources/grossini_dance_atlas.png'), rect: new Rect(85 * 3, 121 * 1, 85, 121) })

    var s = Director.sharedDirector.winSize

    sprite1.position = ccp((s.width / 5) * 1, (s.height / 3) * 1)
    sprite2.position = ccp((s.width / 5) * 2, (s.height / 3) * 1)
    sprite3.position = ccp((s.width / 5) * 3, (s.height / 3) * 1)
    sprite4.position = ccp((s.width / 5) * 4, (s.height / 3) * 1)

    sprite5.position = ccp((s.width / 5) * 1, (s.height / 3) * 2)
    sprite6.position = ccp((s.width / 5) * 2, (s.height / 3) * 2)
    sprite7.position = ccp((s.width / 5) * 3, (s.height / 3) * 2)
    sprite8.position = ccp((s.width / 5) * 4, (s.height / 3) * 2)

    var action = new FadeIn({ duration: 3 })
      , actionBack = action.reverse()
      , fade = new RepeatForever(Sequence.create({actions: [action, actionBack]}))

    /*
    id tintred = [CCTintBy actionWithDuration:2 red:0 green:-255 blue:-255]
    id tintred_back = [tintred reverse]
    id red = [CCRepeatForever actionWithAction: [CCSequence actions: tintred, tintred_back, nil]]

    id tintgreen = [CCTintBy actionWithDuration:2 red:-255 green:0 blue:-255]
    id tintgreen_back = [tintgreen reverse]
    id green = [CCRepeatForever actionWithAction: [CCSequence actions: tintgreen, tintgreen_back, nil]]

    id tintblue = [CCTintBy actionWithDuration:2 red:-255 green:-255 blue:0]
    id tintblue_back = [tintblue reverse]
    id blue = [CCRepeatForever actionWithAction: [CCSequence actions: tintblue, tintblue_back, nil]]
    */


    /*
    [sprite5 runAction:red]
    [sprite6 runAction:green]
    [sprite7 runAction:blue]
    */
    sprite8.runAction(fade)

    // late add: test dirtyColor and dirtyPosition
    this.addChild({ child: sprite1, z: 0, tag: kTagSprite1 })
    this.addChild({ child: sprite2, z: 0, tag: kTagSprite2 })
    this.addChild({ child: sprite3, z: 0, tag: kTagSprite3 })
    this.addChild({ child: sprite4, z: 0, tag: kTagSprite4 })
    this.addChild({ child: sprite5, z: 0, tag: kTagSprite5 })
    this.addChild({ child: sprite6, z: 0, tag: kTagSprite6 })
    this.addChild({ child: sprite7, z: 0, tag: kTagSprite7 })
    this.addChild({ child: sprite8, z: 0, tag: kTagSprite8 })


    Scheduler.get('sharedScheduler').schedule({target: this, method: this.removeAndAddSprite, interval: 2})
}
tests.SpriteColorOpacity = SpriteColorOpacity
SpriteColorOpacity.inherit(SpriteDemo, /** @lends SpriteColorOpacity# */ {
    title: 'Sprite: Opacity'

  , removeAndAddSprite: function () {
        var sprite = this.getChild({ tag: kTagSprite5 })

        this.removeChild({ child: sprite, cleanup: false })
        this.addChild({ child: sprite, z: 0, tag: kTagSprite5 })
    }
})
//}}}

//{{{ Initialisation
exports.main = function () {
    // Initialise test
    var director = Director.sharedDirector

    director.displayFPS = true

    events.addListener(director, 'ready', function (director) {
        var scene = new Scene()
          , nextTest = tests.next()
        scene.addChild({child: new nextTest()})
        director.replaceScene(scene)
    })

    director.runPreloadScene()
}
//}}}

// vim:et:st=4:fdm=marker:fdl=0:fdc=1
