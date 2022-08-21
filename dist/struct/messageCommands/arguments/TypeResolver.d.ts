import { Collection } from 'discord.js';
import type AkairoClient from '../../AkairoClient.js';
import type ContextMenuCommandHandler from '../../contextMenuCommands/ContextMenuCommandHandler.js';
import type InhibitorHandler from '../../inhibitors/InhibitorHandler.js';
import type ListenerHandler from '../../listeners/ListenerHandler.js';
import type MessageCommandHandler from '../MessageCommandHandler';
import type { ArgumentTypeCaster, BaseArgumentType } from './Argument.js';
/**
 * Type resolver for command arguments.
 * The types are documented under ArgumentType.
 */
export default class TypeResolver {
    /**
     * The Akairo client.
     */
    client: AkairoClient;
    /**
     * The command handler.
     */
    commandHandler: MessageCommandHandler;
    /**
     * The inhibitor handler.
     */
    inhibitorHandler?: InhibitorHandler | null;
    /**
     * The listener handler.
     */
    listenerHandler?: ListenerHandler | null;
    /**
     * The context menu command handler.
     */
    contextMenuCommandHandler: ContextMenuCommandHandler | null;
    /**
     * Collection of types.
     */
    types: Collection<keyof BaseArgumentType | string, ArgumentTypeCaster>;
    /**
     * @param handler - The command handler.
     */
    constructor(handler: MessageCommandHandler);
    /**
     * Adds built-in types.
     */
    addBuiltInTypes(): void;
    /**
     * Gets the resolver function for a type.
     * @param name - Name of type.
     */
    type<T extends keyof BaseArgumentType>(name: T): ArgumentTypeCaster<BaseArgumentType[T]>;
    type(name: string): ArgumentTypeCaster | undefined;
    /**
     * Adds a new type.
     * @param name - Name of the type.
     * @param fn - Function that casts the type.
     */
    addType(name: string, fn: ArgumentTypeCaster): TypeResolver;
    /**
     * Adds multiple new types.
     * @param types  - Object with keys as the type name and values as the cast function.
     */
    addTypes(types: any): TypeResolver;
}
//# sourceMappingURL=TypeResolver.d.ts.map