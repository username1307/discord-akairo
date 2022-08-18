import AkairoError from '../../util/AkairoError.js';
import AkairoModule from '../AkairoModule.js';
/**
 * Represents a context menu command.
 */
export default class ContextMenuCommand extends AkairoModule {
    /**
     * @param id - Listener ID.
     * @param options - Options for the context menu command.
     */
    constructor(id, options) {
        const { category, guilds, name, ownerOnly, superUserOnly, type } = options;
        super(id, { category });
        this.guilds = guilds;
        this.name = name;
        this.ownerOnly = ownerOnly;
        this.superUserOnly = superUserOnly;
        this.type = type;
    }
    /**
     * Executes the context menu command.
     * @param interaction - The context menu command interaction.
     */
    exec(interaction) {
        throw new AkairoError('NOT_IMPLEMENTED', this.constructor.name, 'exec');
    }
}
//# sourceMappingURL=ContextMenuCommand.js.map