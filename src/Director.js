'use strict'

var util   = require('util')
  , events = require('events')
  , geo    = require('geometry')
  , ccp    = geo.ccp

var EventDispatcher = require('./EventDispatcher').EventDispatcher
  , TouchDispatcher = require('./TouchDispatcher').TouchDispatcher
  , Scheduler       = require('./Scheduler').Scheduler

/**
 * Create a new instance of Director. This is a singleton so you shouldn't use
 * the constructor directly. Instead grab the shared instance using the
 * cocos.Director.sharedDirector property.
 *
 * @class
 * Creates and handles the main view and manages how and when to execute the
 * Scenes.
 *
 * This class is a singleton so don't instantiate it yourself, instead use
 * cocos.Director.sharedDirector to return the instance.
 *
 * @memberOf cocos
 * @singleton
 */
function Director () {
    if (Director._instance) {
        throw new Error('Director instance already exists')
    }

    this.sceneStack = []
    this.window   = parent.window
    this.document = this.window.document

    // Prevent writing to some properties
    util.makeReadonly(this, 'canvas context sceneStack winSize isReady document window container isTouchScreen isMobile'.w)
}

Director.inherit(Object, /** @lends cocos.Director# */ {
    /**
     * Background colour of the canvas. It can be any valid CSS colour.
     * @type String
     */
    backgroundColor: 'rgb(0, 0, 0)'

    /**
     * DOM Window of the containing page
     *
     * The global 'window' property is a sandbox and not the global of the
     * containing page. If you need to access the real window, use this
     * property.
     *
     * @type DOMWindow
     * @readonly
     */
  , window: null

    /**
     * DOM Document of the containing page
     *
     * The global 'document' property is a sandbox and not the global of the
     * containing page. If you need to access the real document, use this
     * property.
     *
     * @type Document
     * @readonly
     */
  , document: null

    /**
     * Container DIV around the canvas
     *
     * This element is created dynamically. Its parent is the HTML element the
     * script was added into.
     *
     * @type HTMLDivElement
     * @readonly
     */
  , container: null

    /**
     * Canvas HTML element
     * @type HTMLCanvasElement
     * @readonly
     */
  , canvas: null

    /**
     * Canvas rendering context
     * @type CanvasRenderingContext2D
     * @readonly
     */
  , context: null

    /**
     * Stack of scenes
     * @type cocos.nodes.Scene[]
     * @readonly
     */
  , sceneStack: null

    /**
     * Size of the canvas
     * @type geometry.Size
     * @readonly
     */
  , winSize: null

    /**
     * Whether the scene is paused. When true the framerate will drop to conserve CPU
     * @type Boolean
     */
  , isPaused: false

    /**
     * Maximum possible framerate
     * @type Integer
     */
  , maxFrameRate: 30

    /**
     * Should the framerate be drawn in the corner
     * @type Boolean
     */
  , displayFPS: false

    /**
     * Scene that draws the preload progres bar
     * @type cocos.nodes.PreloadScene
     */
  , preloadScene: null

    /**
     * Has everything been preloaded and ready to use
     * @type Boolean
     * @readonly
     */
  , isReady: false

    /**
     * Is this running on a touchscreen device. e.g. iPhone or iPad
     * @type Boolean
     * @readonly
     */
  , isTouchScreen: false

    /**
     * Are we running on a mobile device?
     * @type Boolean
     * @readonly
     */
  , isMobile: false


    /**
     * Number of milliseconds since last frame
     * @type Float
     * @readonly
     */
  , dt: 0

    /**
     * The current orientation. Only available on mobile devices
     * @type String
     * @readonly
     */
  , orientation: 'unknown'

    /**
     * @private
     */
  , _nextDeltaTimeZero: false

    /**
     * @private
     * @type Float
     */
  , _lastUpdate: 0

    /**
     * @private
     * @type cocos.nodes.Scene
     */
  , _nextScene: null

  , _forcedOrientation: null

    /**
     * Make the canvas fullscreen.
     * On mobile devices this will try to set the viewport to avoid scaling the canvas
     */
  , fullscreen: function () {
        throw new Error("Fullscreen is not implemented on non-mobile devices yet")
    }

    /**
     * Resize the canvas to any size
     *
     * @param {Float} width The new width of the canvas
     * @param {Float} height The new height of the canvas
     */
  , resize: function (width, height) {
        if (!this.container) {
            return
        }

        events.trigger(this, 'beforeresize', {newSize: new geo.Size(width, height)})

        this.container.style.width = width + 'px'
        this.container.style.height = height + 'px'
        this.canvas.width = width
        this.canvas.height = height

        this._winSize = new geo.Size(width, height)

        var viewWidth = this.container.offsetWidth
          , viewHeight = this.container.offsetHeight
        this._viewSize = new geo.Size(viewWidth, viewHeight)
        this._viewScale = new geo.Size(width / viewWidth, height / viewHeight)


        if (FLIP_Y_AXIS) {
            this.context.translate(0, height)
            this.context.scale(1, -1)
        }

        events.trigger(this, 'resize')
    }

    /**
     * Append to an HTML element. It will create this canvas tag and attach
     * event listeners
     *
     * @param {HTMLElement} view Any HTML element to add the application to
     */
  , attachInView: function (view) {
        var document = this.document

        view = view || window.container || document.body

        while (view.firstChild) {
            view.removeChild(view.firstChild)
        }

        // Wrapper <div> which can be used for adding special HTML elements if required
        var container = this._container = document.createElement('div')
        container.style.position = 'relative'
        container.style.overflow = 'hidden'
        view.appendChild(container)

        var canvas = document.createElement('canvas')
        canvas.style.verticalAlign = 'bottom'
        this._canvas = canvas

        var context = canvas.getContext('2d')
        this._context = context

        this.resize(view.clientWidth, view.clientHeight)

        container.appendChild(canvas)

        this._setupEventCapturing()

        if (this._isFullscreen) {
            this.fullscreen()
        }
    }

  , _setupEventCapturing: function () {
        var document = this.document
          , canvas = this.canvas

        var eventDispatcher = EventDispatcher.sharedDispatcher

        this._setupMouseEventCapturing()

        // Keyboard events
        function keyDown(evt) {
            this._keysDown = this._keysDown || {}
            eventDispatcher.keyDown(evt)
        }
        function keyUp(evt) {
            eventDispatcher.keyUp(evt)
        }

        document.documentElement.addEventListener('keydown', keyDown, false)
        document.documentElement.addEventListener('keyup', keyUp, false)
    }

  , _setupMouseEventCapturing: function () {
        var document = this.document
          , canvas = this.canvas

        var eventDispatcher = EventDispatcher.sharedDispatcher

        var mouseDown = function (evt) {
            evt.locationInWindow = ccp(evt.clientX, evt.clientY)
            evt.locationInCanvas = this.convertEventToCanvas(evt)

            var mouseDragged = function (evt) {
                evt.locationInWindow = ccp(evt.clientX, evt.clientY)
                evt.locationInCanvas = this.convertEventToCanvas(evt)

                eventDispatcher.mouseDragged(evt)
            }.bind(this)

            var mouseUp = function (evt) {
                evt.locationInWindow = ccp(evt.clientX, evt.clientY)
                evt.locationInCanvas = this.convertEventToCanvas(evt)

                document.body.removeEventListener('mousemove', mouseDragged, false)
                document.body.removeEventListener('mouseup',   mouseUp,   false)


                eventDispatcher.mouseUp(evt)
            }.bind(this)

            document.body.addEventListener('mousemove', mouseDragged, false)
            document.body.addEventListener('mouseup',   mouseUp,   false)

            eventDispatcher.mouseDown(evt)
        }.bind(this)

        var mouseMoved = function (evt) {
            evt.locationInWindow = ccp(evt.clientX, evt.clientY)
            evt.locationInCanvas = this.convertEventToCanvas(evt)

            eventDispatcher.mouseMoved(evt)
        }.bind(this)

        canvas.addEventListener('mousedown', mouseDown, false)
        canvas.addEventListener('mousemove', mouseMoved, false)
    }

    /**
     * Create and push a Preload Scene which will draw a progress bar while
     * also preloading all assets.
     *
     * If you wish to customise the preload scene first inherit from cocos.nodes.PreloadScene
     * and then set Director.sharedDirector.preloadScene to an instance of your PreloadScene
     */
  , runPreloadScene: function () {
        if (!this.canvas) {
            this.attachInView()
        }

        var preloader = this.preloadScene
        if (!preloader) {
            var PreloadScene = this.preloadSceneConstructor || require('./nodes/ProgressBarPreloadScene').ProgressBarPreloadScene
            preloader = new PreloadScene()
            this.preloadScene = preloader
        }

        events.addListener(preloader, 'complete', function (preloader) {
            this._isReady = true
            events.trigger(this, 'ready', this)
        }.bind(this))

        this.pushScene(preloader)
        this.startAnimation()
    }

    /**
     * Enters the Director's main loop with the given Scene. Call it to run
     * only your FIRST scene. Don't call it if there is already a running
     * scene.
     *
     * @param {cocos.nodes.Scene} scene The scene to start
     */
  , runWithScene: function (scene) {
        var Scene = require('./nodes/Scene').Scene
        if (!(scene instanceof Scene)) {
            throw new Error("Director.runWithScene must be given an instance of Scene")
        }

        if (this._runningScene) {
            throw new Error("You can't run a Scene if another Scene is already running. Use replaceScene or pushScene instead")
        }

        this.pushScene(scene)
        this.startAnimation()
    }

    /**
     * Replaces the running scene with a new one. The running scene is
     * terminated. ONLY call it if there is a running scene.
     *
     * @param {cocos.nodes.Scene} scene The scene to replace with
     */
  , replaceScene: function (scene) {
        var Scene = require('./nodes/Scene').Scene
        if (!(scene instanceof Scene)) {
            throw new Error("Director.replaceScene must be given an instance of Scene")
        }
        var index = this.sceneStack.length

        this._sendCleanupToScene = true
        this.sceneStack.pop()
        this.sceneStack.push(scene)
        this._nextScene = scene
    }

    /**
     * Pops out a scene from the queue. This scene will replace the running
     * one. The running scene will be deleted. If there are no more scenes in
     * the stack the execution is terminated. ONLY call it if there is a
     * running scene.
     */
  , popScene: function () {
      throw new Error("Not implemented yet")
    }

    /**
     * Suspends the execution of the running scene, pushing it on the stack of
     * suspended scenes. The new scene will be executed. Try to avoid big
     * stacks of pushed scenes to reduce memory allocation. ONLY call it if
     * there is a running scene.
     *
     * @param {cocos.Scene} scene The scene to add to the stack
     */
  , pushScene: function (scene) {
        var Scene = require('./nodes/Scene').Scene
        if (!(scene instanceof Scene)) {
            throw new Error("Director.pushScene must be given an instance of Scene")
        }
        this._nextScene = scene
    }

    /**
     * The main loop is triggered again. Call this function only if
     * cocos.Directory#stopAnimation was called earlier.
     */
  , startAnimation: function () {
        if (!this.canvas) {
            this.attachInView()
        }

        this._animating = true
        this.animate()
    }

    /**
     * Draws the scene after waiting for the next animation frame time. This
     * controls the framerate.
     */
  , animate: function() {
        if (this._animating) {
            this.drawScene()
            this.animate._bound = this.animate._bound || this.animate.bind(this)
            window.requestAnimationFrame(this.animate._bound, this.canvas)
        }
    }

    /**
     * Stops the animation. Nothing will be drawn. The main loop won't be
     * triggered anymore. If you want to pause your animation call
     * cocos.Directory#pause instead.
     */
  , stopAnimation: function () {
        if (this._animationTimer) {
            clearInterval(this._animationTimer)
            this._animationTimer = null
        }
        this._animating = false
    }

    /**
     * @private
     * Calculate time since last call
     */
  , _calculateDeltaTime: function () {
        var now = (new Date()).getTime() / 1000

        if (this._nextDeltaTimeZero) {
            this.dt = 0
            this._nextDeltaTimeZero = false
        }

        this.dt = Math.max(0, now - this._lastUpdate)

        this._lastUpdate = now
    }

    /**
     * @private
     * The main run loop
     */
  , drawScene: function () {
        this._calculateDeltaTime()

        if (!this.isPaused) {
            Scheduler.sharedScheduler.tick(this.dt)
        }


        var context = this.context
        context.fillStyle = this.backgroundColor
        context.fillRect(0, 0, this.winSize.width, this.winSize.height)
        //this.canvas.width = this.canvas.width


        if (this._nextScene) {
            this._setNextScene()
        }

        // TODO partial redrawing
        var rect = new geo.Rect(0, 0, this.winSize.width, this.winSize.height)

        this._runningScene.visit(context, rect)

        if (this.displayFPS) {
            this._showFPS()
        }
    }

    /**
     * @private
     * Initialises the next scene
     */
  , _setNextScene: function () {
        // TODO transitions

        if (this._runningScene) {
            this._runningScene.onExit()
            if (this._sendCleanupToScene) {
                this._runningScene.cleanup()
            }
        }

        this._runningScene = this._nextScene

        this._nextScene = null

        this._runningScene.onEnter()
    }

     /**
      * Convert the coordinates in a mouse event so they're relative to the corner of the canvas
      *
      * @param {MouseEvent} evt
      */
  , convertEventToCanvas: function (evt) {
        return this.convertLocationToCanvas(evt.locationInWindow)
    }

  , convertLocationToCanvas: function (loc, noScroll) {
        var x = this.canvas.offsetLeft - (noScroll ? 0 : document.documentElement.scrollLeft)
          , y = this.canvas.offsetTop  - (noScroll ? 0 : document.documentElement.scrollTop)

        var o = this.canvas
        while ((o = o.offsetParent)) {
            x += o.offsetLeft - (noScroll ? 0 : o.scrollLeft)
            y += o.offsetTop  - (noScroll ? 0 : o.scrollTop)
        }

        var p = geo.ccpSub(loc, ccp(x, y))
        if (FLIP_Y_AXIS) {
            p.y = this._viewSize.height - p.y
        }

        p.x = p.x * this._viewScale.width
        p.y = p.y * this._viewScale.height

        return p
    }

  , convertTouchToCanvas: function (touch) {
        return this.convertLocationToCanvas(new geo.Point(touch.pageX, touch.pageY), true)
    }

    /**
     * @private
     * Draw the FPS counter
     */
  , _showFPS: function () {
        if (!this._fpsLabel) {
            var Label = require('./nodes/Label').Label
            this._fpsLabel = new Label({string: '', fontSize: 16})
            this._fpsLabel.anchorPoint = ccp(0, 0)
            this._fpsLabel.position = ccp(10, 10)
            this._frames = 0
            this._accumDt = 0
        }


        this._frames++
        this._accumDt += this.dt

        if (this._accumDt > 1.0 / 3.0)  {
            var frameRate = this._frames / this._accumDt
            this._frames = 0
            this._accumDt = 0

            this._fpsLabel.string = 'FPS: ' + (Math.round(frameRate * 100) / 100).toString()
        }



        this._fpsLabel.visit(this.context)
    }

})

Object.defineProperty(Director, 'sharedDirector', {
    /**
     * A shared singleton instance of cocos.Director
     *
     * @memberOf cocos.Director
     * @getter {cocos.Director} sharedDirector
     */
    get: function () {
        if (!Director._instance) {
            if (window.navigator.userAgent.match(/(iPhone|iPod|iPad|Android)/)) {
                Director._instance = new DirectorTouchScreen()
            } else {
                Director._instance = new this()
            }
        }

        return Director._instance
    }

  , enumerable: true
})

/**
 * @class
 * The Director singleton used on touch screen devices such as the iPhone, iPod and iPad
 *
 * @memberOf cocos
 * @extends cocos.Director
 */
function DirectorTouchScreen () {
    DirectorTouchScreen.superclass.constructor.call(this)

    // Hardcode some viewport sizes for iOS devices
    var ua = window.navigator.userAgent
    if (ua.match(/(iPhone|iPod)/)) {
        this.viewportSize = { portrait:  new geo.Size(320, 416)
                            , landscape: new geo.Size(480, 268)
                            }
    } else if (ua.match(/(iPad)/)) {
        this.viewportSize = { portrait:  new geo.Size(768, 928)
                            , landscape: new geo.Size(1024, 672)
                            }
    }
}

DirectorTouchScreen.inherit(Director, /** @lends cocos.DirectorTouchScreen */ {
    isTouchScreen: true

  , isMobile: true

  , viewportSize: null

    /**
     * Force the device to prevent scaling and expand the canvas to fill the entire available screen area
     */
  , fullscreen: function () {
        this._isFullscreen = true
        if (!this._container) {
            return // Wait to be attached to view
        }

        var viewport = this.document.querySelector('meta[name=viewport]')
        if (!viewport) {
            viewport = this.document.createElement('meta')
            viewport.setAttribute('name', 'viewport')
            this.document.querySelector('head').appendChild(viewport)
        }

        this.container.style.position = 'fixed'
        this.container.style.left     = 0
        this.container.style.top      = 0

        events.addListener(this, 'orientationchange', this._adjustFullscreen.bind(this))
        this.document.body.addEventListener('touchstart', function (e) {
            this.window.scrollTo(0, 0)
            e.preventDefault()
        }.bind(this))
        this._adjustFullscreen()
    }

    /**
     * @private
     */
  , _adjustFullscreen: function () {
        if (!this._container) {
            return
        }

        var vp
        if (this._forcedOrientation == 'landscape' || this.orientation.match(/landscape/)) {
            vp = this.viewportSize.landscape
        } else {
            vp = this.viewportSize.portrait
        }
        this.resize(vp.width, vp.height)

        var viewport = this.document.querySelector('meta[name=viewport]')
        viewport.setAttribute('content', 'initial-scale=1.0, minimum-scale=1.0, maximum-scale=1.0, user-scalable=no, width=' + this._winSize.width + ', height=' + this._winSize.height)

        // Rotate canvas to fake orientation
        /* TODO
        if (this._forcedOrientation == 'landscape' && !this.orientation.match(/landscape/)) {
            this.container.style.WebkitTransformOrigin = '0 0'
            this.container.style.WebkitTransform = 'translate(320px, 0) rotate(90deg)'
        } else {
            this.container.style.WebkitTransform = 'none'
        }
        */

        this.window.scrollTo(0, 0)
    }

    /**
     * Forces the screen orientation on a mobile device
     */
  , forceOrientation: function (orientation) {
        this._forcedOrientation = orientation
        if (this._isFullscreen) {
            this._adjustFullscreen()
        }
    }

  , _setupEventCapturing: function () {
        var document = this.document

        this._setupTouchEventCapturing()

        // Orientation detection
        if (typeof top.window.orientation != 'undefined') {
            this._updateOrientation()
            document.body.addEventListener('orientationchange', this._updateOrientation.bind(this), false)
        }

    }

  , _setupTouchEventCapturing: function () {
        var document = this.document
          , canvas = this.canvas

        // Touch events
        var eventDispatcher = TouchDispatcher.sharedDispatcher

        var touchStart = function (evt) {
            eventDispatcher.touchesBegan(evt)
        }.bind(this)

        var touchMove = function (evt) {
            eventDispatcher.touchesMoved(evt)
        }.bind(this)

        var touchEnd = function (evt) {
            eventDispatcher.touchesEnded(evt)
        }.bind(this)

        var touchCancel = function (evt) {
            eventDispatcher.touchesCancelled(evt)
        }.bind(this)

        canvas.addEventListener('touchstart',  touchStart,  false)
        canvas.addEventListener('touchmove',   touchMove,   false)
        canvas.addEventListener('touchend',    touchEnd,    false)
        canvas.addEventListener('touchcancel', touchCancel, false)
    }

  , _updateOrientation: function () {
        switch (top.window.orientation) {
        case 0:
            this.orientation = 'portrait'
            break

        case 90:
            this.orientation = 'landscapeLeft'
            break

        case -90:
            this.orientation = 'landscapeRight'
            break

        case 180:
            this.orientation = 'portraitUpsideDown'
            break
        }

        events.trigger(this, 'orientationchange')
    }

})

/**
 * @class
 * Pretends to run at a constant frame rate even if it slows down
 *
 * @memberOf cocos
 * @extends cocos.Director
 */
function DirectorFixedSpeed () {
    DirectorFixedSpeed.superclass.constructor.call(this)
}
DirectorFixedSpeed.inherit(Director, /** @lends cocos.DirectorFixedSpeed */ {
    /**
     * Frames per second to draw.
     * @type Integer
     */
    frameRate: 60

    /**
     * Calculate time since last call
     * @private
     */
  , _calculateDeltaTime: function () {
        if (this._nextDeltaTimeZero) {
            this.dt = 0
            this._nextDeltaTimeZero = false
        }

        this.dt = 1.0 / this.frameRate
    }

    /**
     * The main loop is triggered again. Call this function only if
     * cocos.Directory#stopAnimation was called earlier.
     */
  , startAnimation: function () {
        this._animationTimer = setInterval(this.drawScene.bind(this), 1000 / this.frameRate)
        this.drawScene()
    }
  }
)
Object.defineProperty(DirectorFixedSpeed, 'sharedDirector', Object.getOwnPropertyDescriptor(Director, 'sharedDirector'))

exports.Director = Director
exports.DirectorFixedSpeed = DirectorFixedSpeed

// vim:et:st=4:fdm=marker:fdl=0:fdc=1
