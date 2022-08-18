import type Category from '../util/Category.js';
import type AkairoClient from './AkairoClient.js';
import type AkairoHandler from './AkairoHandler.js';
/**
 * Base class for a module.
 */
export default abstract class AkairoModule {
    /**
     * Category this belongs to.
     */
    category: Category<string, AkairoModule>;
    /**
     * ID of the category this belongs to.
     */
    categoryID: string;
    /**
     * The Akairo client.
     */
    client: AkairoClient;
    /**
     * The filepath.
     */
    filepath: string;
    /**
     * The handler.
     */
    handler: AkairoHandler;
    /**
     * ID of the module.
     */
    id: string;
    /**
     * @param id - ID of module.
     * @param options - Options.
     */
    constructor(id: string, options?: AkairoModuleOptions);
    /**
     * Reloads the module.
     */
    reload(): Promise<AkairoModule>;
    /**
     * Removes the module.
     */
    remove(): AkairoModule;
    /**
     * Returns the ID.
     */
    toString(): string;
}
export interface AkairoModuleOptions {
    /**
     * Category ID for organization purposes.
     * @default "default"
     */
    category?: string;
}
//# sourceMappingURL=AkairoModule.d.ts.map