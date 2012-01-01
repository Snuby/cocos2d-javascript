'use strict'

var util = require('util')

/**
 * @memberOf Object
 */
function extend (target, parent, props) {
    target.prototype = Object.create(parent.prototype)
    target.prototype.constructor = target

    if (props) {
        util.extend(target.prototype, props)
    }

    return target
}

/**
 * @memberOf Function#
 */
function inherit (parent, props) {
    return extend(this, parent, props)
}

if (!Object.extend) {
    Object.extend = extend
}

if (!Function.prototype.inherit) {
    Function.prototype.inherit = inherit
}
if (!('id' in Object.prototype)) {

    /**
     * @ignore
     * Every object has a unique ID. It only gets set the first time its accessed
     */
    var nextObjectID = 1

    Object.defineProperty(Object.prototype, 'id', {
        get: function () {
            if (this === Object.prototype || Object.getPrototypeOf(this) === Object.prototype) {
                return
            }


            var id = nextObjectID++
            this.id = id
            return id
        },

        /** @ignore
         * Allow overwriting of 'id' property
         */
        set: function (x) {
            if (this === Object.prototype) {
                return
            }
            if (Object.getPrototypeOf(this) === Object.prototype) {
                Object.defineProperty(this, 'id', {
                    configurable: true,
                    writable: true,
                    enumerable: true,
                    value: x
                })
            } else {
                Object.defineProperty(this, 'id', {
                    configurable: true,
                    writable: true,
                    enumerable: false,
                    value: x
                })
            }

        }
    })
}

if (!('superclass' in Function.prototype)) {
    Object.defineProperty(Function.prototype, 'superclass', {
        /**
         * The object prototype that this was inherited from
         * @memberOf Function#
         * @getter {Object} superclass
         */
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
