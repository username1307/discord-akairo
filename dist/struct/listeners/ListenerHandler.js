import { Collection } from 'discord.js';
import AkairoError from '../../util/AkairoError.js';
import Util from '../../util/Util.js';
import AkairoHandler from '../AkairoHandler.js';
import Listener from './Listener.js';
/**
 * Loads listeners and registers them with EventEmitters.
 */
export default class ListenerHandler extends AkairoHandler {
    /**
     * @param client - The Akairo client.
     * @param options - Options.
     */
    constructor(client, options) {
        const { directory, classToHandle = Listener, extensions = ['.js', '.ts'], automateCategories, loadFilter, } = options ?? {};
        if (!(classToHandle.prototype instanceof Listener ||
            classToHandle === Listener)) {
            throw new AkairoError('INVALID_CLASS_TO_HANDLE', classToHandle.name, Listener.name);
        }
        super(client, {
            directory,
            classToHandle,
            extensions,
            automateCategories,
            loadFilter,
        });
        this.emitters = new Collection();
        this.emitters.set('client', this.client);
    }
    /**
     * Adds a listener to the EventEmitter.
     * @param id - ID of the listener.
     */
    addToEmitter(id) {
        const listener = this.modules.get(id.toString());
        if (!listener)
            throw new AkairoError('MODULE_NOT_FOUND', this.classToHandle.name, id);
        const emitter = Util.isEventEmitter(listener.emitter)
            ? listener.emitter
            : this.emitters.get(listener.emitter);
        if (!Util.isEventEmitter(emitter))
            throw new AkairoError('INVALID_TYPE', 'emitter', 'EventEmitter', true);
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
            throw new AkairoError('MODULE_NOT_FOUND', this.classToHandle.name, id);
        const emitter = Util.isEventEmitter(listener.emitter)
            ? listener.emitter
            : this.emitters.get(listener.emitter);
        if (!Util.isEventEmitter(emitter))
            throw new AkairoError('INVALID_TYPE', 'emitter', 'EventEmitter', true);
        emitter.removeListener(listener.event, listener.exec);
        return listener;
    }
    /**
     * Sets custom emitters.
     * @param emitters - Emitters to use. The key is the name and value is the emitter.
     */
    setEmitters(emitters) {
        for (const [key, value] of Object.entries(emitters)) {
            if (!Util.isEventEmitter(value))
                throw new AkairoError('INVALID_TYPE', key, 'EventEmitter', true);
            this.emitters.set(key, value);
        }
        return this;
    }
}
//# sourceMappingURL=ListenerHandler.js.map