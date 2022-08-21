import { Collection } from 'discord.js';
import type AkairoModule from '../struct/AkairoModule.js';
/**
 * A group of modules.
 */
export default class Category<K extends string, V extends AkairoModule> extends Collection<K, V> {
    /**
     * ID of the category.
     */
    id: string;
    /**
     * @param id - ID of the category.
     * @param iterable - Entries to set.
     */
    constructor(id: string, iterable?: Iterable<readonly [K, V]>);
    /**
     * Calls `reload()` on all items in this category.
     */
    reloadAll(): this;
    /**
     * Calls `remove()` on all items in this category.
     */
    removeAll(): this;
    /**
     * Returns the ID.
     */
    toString(): string;
}
//# sourceMappingURL=Category.d.ts.map