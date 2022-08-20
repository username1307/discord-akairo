"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const EventEmitter = require("events");
const fs = require("fs");
const path = require("path");
const url = require("url");
const AkairoError_js_1 = require("../util/AkairoError.js");
const Category_js_1 = require("../util/Category.js");
const Constants_js_1 = require("../util/Constants.js");
const AkairoModule_js_1 = require("./AkairoModule.js");
/**
 * Base class for handling modules.
 */
class AkairoHandler extends EventEmitter {
    /**
     * @param client - The Akairo client.
     * @param options - Options for module loading and handling.
     */
    constructor(client, options) {
        const { directory, classToHandle = AkairoModule_js_1.default, extensions = ['.js', '.json', '.ts'], automateCategories = false, loadFilter = () => true, } = options ?? {};
        super();
        this.client = client;
        this.directory = directory;
        this.classToHandle = classToHandle;
        this.extensions = new Set(extensions);
        this.automateCategories = Boolean(automateCategories);
        this.loadFilter = loadFilter;
        this.modules = new discord_js_1.Collection();
        this.categories = new discord_js_1.Collection();
    }
    /**
     * Deregisters a module.
     * @param mod - Module to use.
     */
    deregister(mod) {
        if (mod.filepath)
            delete require.cache[require.resolve(mod.filepath)];
        this.modules.delete(mod.id);
        mod.category.delete(mod.id);
    }
    /**
     * Finds a category by name.
     * @param name - Name to find with.
     */
    findCategory(name) {
        return this.categories.find((category) => {
            return category.id.toLowerCase() === name.toLowerCase();
        });
    }
    /**
     * Loads a module, can be a module class or a filepath.
     * @param thing - Module class or path to module.
     * @param isReload - Whether this is a reload or not.
     */
    async load(thing, isReload = false) {
        const isClass = typeof thing === 'function';
        if (!isClass && !this.extensions.has(path.extname(thing)))
            return undefined;
        let mod = isClass
            ? thing
            : function findExport(m) {
                if (!m)
                    return null;
                if (m.prototype instanceof this.classToHandle)
                    return m;
                return m.default ? findExport.call(this, m.default) : null;
                // eslint-disable-next-line @typescript-eslint/no-var-requires
            }.call(this, await eval(`import(${JSON.stringify(url.pathToFileURL(thing).toString())})`));
        if (mod && mod.prototype instanceof this.classToHandle) {
            mod = new mod(this); // eslint-disable-line new-cap
        }
        else {
            if (!isClass)
                delete require.cache[require.resolve(thing)];
            return undefined;
        }
        if (this.modules.has(mod.id))
            throw new AkairoError_js_1.default('ALREADY_LOADED', this.classToHandle.name, mod.id);
        this.register(mod, isClass ? null : thing);
        this.emit(Constants_js_1.AkairoHandlerEvents.LOAD, mod, isReload);
        return mod;
    }
    /**
     * Reads all modules from a directory and loads them.
     * @param directory - Directory to load from.
     * Defaults to the directory passed in the constructor.
     * @param filter - Filter for files, where true means it should be loaded.
     * Defaults to the filter passed in the constructor.
     */
    async loadAll(directory = this.directory, filter = this.loadFilter || (() => true)) {
        const filepaths = AkairoHandler.readdirRecursive(directory);
        const promises = [];
        for (let filepath of filepaths) {
            filepath = path.resolve(filepath);
            if (filter(filepath))
                promises.push(this.load(filepath));
        }
        await Promise.all(promises);
        return this;
    }
    /**
     * Registers a module.
     * @param mod - Module to use.
     * @param filepath - Filepath of module.
     */
    register(mod, filepath) {
        mod.filepath = filepath;
        mod.client = this.client;
        mod.handler = this;
        this.modules.set(mod.id, mod);
        if (mod.categoryID === 'default' && this.automateCategories) {
            const dirs = path.dirname(filepath).split(path.sep);
            mod.categoryID = dirs[dirs.length - 1];
        }
        if (!this.categories.has(mod.categoryID)) {
            this.categories.set(mod.categoryID, new Category_js_1.default(mod.categoryID));
        }
        const category = this.categories.get(mod.categoryID);
        mod.category = category;
        category.set(mod.id, mod);
    }
    /**
     * Reloads a module.
     * @param id - ID of the module.
     */
    async reload(id) {
        const mod = this.modules.get(id.toString());
        if (!mod)
            throw new AkairoError_js_1.default('MODULE_NOT_FOUND', this.classToHandle.name, id);
        if (!mod.filepath)
            throw new AkairoError_js_1.default('NOT_RELOADABLE', this.classToHandle.name, id);
        this.deregister(mod);
        const filepath = mod.filepath;
        const newMod = await this.load(filepath, true);
        return newMod;
    }
    /**
     * Reloads all modules.
     */
    async reloadAll() {
        const promises = [];
        for (const m of Array.from(this.modules.values())) {
            if (m.filepath)
                promises.push(this.reload(m.id));
        }
        await Promise.all(promises);
        return this;
    }
    /**
     * Removes a module.
     * @param id - ID of the module.
     */
    remove(id) {
        const mod = this.modules.get(id.toString());
        if (!mod)
            throw new AkairoError_js_1.default('MODULE_NOT_FOUND', this.classToHandle.name, id);
        this.deregister(mod);
        this.emit(Constants_js_1.AkairoHandlerEvents.REMOVE, mod);
        return mod;
    }
    /**
     * Removes all modules.
     */
    removeAll() {
        for (const m of Array.from(this.modules.values())) {
            if (m.filepath)
                this.remove(m.id);
        }
        return this;
    }
    /**
     * Reads files recursively from a directory.
     * @param directory - Directory to read.
     */
    static readdirRecursive(directory) {
        const result = [];
        (function read(dir) {
            const files = fs.readdirSync(dir);
            for (const file of files) {
                const filepath = path.join(dir, file);
                if (fs.statSync(filepath).isDirectory()) {
                    read(filepath);
                }
                else {
                    result.push(filepath);
                }
            }
        })(directory);
        return result;
    }
}
exports.default = AkairoHandler;
//# sourceMappingURL=AkairoHandler.js.map