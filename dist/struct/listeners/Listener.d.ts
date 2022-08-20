import type EventEmitter from 'events';
import type Category from '../../util/Category.js';
import type AkairoClient from '../AkairoClient.js';
import AkairoModule, { AkairoModuleOptions } from '../AkairoModule.js';
import type ListenerHandler from './ListenerHandler.js';
/**
 * Represents a listener.
 */
export default abstract class Listener extends AkairoModule {
    /**
     * The category of this listener.
     */
    category: Category<string, Listener>;
    /**
     * The Akairo client.
     */
    client: AkairoClient;
    /**
     * The event emitter.
     */
    emitter: string | EventEmitter;
    /**
     * The event name listened to.
     */
    event: string;
    /**
     * The filepath.
     */
    filepath: string;
    /**
     * The handler.
     */
    handler: ListenerHandler;
    /**
     * Type of listener.
     */
    type: ListenerType;
    /**
     * @param id - Listener ID.
     * @param options - Options for the listener.
     */
    constructor(id: string, options: ListenerOptions);
    /**
     * Executes the listener.
     * @param args - Arguments.
     */
    exec(...args: any[]): any;
}
export default interface Listener extends AkairoModule {
    /**
     * Reloads the listener.
     */
    reload(): Promise<Listener>;
    /**
     * Removes the listener.
     */
    remove(): Listener;
}
/**
 * Options to use for listener execution behavior.
 */
export interface ListenerOptions extends AkairoModuleOptions {
    /**
     * The event emitter, either a key from `ListenerHandler#emitters` or an EventEmitter.
     */
    emitter: string | EventEmitter;
    /**
     * Event name to listen to.
     */
    event: string;
    /**
     * Type of listener, either 'on' or 'once'.
     * @default "on"
     */
    type?: ListenerType;
}
export declare type ListenerType = 'on' | 'once' | 'prependListener' | 'prependOnceListener';
//# sourceMappingURL=Listener.d.ts.map