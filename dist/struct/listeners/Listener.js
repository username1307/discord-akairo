import AkairoError from '../../util/AkairoError.js';
import AkairoModule from '../AkairoModule.js';
/**
 * Represents a listener.
 */
export default class Listener extends AkairoModule {
    /**
     * @param id - Listener ID.
     * @param options - Options for the listener.
     */
    constructor(id, options) {
        const { category, emitter, event, type = 'on' } = options;
        super(id, { category });
        this.emitter = emitter;
        this.event = event;
        this.type = type;
    }
    /**
     * Executes the listener.
     * @param args - Arguments.
     */
    exec(...args) {
        throw new AkairoError('NOT_IMPLEMENTED', this.constructor.name, 'exec');
    }
}
//# sourceMappingURL=Listener.js.map