import { Collection } from 'discord.js';
/**
 * A group of modules.
 */
export default class Category extends Collection {
    /**
     * @param id - ID of the category.
     * @param iterable - Entries to set.
     */
    constructor(id, iterable) {
        super(iterable);
        this.id = id;
    }
    /**
     * Calls `reload()` on all items in this category.
     */
    reloadAll() {
        for (const m of this.values()) {
            if (m.filepath)
                m.reload();
        }
        return this;
    }
    /**
     * Calls `remove()` on all items in this category.
     */
    removeAll() {
        for (const m of Array.from(this.values())) {
            if (m.filepath)
                m.remove();
        }
        return this;
    }
    /**
     * Returns the ID.
     */
    toString() {
        return this.id;
    }
}
//# sourceMappingURL=Category.js.map