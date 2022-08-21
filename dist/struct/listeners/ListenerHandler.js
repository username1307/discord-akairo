"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const AkairoError_js_1 = __importDefault(require("../../util/AkairoError.js"));
const Util_js_1 = __importDefault(require("../../util/Util.js"));
const AkairoHandler_js_1 = __importDefault(require("../AkairoHandler.js"));
const Listener_js_1 = __importDefault(require("./Listener.js"));
/**
 * Loads listeners and registers them with EventEmitters.
 */
class ListenerHandler extends AkairoHandler_js_1.default {
    /**
     * @param client - The Akairo client.
     * @param options - Options.
     */
    constructor(client, options) {
        const { directory, classToHandle = Listener_js_1.default, extensions = ['.js', '.ts'], automateCategories, loadFilter, } = options ?? {};
        if (!(classToHandle.prototype instanceof Listener_js_1.default ||
            classToHandle === Listener_js_1.default)) {
            throw new AkairoError_js_1.default('INVALID_CLASS_TO_HANDLE', classToHandle.name, Listener_js_1.default.name);
        }
        super(client, {
            directory,
            classToHandle,
            extensions,
            automateCategories,
            loadFilter,
        });
        this.emitters = new discord_js_1.Collection();
        this.emitters.set('client', this.client);
    }
    /**
     * Adds a listener to the EventEmitter.
     * @param id - ID of the listener.
     */
    addToEmitter(id) {
        const listener = this.modules.get(id.toString());
        if (!listener)
            throw new AkairoError_js_1.default('MODULE_NOT_FOUND', this.classToHandle.name, id);
        const emitter = Util_js_1.default.isEventEmitter(listener.emitter)
            ? listener.emitter
            : this.emitters.get(listener.emitter);
        if (!Util_js_1.default.isEventEmitter(emitter))
            throw new AkairoError_js_1.default('INVALID_TYPE', 'emitter', 'EventEmitter', true);
        emitter[listener.type ?? 'on'](listener.event, listener.exec);
        return listener;
    }
    /**
     * Deregisters a listener.
     * @param mod - Listener to use.
     */
    deregister(listener) {
        this.removeFromEmitter(listener.id);
        super.deregister(listener);
    }
    /**
     * Registers a listener.
     * @param listener - Listener to use.
     * @param filepath - Filepath of listener.
     */
    register(listener, filepath) {
        super.register(listener, filepath);
        listener.exec = listener.exec.bind(listener);
        this.addToEmitter(listener.id);
    }
    /**
     * Removes a listener from the EventEmitter.
     * @param id - ID of the listener.
     */
    removeFromEmitter(id) {
        const listener = this.modules.get(id.toString());
        if (!listener)
            throw new AkairoError_js_1.default('MODULE_NOT_FOUND', this.classToHandle.name, id);
        const emitter = Util_js_1.default.isEventEmitter(listener.emitter)
            ? listener.emitter
            : this.emitters.get(listener.emitter);
        if (!Util_js_1.default.isEventEmitter(emitter))
            throw new AkairoError_js_1.default('INVALID_TYPE', 'emitter', 'EventEmitter', true);
        emitter.removeListener(listener.event, listener.exec);
        return listener;
    }
    /**
     * Sets custom emitters.
     * @param emitters - Emitters to use. The key is the name and value is the emitter.
     */
    setEmitters(emitters) {
        for (const [key, value] of Object.entries(emitters)) {
            if (!Util_js_1.default.isEventEmitter(value))
                throw new AkairoError_js_1.default('INVALID_TYPE', key, 'EventEmitter', true);
            this.emitters.set(key, value);
        }
        return this;
    }
}
exports.default = ListenerHandler;
//# sourceMappingURL=ListenerHandler.js.map