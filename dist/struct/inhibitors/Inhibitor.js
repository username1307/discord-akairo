import AkairoError from '../../util/AkairoError.js';
import AkairoModule from '../AkairoModule.js';
/**
 * Represents an inhibitor.
 */
export default class Inhibitor extends AkairoModule {
    /**
     * @param id - Inhibitor ID.
     * @param options - Options for the inhibitor.
     */
    constructor(id, options) {
        const { category, reason = '', type = 'post', priority = 0, } = options ?? {};
        super(id, { category });
        this.reason = reason;
        this.type = type;
        this.priority = priority;
    }
    exec(message, command) {
        throw new AkairoError('NOT_IMPLEMENTED', this.constructor.name, 'exec');
    }
}
//# sourceMappingURL=Inhibitor.js.map