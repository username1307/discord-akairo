import { Awaitable, Collection } from 'discord.js';
import type * as EventEmitter from 'events';
import type { ListenerHandlerEvents } from '../../typings/events';
import type Category from '../../util/Category.js';
import type AkairoClient from '../AkairoClient.js';
import AkairoHandler, { AkairoHandlerOptions, LoadPredicate } from '../AkairoHandler.js';
import Listener from './Listener.js';
/**
 * Loads listeners and registers them with EventEmitters.
 */
export default class ListenerHandler extends AkairoHandler {
    /**
     * Categories, mapped by ID to Category.
     */
    categories: Collection<string, Category<string, Listener>>;
    /**
     * Class to handle.
     */
    classToHandle: typeof Listener;
    /**
     * The Akairo client
     */
    client: AkairoClient;
    /**
     * Directory to listeners.
     */
    directory: string;
    /**
     * EventEmitters for use, mapped by name to EventEmitter.
     * By default, 'client' is set to the given client.
     */
    emitters: Collection<string, EventEmitter>;
    /**
     * Listeners loaded, mapped by ID to Listener.
     */
    modules: Collection<string, Listener>;
    /**
     * @param client - The Akairo client.
     * @param options - Options.
     */
    constructor(client: AkairoClient, options: AkairoHandlerOptions);
    /**
     * Adds a listener to the EventEmitter.
     * @param id - ID of the listener.
     */
    addToEmitter(id: string): Listener;
    /**
     * Deregisters a listener.
     * @param mod - Listener to use.
     */
    deregister(listener: Listener): void;
    /**
     * Registers a listener.
     * @param listener - Listener to use.
     * @param filepath - Filepath of listener.
     */
    register(listener: Listener, filepath?: string): void;
    /**
     * Removes a listener from the EventEmitter.
     * @param id - ID of the listener.
     */
    removeFromEmitter(id: string): Listener;
    /**
     * Sets custom emitters.
     * @param emitters - Emitters to use. The key is the name and value is the emitter.
     */
    setEmitters(emitters: any): ListenerHandler;
}
declare type Events = ListenerHandlerEvents;
export default interface ListenerHandler extends AkairoHandler {
    /**
     * Finds a category by name.
     * @param name - Name to find with.
     */
    findCategory(name: string): Category<string, Listener>;
    /**
     * Loads a listener, can be a listener class or a filepath.
     * @param thing - Listener class or path to listener.
     * @param isReload - Whether this is a reload or not.
     */
    load(thing: string | Listener, isReload?: boolean): Promise<Listener>;
    /**
     * Reads all listeners from the directory and loads them.
     * @param directory - Directory to load from. Defaults to the directory passed in the constructor.
     * @param filter - Filter for files, where true means it should be loaded.
     */
    loadAll(directory?: string, filter?: LoadPredicate): Promise<ListenerHandler>;
    /**
     * Reloads a listener.
     * @param id - ID of the listener.
     */
    reload(id: string): Promise<Listener>;
    /**
     * Reloads all listeners.
     */
    reloadAll(): Promise<ListenerHandler>;
    /**
     * Removes a listener.
     * @param id - ID of the listener.
     */
    remove(id: string): Listener;
    /**
     * Removes all listeners.
     */
    removeAll(): ListenerHandler;
    on<K extends keyof Events>(event: K, listener: (...args: Events[K]) => Awaitable<void>): this;
    once<K extends keyof Events>(event: K, listener: (...args: Events[K]) => Awaitable<void>): this;
}
export {};
//# sourceMappingURL=ListenerHandler.d.ts.map