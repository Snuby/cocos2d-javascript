v0.2-rc1
========

* TMX Maps can use external .tsx tilesets
* TMX Maps layers support flipped tiles
* Basic iPhone, iPad and Android support
* Box2D physics engine is an optional extra rather than being standard
* Chipmunk physics engine is an optional extra
* Fonts are preloaded
* Various bug fixes

v0.2-beta3
==========

See the [upgrading guide][upgrading] for details on how to upgrade a v0.1 project to v0.2.

* Deprecated BObject. You can re-enable it by adding: `exports.ENABLED_DEPRECATED_METHODS` to your config.js.
  * `.set()` and `.get()` methods are no longer used to set/get properties. Use normal JavaScript now.
  * `Foo.extend()` no longer exists. Use the `Bar.inherit(Foo)` helper instead.
  * `Foo.create()` no longer exists. Use `new Foo()` instead.
  * `util.callback()` has been deprecated. Use the standard `this.myFunc.bind(this)` function instead.
* All code runs inside a sandbox (a hidden iframe). Setting globals in your application will have no impact on the webpage it's embedded in and vice versa.
* Applications are embedded by placing the 'script' tag where you want it to appear.
* Appliaction root folder is no longer in the `require` search path. You should prefix your paths with '/' or add this to the top of your main.js: `require.paths.unshift('/')`.


v0.2-beta2
==========

Installer fix for MS Windows

v0.2-beta
=========

New Features
------------

* Completely rewrote and separated the build system into a new project called [Jah][jah]
* Optionally load resources (images, tile maps, etc.) externally rather than embedding
* ProgressBar while preloading external resources
* Parse TMX Map properties
* Opacity property for all Nodes
* Added LabelAtlas
* Use requestAnimationFrame for smoother animations
* New Actions added by Marc Mauger
  * BezierBy
  * BezierTo
  * Blink
  * CallFunc
  * DelayTime
  * EaseBackIn
  * EaseBackInOut
  * EaseBackOut
  * EaseBounce
  * EaseBounceIn
  * EaseBounceInOut
  * EaseBounceOut
  * EaseElastic
  * EaseElasticInOut
  * EaseElasticOut
  * EaseIn
  * EaseOut
  * EastSineOut
  * FadeIn
  * FadeOut
  * FadeTo
  * Follow
  * Hide
  * JumpBy
  * JumpTo
  * Show
  * Spawn
  * ToggleVisibility
* Scene Transitions added by Marc Mauger
  * TransitionRotoZoom
  * TransitionMoveInL
  * TransitionMoveInR
  * TransitionMoveInT
  * TransitionMoveInB
  * TransitionSlideInL
  * TransitionSlideInR
  * TransitionSlideInT
  * TransitionSlideInB


Bug Fixes
---------

* 'event' module renamed to 'events' to avoid conflict with DOM events
* Fixed Sprites not always drawing in the correct location after changing their `contentSize`
* Fixed anchor point not being properly calculated
* Fixed `MenuItemSprite` not drawing its children


v0.1
====

Everything

[jah]: https://github.com/ryanwilliams/jah
[upgrading]: http://cocos2d-javascript.org/tutorials/upgrading-from-v0-1-to-v0-2
