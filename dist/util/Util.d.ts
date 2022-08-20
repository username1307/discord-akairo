import type EventEmitter from 'events';
/**
 * Akairo Utilities.
 */
export default class Util {
    /**
     * Deep assign properties to an object.
     * @param target
     * @param os
     */
    static deepAssign<A, B>(target: A, ...os: B[]): A;
    /**
     * Map an iterable object and then flatten it it into an array
     * @param iterable - the object to map and flatten
     * @param filter - the filter to map with
     */
    static flatMap<Type, Ret extends {
        [Symbol.iterator](): Iterator<unknown>;
    }, Func extends (...args: any[]) => Ret>(iterable: Iterable<Type>, filter: Func): Type;
    /**
     * Converts the supplied value into an array if it is not already one.
     * @param x - Value to convert.
     */
    static intoArray<T>(x: T | T[]): T[];
    /**
     * Converts something to become callable.
     * @param thing - What to turn into a callable.
     */
    static intoCallable<T>(thing: T | ((...args: any[]) => T)): (...args: any[]) => T;
    /**
     * Checks if the supplied value is an event emitter.
     * @param value - Value to check.
     */
    static isEventEmitter(value: any): value is EventEmitter;
    /**
     * Checks if the supplied value is a promise.
     * @param value - Value to check.
     */
    static isPromise<T>(value: T | Promise<T>): value is Promise<T>;
    /**
     * Compares two prefixes.
     * @param aKey - First prefix.
     * @param bKey - Second prefix.
     */
    static prefixCompare(aKey: string | ((...args: any[]) => any), bKey: string | ((...args: any[]) => any)): number;
    /**
     * Compares each property of two objects to determine if they are equal.
     * @param a - First value.
     * @param b - Second value.
     * @param ignoreUndefined - Whether to ignore undefined properties.
     * @returns Whether the two values are equal.
     */
    static deepEquals<T>(a: unknown, b: T, options?: DeepEqualsOptions): a is T;
    /**
     * Converts a string in snake_case to camelCase.
     * @param str The string to convert.
     */
    static snakeToCamelCase(str: string): string;
}
export interface DeepEqualsOptions {
    /**
     * Whether to ignore undefined properties.
     * @default true
     */
    ignoreUndefined?: boolean;
    /**
     * Whether to ignore the order of the items in arrays
     * @default true
     */
    ignoreArrayOrder?: boolean;
}
//# sourceMappingURL=Util.d.ts.map