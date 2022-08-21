import type { Awaitable, Collection } from 'discord.js';
import type { ContextMenuCommandHandlerEvents } from '../../typings/events';
import type Category from '../../util/Category.js';
import type AkairoClient from '../AkairoClient.js';
import AkairoHandler, { AkairoHandlerOptions, LoadPredicate } from '../AkairoHandler.js';
import type AkairoModule from '../AkairoModule.js';
import type InhibitorHandler from '../inhibitors/InhibitorHandler.js';
import ContextMenuCommand from './ContextMenuCommand.js';
import { ContextMenuCommandInteraction } from 'discord.js';
/**
 * Loads context menu messageCommands and handles them.
 */
export default class ContextMenuCommandHandler extends AkairoHandler {
    /**
     * Categories, mapped by ID to Category.
     */
    categories: Collection<string, Category<string, ContextMenuCommand>>;
    /**
     * Class to handle.
     */
    classToHandle: typeof ContextMenuCommand;
    /**
     * The Akairo client.
     */
    client: AkairoClient;
    /**
     * Directory to context menu messageCommands.
     */
    directory: string;
    /**
     * Inhibitor handler to use.
     */
    inhibitorHandler?: InhibitorHandler;
    /**
     * Context menu messageCommands loaded, mapped by ID to context menu command.
     */
    modules: Collection<string, ContextMenuCommand>;
    /**
     * @param client - The Akairo client.
     * @param options - Options.
     */
    constructor(client: AkairoClient, options: AkairoHandlerOptions);
    /**
     * Set up the context menu command handler
     */
    protected setup(): void;
    /**
     * Handles an interaction.
     * @param interaction - Interaction to handle.
     */
    handle(interaction: ContextMenuCommandInteraction): Promise<boolean | null>;
    /**
     * Handles errors from the handling.
     * @param err - The error.
     * @param interaction - Interaction that called the command.
     * @param command - MessageCommand that errored.
     */
    emitError(err: Error, interaction: ContextMenuCommandInteraction, command: ContextMenuCommand | AkairoModule): void;
}
declare type Events = ContextMenuCommandHandlerEvents;
export default interface ContextMenuCommandHandler extends AkairoHandler {
    /**
     * Deregisters a module.
     * @param contextMenuCommand - Module to use.
     */
    deregister(contextMenuCommand: ContextMenuCommand): void;
    /**
     * Finds a category by name.
     * @param name - Name to find with.
     */
    findCategory(name: string): Category<string, ContextMenuCommand>;
    /**
     * Loads an context menu command.
     * @param thing - Module or path to module.
     */
    load(thing: string | ContextMenuCommand): Promise<ContextMenuCommand>;
    /**
     * Reads all context menu messageCommands from the directory and loads them.
     * @param directory - Directory to load from. Defaults to the directory passed in the constructor.
     * @param filter - Filter for files, where true means it should be loaded.
     */
    loadAll(directory?: string, filter?: LoadPredicate): Promise<ContextMenuCommandHandler>;
    /**
     * Registers a module.
     * @param contextMenuCommand - Module to use.
     * @param filepath - Filepath of module.
     */
    register(contextMenuCommand: ContextMenuCommand, filepath?: string): void;
    /**
     * Reloads an context menu command.
     * @param id - ID of the context menu command.
     */
    reload(id: string): Promise<ContextMenuCommand>;
    /**
     * Reloads all context menu messageCommands.
     */
    reloadAll(): Promise<ContextMenuCommandHandler>;
    /**
     * Removes an context menu command.
     * @param id - ID of the context menu command.
     */
    remove(id: string): ContextMenuCommand;
    /**
     * Removes all context menu messageCommands.
     */
    removeAll(): ContextMenuCommandHandler;
    on<K extends keyof Events>(event: K, listener: (...args: Events[K]) => Awaitable<void>): this;
    once<K extends keyof Events>(event: K, listener: (...args: Events[K]) => Awaitable<void>): this;
}
export {};
//# sourceMappingURL=ContextMenuCommandHandler.d.ts.map