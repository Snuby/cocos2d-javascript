'use strict'

var util   = require('util')
  , events = require('events')
  , geo    = require('geometry')
  , ccp    = geo.ccp

var EventDispatcher = require('./EventDispatcher').EventDispatcher
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
    util.makeReadonly(this, 'canvas context sceneStack winSize isReady document window'.w)
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
     * Number of milliseconds since last frame
     * @type Float
     * @readonly
     */
  , dt: 0


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

    /**
     * Append to an HTML element. It will create this canvas tag and attach
     * event listeners
     *
     * @param {HTMLElement} view Any HTML element to add the application to
     */
  , attachInView: function (view) {
        var document = this.document

        view = view || document.getElementById(CONTAINER_ID) || document.body

        while (view.firstChild) {
            view.removeChild(view.firstChild)
        }

        var canvas = document.createElement('canvas')
        canvas.style.verticalAlign = 'bottom'
        this._canvas = canvas
        canvas.setAttribute('width', view.clientWidth)
        canvas.setAttribute('height', view.clientHeight)

        var context = canvas.getContext('2d')
        this._context = context

        if (FLIP_Y_AXIS) {
            context.translate(0, view.clientHeight)
            context.scale(1, -1)
        }

        view.appendChild(canvas)

        this._winSize = {width: view.clientWidth, height: view.clientHeight}


        // Setup event handling

        // Mouse events
        var eventDispatcher = EventDispatcher.sharedDispatcher
          , mouseDown = function (evt) {
                evt.locationInWindow = ccp(evt.clientX, evt.clientY)
                evt.locationInCanvas = this.convertEventToCanvas(evt)

                var mouseDragged = function (evt) {
                        evt.locationInWindow = ccp(evt.clientX, evt.clientY)
                        evt.locationInCanvas = this.convertEventToCanvas(evt)

                        eventDispatcher.mouseDragged(evt)
                    }.bind(this)
                  , mouseUp = function (evt) {
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

          , mouseMoved = function (evt) {
                evt.locationInWindow = ccp(evt.clientX, evt.clientY)
                evt.locationInCanvas = this.convertEventToCanvas(evt)

                eventDispatcher.mouseMoved(evt)
            }.bind(this)

        canvas.addEventListener('mousedown', mouseDown, false)
        canvas.addEventListener('mousemove', mouseMoved, false)

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

    /**
     * Create and push a Preload Scene which will draw a progress bar while
     * also preloading all assets.
     *
     * If you wish to customise the preload scene first inherit from cocos.nodes.PreloadScene
     * and then set Director#preloadScene to an instance of your PreloadScene
     */
  , runPreloadScene: function () {
        if (!this.canvas) {
            this.attachInView()
        }

        var preloader = this.preloadScene
        if (!preloader) {
            var PreloadScene = require('./nodes/PreloadScene').PreloadScene
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
     * @param {cocos.Scene} scene The scene to start
     */
  , runWithScene: function (scene) {
        var Scene = require('./nodes/Scene').Scene
        if (!(scene instanceof Scene)) {
            throw "Director.runWithScene must be given an instance of Scene"
        }

        if (this._runningScene) {
            throw "You can't run a Scene if another Scene is already running. Use replaceScene or pushScene instead"
        }

        this.pushScene(scene)
        this.startAnimation()
    }

    /**
     * Replaces the running scene with a new one. The running scene is
     * terminated. ONLY call it if there is a running scene.
     *
     * @param {cocos.Scene} scene The scene to replace with
     */
  , replaceScene: function (scene) {
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

        var rect = new geo.Rect(0, 0, this.winSize.width, this.winSize.height)

        if (rect) {
            context.beginPath()
            context.rect(rect.origin.x, rect.origin.y, rect.size.width, rect.size.height)
            context.clip()
            context.closePath()
        }

        this._runningScene.visit(context, rect)

        if (SHOW_REDRAW_REGIONS) {
            if (rect) {
                context.beginPath()
                context.rect(rect.origin.x, rect.origin.y, rect.size.width, rect.size.height)
                context.fillStyle = "rgba(255, 0, 0, 0.5)"
                //context.fill()
                context.closePath()
            }
        }

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
        var x = this.canvas.offsetLeft - document.documentElement.scrollLeft
          , y = this.canvas.offsetTop - document.documentElement.scrollTop

        var o = this.canvas
        while ((o = o.offsetParent)) {
            x += o.offsetLeft - o.scrollLeft
            y += o.offsetTop - o.scrollTop
        }

        var p = geo.ccpSub(evt.locationInWindow, ccp(x, y))
        if (FLIP_Y_AXIS) {
            p.y = this.canvas.height - p.y
        }

        return p
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
            Director._instance = new this()
        }

        return Director._instance
    }

  , enumerable: true
})

/**
 * @memberOf cocos
 * @class Pretends to run at a constant frame rate even if it slows down
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
