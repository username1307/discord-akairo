import type { Awaitable, Collection, Message } from 'discord.js';
import type { InhibitorHandlerEvents } from '../../typings/events';
import type AkairoMessage from '../../util/AkairoMessage.js';
import type Category from '../../util/Category.js';
import type AkairoClient from '../AkairoClient.js';
import AkairoHandler, { AkairoHandlerOptions, LoadPredicate } from '../AkairoHandler.js';
import type MessageCommand from '../messageCommands/MessageCommand';
import Inhibitor from './Inhibitor.js';
import SlashCommand from '../slashCommands/SlashCommand';
/**
 * Loads inhibitors and checks messages.
 */
export default class InhibitorHandler extends AkairoHandler {
    /**
     * Categories, mapped by ID to Category.
     */
    categories: Collection<string, Category<string, Inhibitor>>;
    /**
     * Class to handle.
     */
    classToHandle: typeof Inhibitor;
    /**
     * The Akairo client.
     */
    client: AkairoClient;
    /**
     * Directory to inhibitors.
     */
    directory: string;
    /**
     * Inhibitors loaded, mapped by ID to Inhibitor.
     */
    modules: Collection<string, Inhibitor>;
    /**
     * @param client - The Akairo client.
     * @param options - Options.
     */
    constructor(client: AkairoClient, options: AkairoHandlerOptions);
    /**
     * Tests inhibitors against the message.
     * Returns the reason if blocked.
     * @param type - Type of inhibitor, 'all', 'pre', or 'post'.
     * @param message - Message to test.
     * @param command - MessageCommand to use.
     */
    test(type: 'all' | 'pre' | 'post', message: Message | AkairoMessage, command?: MessageCommand | SlashCommand): Promise<string | null | void>;
}
declare type Events = InhibitorHandlerEvents;
export default interface InhibitorHandler extends AkairoHandler {
    /**
     * Deregisters an inhibitor.
     * @param inhibitor - Inhibitor to use.
     */
    deregister(inhibitor: Inhibitor): void;
    /**
     * Finds a category by name.
     * @param name - Name to find with.
     */
    findCategory(name: string): Category<string, Inhibitor>;
    /**
     * Loads an inhibitor.
     * @param thing - Inhibitor or path to inhibitor.
     */
    load(thing: string | Inhibitor): Promise<Inhibitor>;
    /**
     * Reads all inhibitors from the directory and loads them.
     * @param directory - Directory to load from. Defaults to the directory passed in the constructor.
     * @param filter - Filter for files, where true means it should be loaded.
     */
    loadAll(directory?: string, filter?: LoadPredicate): Promise<InhibitorHandler>;
    /**
     * Registers an inhibitor.
     * @param inhibitor - Inhibitor to use.
     * @param filepath - Filepath of inhibitor.
     */
    register(inhibitor: Inhibitor, filepath?: string): void;
    /**
     * Reloads an inhibitor.
     * @param id - ID of the inhibitor.
     */
    reload(id: string): Promise<Inhibitor>;
    /**
     * Reloads all inhibitors.
     */
    reloadAll(): Promise<InhibitorHandler>;
    /**
     * Removes an inhibitor.
     * @param id - ID of the inhibitor.
     */
    remove(id: string): Inhibitor;
    /**
     * Removes all inhibitors.
     */
    removeAll(): InhibitorHandler;
    on<K extends keyof Events>(event: K, listener: (...args: Events[K]) => Awaitable<void>): this;
    once<K extends keyof Events>(event: K, listener: (...args: Events[K]) => Awaitable<void>): this;
}
export {};
//# sourceMappingURL=InhibitorHandler.d.ts.map