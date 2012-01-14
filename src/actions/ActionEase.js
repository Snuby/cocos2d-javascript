"use strict"

var util = require('util'),
    ActionInterval = require('./ActionInterval').ActionInterval,
    geo = require('geometry'),
    ccp = geo.ccp

/**
 * @class
 * Base class for Easing actions
 *
 * @memberOf cocos.actions
 * @extends cocos.actions.ActionInterval
 *
 * @opt {cocos.actions.ActionInterval} action
 */
function ActionEase (opts) {
    if (!opts.action) {
        throw "Ease: action argument must be non-nil"
    }
    ActionEase.superclass.constructor.call(this, {duration: opts.action.duration})

    this.other = opts.action
}

ActionEase.inherit(ActionInterval, /** @lends cocos.actions.ActionEase# */ {
    other: null,

    startWithTarget: function(target) {
        ActionEase.superclass.startWithTarget.call(this, target)
        this.other.startWithTarget(this.target)
    },

    stop: function() {
        this.other.stop()
        ActionEase.superclass.stop.call(this)
    },

    copy: function() {
        return new ActionEase({action: this.other.copy()})
    },

    reverse: function() {
        return new ActionEase({action: this.other.reverse()})
    }
})

/**
 * @class
 * Base class for Easing actions with rate parameter
 *
 * @memberOf cocos.actions
 * @extends cocos.actions.ActionEase
 *
 * @opt {cocos.actions.ActionInterval} action
 * @opt {Float} rate
 */
function EaseRate (opts) {
    EaseRate.superclass.constructor.call(this, opts)

    this.rate = opts.rate
}

EaseRate.inherit(ActionEase, /** @lends cocos.actions.EaseRate# */ {
    /**
     * rate value for the actions
     * @type {Float}
     */
    rate: 0,

    copy: function() {
        return new EaseRate({action: this.other.copy(), rate: this.rate})
    },

    reverse: function() {
        return new EaseRate({action: this.other.reverse(), rate: 1 / this.rate})
    }
})

/**
 * @class
 * Ease In action with a rate
 *
 * @memberOf cocos.actions
 * @extends cocos.actions.EaseRate
 */
function EaseIn (opts) {
    EaseIn.superclass.constructor.call(this, opts)
}

EaseIn.inherit(EaseRate, /** @lends cocos.actions.EaseIn# */ {
    update: function(t) {
        this.other.update(Math.pow(t, this.rate))
    },

    copy: function() {
        return new EaseIn({action: this.other.copy(), rate: this.rate})
    },

    reverse: function() {
        return new EaseIn({action: this.other.reverse(), rate: 1 / this.rate})
    }
})

/**
 * @class
 * Ease Out action with a rate
 *
 * @memberOf cocos.actions
 * @extends cocos.actions.EaseRate
 */
function EaseOut (opts) {
    EaseOut.superclass.constructor.call(this, opts)
}

EaseOut.inherit(EaseRate, /** @lends cocos.actions.EaseOut# */ {
    update: function(t) {
        this.other.update(Math.pow(t, 1/this.rate))
    },

    copy: function() {
        return new EaseOut({action: this.other.copy(), rate: this.rate})
    },

    reverse: function() {
        return new EaseOut({action: this.other.reverse(), rate: 1 / this.rate})
    }
})

/**
 * @class
 * Ease In then Out action with a rate
 *
 * @memberOf cocos.actions
 * @extends cocos.actions.EaseRate
 */
function EaseInOut (opts) {
    EaseInOut.superclass.constructor.call(this, opts)
}

EaseInOut.inherit(EaseRate, /** @lends cocos.actions.EaseInOut# */ {
    update: function(t) {
        var sign = 1
        var r = Math.floor(this.rate)
        if (r % 2 == 0) {
            sign = -1
        }
        t *= 2
        if (t < 1) {
            this.other.update(0.5 * Math.pow(t, this.rate))
        } else {
            this.other.update(sign * 0.5 * (Math.pow(t-2, this.rate) + sign * 2))
        }
    },

    copy: function() {
        return new EaseInOut({action: this.other.copy(), rate: this.rate})
    },

    reverse: function() {
        return new EaseInOut({action: this.other.reverse(), rate: this.rate})
    }
})

/**
 * @class
 * Ease Exponential In action
 *
 * @memberOf cocos.actions
 * @extends cocos.actions.ActionEase
 */
function EaseExponentialIn (opts) {
    EaseExponentialIn.superclass.constructor.call(this, opts)
}

EaseExponentialIn.inherit(ActionEase, /** @lends cocos.actions.EaseExponentialIn# */ {
    update: function(t) {
        this.other.update((t == 0) ? 0 : (Math.pow(2, 10 * (t/1 - 1)) - 1 * 0.001))
    },

    copy: function() {
        return new EaseExponentialIn({action: this.other.copy()})
    },

    reverse: function() {
        return new exports.EaseExponentialOut({action: this.other.reverse()})
    }
})

/**
 * @class
 * EaseE xponential Out action
 *
 * @memberOf cocos.actions
 * @extends cocos.actions.ActionEase
 */
function EaseExponentialOut (opts) {
    EaseExponentialOut.superclass.constructor.call(this, opts)
}

EaseExponentialOut.inherit(ActionEase, /** @lends cocos.actions.EaseExponentialOut# */ {
    update: function(t) {
        this.other.update((t == 1) ? 1 : (-Math.pow(2, -10 * t/1) + 1))
    },

    copy: function() {
        return new EaseExponentialOut({action: this.other.copy()})
    },

    reverse: function() {
        return new exports.EaseExponentialIn({action: this.other.reverse()})
    }
})

/**
 * @class
 * Ease Exponential In then Out action
 *
 * @memberOf cocos.actions
 * @extends cocos.actions.ActionEase
 */
function EaseExponentialInOut (opts) {
    EaseExponentialInOut.superclass.constructor.call(this, opts)
}

EaseExponentialInOut.inherit(ActionEase, /** @lends cocos.actions.EaseExponentialInOut# */ {
    update: function(t) {
        t /= 0.5
        if (t < 1) {
            t = 0.5 * Math.pow(2, 10 * (t - 1))
        } else {
            t = 0.5 * (-Math.pow(2, -10 * (t - 1)) + 2)
        }
        this.other.update(t)
    },

    copy: function() {
        return new EaseExponentialInOut({action: this.other.copy()})
    },

    reverse: function() {
        return new EaseExponentialInOut({action: this.other.reverse()})
    }
})

/**
 * @class
 * Ease Sine In action
 *
 * @memberOf cocos.actions
 * @extends cocos.actions.ActionEase
 */
function EaseSineIn (opts) {
    EaseSineIn.superclass.constructor.call(this, opts)
}

EaseSineIn.inherit(ActionEase, /** @lends cocos.actions.EaseSineIn# */ {
    update: function(t) {
        this.other.update(-1 * Math.cos(t * Math.PI_2) + 1)
    },

    copy: function() {
        return new EaseSineIn({action: this.other.copy()})
    },

    reverse: function() {
        return new exports.EaseSineOut({action: this.other.reverse()})
    }
})

/**
 * @class
 * Ease Sine Out action
 *
 * @memberOf cocos.actions
 * @extends cocos.actions.ActionEase
 */
function EaseSineOut (opts) {
    EaseSineOut.superclass.constructor.call(this, opts)
}

EaseSineOut.inherit(ActionEase, /** @lends cocos.actions.EaseSineOut# */ {
    update: function(t) {
        this.other.update(Math.sin(t * Math.PI_2))
    },

    copy: function() {
        return new EaseSineOut({action: this.other.copy()})
    },

    reverse: function() {
        return new exports.EaseSineIn({action: this.other.reverse()})
    }
})

/**
 * @class
 * Ease Sine In then Out action
 *
 * @memberOf cocos.actions
 * @extends cocos.actions.ActionEase
 */
function EaseSineInOut (opts) {
    EaseSineInOut.superclass.constructor.call(this, opts)
}

EaseSineInOut.inherit(ActionEase, /** @lends cocos.actions.EaseSineInOut# */ {
    update: function(t) {
        this.other.update(-0.5 * (Math.cos(t * Math.PI) - 1))
    },

    copy: function() {
        return new EaseSineInOut({action: this.other.copy()})
    },

    reverse: function() {
        return new EaseSineInOut({action: this.other.reverse()})
    }
})


/**
 * @class
 * Ease Elastic abstract class
 *
 * @memberOf cocos.actions
 * @extends cocos.actions.ActionEase
 *
 * @opt {cocos.actions.ActionInterval} action
 * @opt {Float} period
 */
function EaseElastic (opts) {
    EaseElastic.superclass.constructor.call(this, {action: opts.action})

    if (opts.period !== undefined) {
        this.period = opts.period
    }
}

EaseElastic.inherit(ActionEase, /** @lends cocos.actions.EaseElastic# */ {
    /**
     * Period of the wave in radians
     * @type Float
     * @default 0.3
     */
    period: 0.3,

    copy: function() {
        return new EaseElastic({action: this.other.copy(), period: this.period})
    },

    reverse: function() {
        window.console.warn("EaseElastic reverse(): Override me")
        return null
    }
})

/**
 * @class
 * Ease Elastic In action
 *
 * @memberOf cocos.actions
 * @extends cocos.actions.EaseElastic
 */
function EaseElasticIn (opts) {
    EaseElasticIn.superclass.constructor.call(this, opts)
}

EaseElasticIn.inherit(EaseElastic, /** @lends cocos.actions.EaseElasticIn# */ {
    update: function(t) {
        var newT = 0
        if (t == 0 || t == 1) {
            newT = t
        } else {
            var s = this.period / 4
            t -= 1
            newT = -Math.pow(2, 10 * t) * Math.sin((t - s) * Math.PI*2 / this.period)
        }
        this.other.update(newT)
    },

    // Wish we could use base class's copy
    copy: function() {
        return new EaseElasticIn({action: this.other.copy(), period: this.period})
    },

    reverse: function() {
        return new exports.EaseElasticOut({action: this.other.reverse(), period: this.period})
    }
})

/**
 * @class
 * Ease Elastic Out action
 *
 * @memberOf cocos.actions
 * @extends cocos.actions.EaseElastic
 */
function EaseElasticOut (opts) {
    EaseElasticOut.superclass.constructor.call(this, opts)
}

EaseElasticOut.inherit(EaseElastic, /** @lends cocos.actions.EaseElasticOut# */ {
    update: function(t) {
        var newT = 0
        if (t == 0 || t == 1) {
            newT = t
        } else {
            var s = this.period / 4
            newT = Math.pow(2, -10 * t) * Math.sin((t - s) * Math.PI*2 / this.period) + 1
        }
        this.other.update(newT)
    },

    copy: function() {
        return new EaseElasticOut({action: this.other.copy(), period: this.period})
    },

    reverse: function() {
        return new exports.EaseElasticIn({action: this.other.reverse(), period: this.period})
    }
})

/**
 * @class
 * Ease Elastic In Out action
 *
 * @memberOf cocos.actions
 * @extends cocos.actions.EaseElastic
 */
function EaseElasticInOut (opts) {
    EaseElasticInOut.superclass.constructor.call(this, opts)
}

EaseElasticInOut.inherit(EaseElastic, /** @lends cocos.actions.EaseElasticInOut# */ {
    update: function(t) {
        var newT = 0
        if (t == 0 || t == 1) {
            newT = t
        } else {
            t *= 2
            if (this.period == 0) {
                this.period = 0.3 * 1.5
            }
            var s = this.period / 4

            t -= 1
            if (t < 0) {
                newT = -0.5 * Math.pow(2, 10 * t) * Math.sin((t - s) * Math.PI*2 / this.period)
            } else {
                newT = Math.pow(2, -10 * t) * Math.sin((t - s) * Math.PI*2 / this.period) * 0.5 + 1
            }
        }
        this.other.update(newT)
    },

    copy: function() {
        return new EaseElasticInOut({action: this.other.copy(), period: this.period})
    },

    reverse: function() {
        return new EaseElasticInOut({action: this.other.reverse(), period: this.period})
    }
})

/**
 * @class
 * Ease Bounce abstract class
 *
 * @memberOf cocos.actions
 * @extends cocos.actions.ActionEase
 */
function EaseBounce (opts) {
    EaseBounce.superclass.constructor.call(this, opts)
}

EaseBounce.inherit(ActionEase, /** @lends cocos.actions.EaseBounce# */ {
    bounceTime: function(t) {
        // Direct cut & paste from CCActionEase.m, obviously.
        // Glad someone else figured out all this math...
        if (t < 1 / 2.75) {
            return 7.5625 * t * t
        }
        else if (t < 2 / 2.75) {
            t -= 1.5 / 2.75
            return 7.5625 * t * t + 0.75
        }
        else if (t < 2.5 / 2.75) {
            t -= 2.25 / 2.75
            return 7.5625 * t * t + 0.9375
        }

        t -= 2.625 / 2.75
        return 7.5625 * t * t + 0.984375
    }
})

/**
 * @class
 * Ease Bounce In action
 *
 * @memberOf cocos.actions
 * @extends cocos.actions.EaseBounce
 */
function EaseBounceIn (opts) {
    EaseBounceIn.superclass.constructor.call(this, opts)
}

EaseBounceIn.inherit(EaseBounce, /** @lends cocos.actions.EaseBounceIn# */ {
    update: function(t) {
        var newT = 1 - this.bounceTime(1-t)
        this.other.update(newT)
    },

    copy: function() {
        return new EaseBounceIn({action: this.other.copy()})
    },

    reverse: function() {
        return new exports.EaseBounceOut({action: this.other.reverse()})
    }
})

/**
 * @class
 * Ease Bounce Out action
 *
 * @memberOf cocos.actions
 * @extends cocos.actions.EaseBounce
 */
function EaseBounceOut (opts) {
    EaseBounceOut.superclass.constructor.call(this, opts)
}

EaseBounceOut.inherit(EaseBounce, /** @lends cocos.actions.EaseBounceOut# */ {
    update: function(t) {
        var newT = this.bounceTime(t)
        this.other.update(newT)
    },

    copy: function() {
        return new EaseBounceOut({action: this.other.copy()})
    },

    reverse: function() {
        return new exports.EaseBounceIn({action: this.other.reverse()})
    }
})

/**
 * @class
 * Ease Bounce In Out action
 *
 * @memberOf cocos.actions
 * @extends cocos.actions.EaseBounce
 */
function EaseBounceInOut (opts) {
    EaseBounceInOut.superclass.constructor.call(this, opts)
}

EaseBounceInOut.inherit(EaseBounce, /** @lends cocos.actions.EaseBounceInOut# */ {
    update: function(t) {
        var newT = 0
        if (t < 0.5) {
            t *= 2
            newT = (1 - this.bounceTime(1 - t)) * 0.5
        } else {
            newT = this.bounceTime(t * 2 - 1) * 0.5 + 0.5
        }
        this.other.update(newT)
    },

    copy: function() {
        return new EaseBounceInOut({action: this.other.copy()})
    },

    reverse: function() {
        return new EaseBounceInOut({action: this.other.reverse()})
    }
})

/**
 * @class
 * Ease Back In action
 *
 * @memberOf cocos.actions
 * @extends cocos.actions.ActionEase
 */
function EaseBackIn (opts) {
    EaseBackIn.superclass.constructor.call(this, opts)
}

EaseBackIn.inherit(ActionEase, /** @lends cocos.actions.EaseBackIn# */ {
    update: function(t) {
        var overshoot = 1.70158
        this.other.update(t * t * ((overshoot + 1) * t - overshoot))
    },

    copy: function() {
        return new EaseBackIn({action: this.other.copy()})
    },

    reverse: function() {
        return new exports.EaseBackOut({action: this.other.reverse()})
    }
})

/**
 * @class
 * Ease Back Out action
 *
 * @memberOf cocos.actions
 * @extends cocos.actions.ActionEase
 */
function EaseBackOut (opts) {
    EaseBackOut.superclass.constructor.call(this, opts)
}

EaseBackOut.inherit(ActionEase, /** @lends cocos.actions.EaseBackOut# */ {
    update: function(t) {
        var overshoot = 1.70158
        t -= 1
        this.other.update(t * t * ((overshoot + 1) * t + overshoot) + 1)
    },

    copy: function() {
        return new EaseBackOut({action: this.other.copy()})
    },

    reverse: function() {
        return new exports.EaseBackIn({action: this.other.reverse()})
    }
})

/**
 * @class
 * Ease Back In Out action
 *
 * @memberOf cocos.actions
 * @extends cocos.actions.ActionEase
 */
function EaseBackInOut (opts) {
    EaseBackInOut.superclass.constructor.call(this, opts)
}

EaseBackInOut.inherit(ActionEase, /** @lends cocos.actions.EaseBackInOut# */ {
    update: function(t) {
        // Where do these constants come from?
        var overshoot = 1.70158 * 1.525
        t *= 2
        if (t < 1) {
            this.other.update((t * t * ((overshoot + 1) * t - overshoot)) / 2)
        } else {
            t -= 2
            this.other.update((t * t * ((overshoot + 1) * t + overshoot)) / 2 + 1)
        }
    },

    copy: function() {
        return new EaseBackInOut({action: this.other.copy()})
    },

    reverse: function() {
        return new EaseBackInOut({action: this.other.reverse()})
    }
})

exports.ActionEase = ActionEase
exports.EaseRate = EaseRate
exports.EaseIn = EaseIn
exports.EaseOut = EaseOut
exports.EaseInOut = EaseInOut
exports.EaseExponentialIn = EaseExponentialIn
exports.EaseExponentialOut = EaseExponentialOut
exports.EaseExponentialInOut = EaseExponentialInOut
exports.EaseSineIn = EaseSineIn
exports.EaseSineOut = EaseSineOut
exports.EaseSineInOut = EaseSineInOut
exports.EaseElastic = EaseElastic
exports.EaseElasticIn = EaseElasticIn
exports.EaseElasticOut = EaseElasticOut
exports.EaseElasticInOut = EaseElasticInOut
exports.EaseBounce = EaseBounce
exports.EaseBounceIn = EaseBounceIn
exports.EaseBounceOut = EaseBounceOut
exports.EaseBounceInOut = EaseBounceInOut
exports.EaseBackIn = EaseBackIn
exports.EaseBackOut = EaseBackOut
exports.EaseBackInOut = EaseBackInOut

