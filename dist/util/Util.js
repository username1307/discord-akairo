/**
 * Akairo Utilities.
 */
export default class Util {
    /**
     * Deep assign properties to an object.
     * @param target
     * @param os
     */
    static deepAssign(target, ...os) {
        for (const o of os) {
            for (const [key, value] of Object.entries(o)) {
                const valueIsObject = value && typeof value === 'object';
                const targetKeyIsObject = Object.prototype.hasOwnProperty.call(target, key) &&
                    target[key] &&
                    typeof target[key] === 'object';
                if (valueIsObject && targetKeyIsObject) {
                    Util.deepAssign(target[key], value);
                }
                else {
                    target[key] = value;
                }
            }
        }
        return target;
    }
    /**
     * Map an iterable object and then flatten it it into an array
     * @param iterable - the object to map and flatten
     * @param filter - the filter to map with
     */
    static flatMap(iterable, filter) {
        const result = [];
        for (const x of iterable) {
            result.push(...filter(x));
        }
        return result;
    }
    /**
     * Converts the supplied value into an array if it is not already one.
     * @param x - Value to convert.
     */
    static intoArray(x) {
        if (Array.isArray(x)) {
            return x;
        }
        return [x];
    }
    /**
     * Converts something to become callable.
     * @param thing - What to turn into a callable.
     */
    static intoCallable(thing) {
        if (typeof thing === 'function') {
            return thing;
        }
        return () => thing;
    }
    /**
     * Checks if the supplied value is an event emitter.
     * @param value - Value to check.
     */
    static isEventEmitter(value) {
        return (value &&
            typeof value.on === 'function' &&
            typeof value.emit === 'function');
    }
    static isPromise(value) {
        return (value &&
            typeof value.then === 'function' &&
            typeof value.catch === 'function');
    }
    /**
     * Compares two prefixes.
     * @param aKey - First prefix.
     * @param bKey - Second prefix.
     */
    static prefixCompare(aKey, bKey) {
        if (aKey === '' && bKey === '')
            return 0;
        if (aKey === '')
            return 1;
        if (bKey === '')
            return -1;
        if (typeof aKey === 'function' && typeof bKey === 'function')
            return 0;
        if (typeof aKey === 'function')
            return 1;
        if (typeof bKey === 'function')
            return -1;
        return aKey.length === bKey.length
            ? aKey.localeCompare(bKey)
            : bKey.length - aKey.length;
    }
    // eslint-disable-next-line complexity
    static deepEquals(a, b, options) {
        const { ignoreUndefined = true, ignoreArrayOrder = true } = options ?? {};
        if (a === b)
            return true;
        if (typeof a !== 'object' || typeof b !== 'object')
            throw new TypeError('Not objects');
        if ((Array.isArray(a) && !Array.isArray(b)) ||
            (!Array.isArray(a) && Array.isArray(b)))
            return false;
        const newA = ignoreArrayOrder &&
            Array.isArray(a) &&
            a.length &&
            typeof a[0] !== 'object'
            ? [...a].sort()
            : a;
        const newB = ignoreArrayOrder &&
            Array.isArray(b) &&
            b.length &&
            typeof b[0] !== 'object'
            ? [...b].sort()
            : b;
        for (const key in newA) {
            if (ignoreUndefined &&
                newA[key] === undefined &&
                newB[key] === undefined)
                continue;
            if (!(key in newB))
                return false;
            if (typeof newA[key] === 'object' &&
                typeof newB[key] === 'object') {
                if (!this.deepEquals(newA[key], newB[key], {
                    ignoreUndefined,
                    ignoreArrayOrder,
                }))
                    return false;
            }
            else if (newA[key] !== newB[key])
                return false;
        }
        return true;
    }
    /**
     * Converts a string in snake_case to camelCase.
     * @param str The string to convert.
     */
    static snakeToCamelCase(str) {
        return str
            .toLowerCase()
            .split('_')
            .map((word, index) => {
            if (index !== 0)
                return word.charAt(0).toUpperCase() + word.slice(1);
            return word;
        })
            .join('');
    }
}
//# sourceMappingURL=Util.js.map