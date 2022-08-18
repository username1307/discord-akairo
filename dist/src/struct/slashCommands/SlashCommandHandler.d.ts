import { AutocompleteInteraction, Awaitable, ChatInputCommandInteraction, Collection, Snowflake } from 'discord.js';
import type { SlashCommandHandlerEvents as SlashCommandHandlerEventsType } from '../../typings/events';
import AkairoMessage from '../../util/AkairoMessage';
import type Category from '../../util/Category';
import AkairoClient from '../AkairoClient';
import AkairoHandler, { LoadPredicate, AkairoHandlerOptions } from '../AkairoHandler';
import type AkairoModule from '../AkairoModule';
import ContextMenuCommandHandler from '../contextMenuCommands/ContextMenuCommandHandler';
import type InhibitorHandler from '../inhibitors/InhibitorHandler';
import type ListenerHandler from '../listeners/ListenerHandler';
import TypeResolver from '../messageCommands/arguments/TypeResolver';
import SlashCommand from './SlashCommand';
export default class SlashCommandHandler extends AkairoHandler {
    blockBots: boolean;
    blockClient: boolean;
    categories: Collection<string, Category<string, SlashCommand>>;
    classToHandle: typeof SlashCommand;
    client: AkairoClient;
    directory: string;
    ignorePermissions: Snowflake | Snowflake[] | IgnoreCheckPredicate;
    inhibitorHandler: InhibitorHandler | null;
    modules: Collection<string, SlashCommand>;
    names: Collection<string, string>;
    resolver: TypeResolver;
    skipBuiltInPostInhibitors: boolean;
    constructor(client: AkairoClient, options: SlashCommandHandlerOptions);
    protected setup(): void;
    register(command: SlashCommand, filepath?: string): void;
    deregister(command: SlashCommand): void;
    handleSlash(interaction: ChatInputCommandInteraction): Promise<boolean | null>;
    handleAutocomplete(interaction: AutocompleteInteraction): void;
    runAllTypeInhibitors(message: AkairoMessage): Promise<boolean>;
    runPreTypeInhibitors(message: AkairoMessage): Promise<boolean>;
    runPostTypeInhibitors(message: AkairoMessage, command: SlashCommand): Promise<boolean>;
    runPermissionChecks(message: AkairoMessage, command: SlashCommand): Promise<boolean>;
    emitError(err: Error, message: AkairoMessage, command?: SlashCommand | AkairoModule): void;
    findCommand(name: string): SlashCommand;
    useInhibitorHandler(inhibitorHandler: InhibitorHandler): SlashCommandHandler;
    useListenerHandler(listenerHandler: ListenerHandler): SlashCommandHandler;
    useContextMenuCommandHandler(contextMenuCommandHandler: ContextMenuCommandHandler): SlashCommandHandler;
}
declare type Events = SlashCommandHandlerEventsType;
export default interface SlashCommandHandler extends AkairoHandler {
    load(thing: string | SlashCommand): Promise<SlashCommand>;
    loadAll(directory?: string, filter?: LoadPredicate): Promise<SlashCommandHandler>;
    remove(id: string): SlashCommand;
    removeAll(): SlashCommandHandler;
    reload(id: string): Promise<SlashCommand>;
    reloadAll(): Promise<SlashCommandHandler>;
    on<K extends keyof Events>(event: K, listener: (...args: Events[K]) => Awaitable<void>): this;
    once<K extends keyof Events>(event: K, listener: (...args: Events[K]) => Awaitable<void>): this;
}
export interface SlashCommandHandlerOptions extends AkairoHandlerOptions {
    blockBots?: boolean;
    blockClient?: boolean;
    ignorePermissions?: Snowflake | Snowflake[] | IgnoreCheckPredicate;
    skipBuiltInPostInhibitors?: boolean;
}
export declare type IgnoreCheckPredicate = (message: AkairoMessage, command: SlashCommand) => boolean;
export declare type SlashResolveTypes = 'boolean' | 'channel' | 'string' | 'integer' | 'number' | 'user' | 'member' | 'role' | 'mentionable' | 'message' | 'attachment';
export {};
//# sourceMappingURL=SlashCommandHandler.d.ts.map