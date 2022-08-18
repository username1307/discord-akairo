import AkairoError from '../../util/AkairoError.js';
import Util from '../../util/Util.js';
import AkairoHandler from '../AkairoHandler.js';
import Inhibitor from './Inhibitor.js';
/**
 * Loads inhibitors and checks messages.
 */
export default class InhibitorHandler extends AkairoHandler {
    /**
     * @param client - The Akairo client.
     * @param options - Options.
     */
    constructor(client, options) {
        const { directory, classToHandle = Inhibitor, extensions = ['.js', '.ts'], automateCategories, loadFilter, } = options ?? {};
        if (!(classToHandle.prototype instanceof Inhibitor ||
            classToHandle === Inhibitor)) {
            throw new AkairoError('INVALID_CLASS_TO_HANDLE', classToHandle.name, Inhibitor.name);
        }
        super(client, {
            directory,
            classToHandle,
            extensions,
            automateCategories,
            loadFilter,
        });
    }
    /**
     * Tests inhibitors against the message.
     * Returns the reason if blocked.
     * @param type - Type of inhibitor, 'all', 'pre', or 'post'.
     * @param message - Message to test.
     * @param command - MessageCommand to use.
     */
    async test(type, message, command) {
        if (!this.modules.size)
            return null;
        const inhibitors = this.modules.filter((i) => i.type === type);
        if (!inhibitors.size)
            return null;
        const promises = [];
        for (const inhibitor of inhibitors.values()) {
            promises.push((async () => {
                let inhibited = inhibitor.exec(message, command);
                if (Util.isPromise(inhibited))
                    inhibited = await inhibited;
                if (inhibited)
                    return inhibitor;
                return null;
            })());
        }
        const inhibitedInhibitors = (await Promise.all(promises)).filter((r) => r);
        if (!inhibitedInhibitors.length)
            return null;
        inhibitedInhibitors.sort((a, b) => b.priority - a.priority);
        return inhibitedInhibitors[0].reason;
    }
}
//# sourceMappingURL=InhibitorHandler.js.map