var util = require('util')
  , bob  = require('bobject')

if (!window.BObject) {
    window.BObject = bob.BObject
}

if (!window.BArray) {
    window.BArray = bob.BArray
}

function extend (target, parent, props) {
    target.prototype = Object.create(parent.prototype)
    if (props) {
        util.extend(target.prototype, props)
    }

    return target
}
function inherit (parent, props) {
    return extend(this, parent, props)
}

if (!Object.extend) {
    Object.extend = extend
}

if (!Function.prototype.inherit) {
    Function.prototype.inherit = inherit
}

if (!('superclass' in Function.prototype)) {
    Object.defineProperty(Function.prototype, 'superclass', {
        get: function () {
            return Object.getPrototypeOf(this.prototype)
        },

        /** @ignore
         * Allow overwriting of 'superclass' property
         */
        set: function (x) {
            Object.defineProperty(this, 'superclass', {
                configurable: true,
                writable: true
            })

            this.superclass = x
        }
    })
}
if (!('__superclass__' in Function.prototype)) {
    Object.defineProperty(Function.prototype, '__superclass__', {
        get: function () {
            return Object.getPrototypeOf(this.prototype)
        }
    })
}
