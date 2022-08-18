/**
 * Base class for a module.
 */
export default class AkairoModule {
    /**
     * @param id - ID of module.
     * @param options - Options.
     */
    constructor(id, options) {
        const { category = 'default' } = options ?? {};
        this.id = id;
        this.categoryID = category;
        this.category = null;
        this.filepath = null;
        this.client = null;
        this.handler = null;
    }
    /**
     * Reloads the module.
     */
    reload() {
        return this.handler?.reload(this.id);
    }
    /**
     * Removes the module.
     */
    remove() {
        return this.handler?.remove(this.id);
    }
    /**
     * Returns the ID.
     */
    toString() {
        return this.id;
    }
}
//# sourceMappingURL=AkairoModule.js.map