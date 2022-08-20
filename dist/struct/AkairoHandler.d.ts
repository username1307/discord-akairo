import { Collection } from 'discord.js';
import * as EventEmitter from 'events';
import Category from '../util/Category.js';
import type AkairoClient from './AkairoClient.js';
import AkairoModule from './AkairoModule.js';
export declare type Static<M> = {
    (): M;
};
/**
 * Base class for handling modules.
 */
export default class AkairoHandler extends EventEmitter {
    /**
     * Whether to automate category names.
     */
    automateCategories: boolean;
    /**
     * Categories, mapped by ID to Category.
     */
    categories: Collection<string, Category<string, AkairoModule>>;
    /**
     * Class to handle.
     */
    classToHandle: typeof AkairoModule;
    /**
     * The Akairo client.
     */
    client: AkairoClient;
    /**
     * The main directory to modules.
     */
    directory: string;
    /**
     * File extensions to load.
     */
    extensions: Set<string>;
    /**
     * Function that filters files when loading.
     */
    loadFilter: LoadPredicate;
    /**
     * Modules loaded, mapped by ID to AkairoModule.
     */
    modules: Collection<string, AkairoModule>;
    /**
     * @param client - The Akairo client.
     * @param options - Options for module loading and handling.
     */
    constructor(client: AkairoClient, options: AkairoHandlerOptions);
    /**
     * Deregisters a module.
     * @param mod - Module to use.
     */
    deregister(mod: AkairoModule): void;
    /**
     * Finds a category by name.
     * @param name - Name to find with.
     */
    findCategory(name: string): Category<string, AkairoModule> | undefined;
    /**
     * Loads a module, can be a module class or a filepath.
     * @param thing - Module class or path to module.
     * @param isReload - Whether this is a reload or not.
     */
    load(thing: string | AkairoModule, isReload?: boolean): Promise<AkairoModule | undefined>;
    /**
     * Reads all modules from a directory and loads them.
     * @param directory - Directory to load from.
     * Defaults to the directory passed in the constructor.
     * @param filter - Filter for files, where true means it should be loaded.
     * Defaults to the filter passed in the constructor.
     */
    loadAll(directory?: string, filter?: LoadPredicate): Promise<AkairoHandler>;
    /**
     * Registers a module.
     * @param mod - Module to use.
     * @param filepath - Filepath of module.
     */
    register(mod: AkairoModule, filepath?: string): void;
    /**
     * Reloads a module.
     * @param id - ID of the module.
     */
    reload(id: string): Promise<AkairoModule | undefined>;
    /**
     * Reloads all modules.
     */
    reloadAll(): Promise<AkairoHandler>;
    /**
     * Removes a module.
     * @param id - ID of the module.
     */
    remove(id: string): AkairoModule;
    /**
     * Removes all modules.
     */
    removeAll(): AkairoHandler;
    /**
     * Reads files recursively from a directory.
     * @param directory - Directory to read.
     */
    static readdirRecursive(directory: string): string[];
}
/**
 * Function for filtering files when loading.
 * True means the file should be loaded.
 * @param filepath - Filepath of file.
 */
export declare type LoadPredicate = (filepath: string) => boolean;
/**
 * Options for module loading and handling.
 */
export interface AkairoHandlerOptions {
    /**
     * Whether or not to set each module's category to its parent directory name.
     * @default false
     */
    automateCategories?: boolean;
    /**
     * Only classes that extends this class can be handled.
     * @default AkairoModule
     */
    classToHandle?: typeof AkairoModule;
    /**
     * Directory to modules.
     */
    directory: string;
    /**
     * File extensions to load.
     * @default [".js", ".json", ".ts"]
     */
    extensions?: string[] | Set<string>;
    /**
     * Filter for files to be loaded.
     * Can be set individually for each handler by overriding the `loadAll` method.
     * @default () => true
     */
    loadFilter?: LoadPredicate;
}
//# sourceMappingURL=AkairoHandler.d.ts.map