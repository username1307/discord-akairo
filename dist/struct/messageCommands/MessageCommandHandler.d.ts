/// <reference types="node" />
import { Awaitable, Collection, Message, Snowflake, TextBasedChannel, User } from 'discord.js';
import type { MessageCommandHandlerEvents as MessageCommandHandlerEventsType } from '../../typings/events';
import AkairoMessage from '../../util/AkairoMessage.js';
import type Category from '../../util/Category.js';
import AkairoClient from '../AkairoClient.js';
import AkairoHandler, { AkairoHandlerOptions, LoadPredicate } from '../AkairoHandler.js';
import type AkairoModule from '../AkairoModule.js';
import ContextMenuCommandHandler from '../contextMenuCommands/ContextMenuCommandHandler.js';
import type InhibitorHandler from '../inhibitors/InhibitorHandler.js';
import type ListenerHandler from '../listeners/ListenerHandler.js';
import type { DefaultArgumentOptions } from './arguments/Argument.js';
import TypeResolver from './arguments/TypeResolver.js';
import MessageCommand from './MessageCommand';
import MessageCommandUtil from './MessageCommandUtil';
/**
 * Loads messageCommands and handles messages.
 */
export default class MessageCommandHandler extends AkairoHandler {
    /**
     * Collection of command aliases.
     */
    aliases: Collection<string, string>;
    /**
     * Regular expression to automatically make command aliases for.
     */
    aliasReplacement?: RegExp;
    /**
     * Whether mentions are allowed for prefixing.
     */
    allowMention: boolean | MentionPrefixPredicate;
    /**
     * Default argument options.
     */
    argumentDefaults: DefaultArgumentOptions;
    /**
     * Whether or not to block bots.
     */
    blockBots: boolean;
    /**
     * Whether to block self.
     */
    blockClient: boolean;
    /**
     * Categories, mapped by ID to Category.
     */
    categories: Collection<string, Category<string, MessageCommand>>;
    /**
     * Class to handle
     */
    classToHandle: typeof MessageCommand;
    /**
     * The Akairo client.
     */
    client: AkairoClient;
    /**
     * Whether `message.util` is assigned.
     */
    commandUtil: boolean;
    /**
     * Milliseconds a message should exist for before its command util instance is marked for removal.
     */
    commandUtilLifetime: number;
    /**
     * Collection of CommandUtils.
     */
    commandUtils: Collection<string, MessageCommandUtil<Message | AkairoMessage>>;
    /**
     * Time interval in milliseconds for sweeping command util instances.
     */
    commandUtilSweepInterval: number;
    /**
     * Collection of cooldowns.
     * <info>The elements in the collection are objects with user IDs as keys
     * and {@link CooldownData} objects as values</info>
     */
    cooldowns: Collection<string, {
        [id: string]: CooldownData;
    }>;
    /**
     * Default cooldown for messageCommands.
     */
    defaultCooldown: number;
    /**
     * Directory to messageCommands.
     */
    directory: string;
    /**
     * Whether or not members are fetched on each message author from a guild.
     */
    fetchMembers: boolean;
    /**
     * Whether or not edits are handled.
     */
    handleEdits: boolean;
    /**
     * ID of user(s) to ignore cooldown or a function to ignore.
     */
    ignoreCooldown: Snowflake | Snowflake[] | IgnoreCheckPredicate;
    /**
     * ID of user(s) to ignore `userPermissions` checks or a function to ignore.
     */
    ignorePermissions: Snowflake | Snowflake[] | IgnoreCheckPredicate;
    /**
     * Inhibitor handler to use.
     */
    inhibitorHandler: InhibitorHandler | null;
    /**
     * Commands loaded, mapped by ID to MessageCommand.
     */
    modules: Collection<string, MessageCommand>;
    /**
     * The prefix(es) for command parsing.
     */
    prefix: string | string[] | PrefixSupplier;
    /**
     * Collection of prefix overwrites to messageCommands.
     */
    prefixes: Collection<string | PrefixSupplier, Set<string>>;
    /**
     * Collection of sets of ongoing argument prompts.
     */
    prompts: Collection<string, Set<string>>;
    /**
     * The type resolver.
     */
    resolver: TypeResolver;
    /**
     * Whether or not to store messages in MessageCommandUtil.
     */
    storeMessages: boolean;
    /**
     * Show "BotName is typing" information message on the text channels when a command is running.
     */
    typing: boolean;
    /**
     * Whether or not to skip built in reasons post type inhibitors so you can make custom ones.
     */
    skipBuiltInPostInhibitors: boolean;
    /**
     * @param client - The Akairo client.
     * @param options - Options.
     */
    constructor(client: AkairoClient, options: MessageCommandHandlerOptions);
    /**
     * Set up the command handler
     */
    protected setup(): void;
    /**
     * Registers a module.
     * @param command - Module to use.
     * @param filepath - Filepath of module.
     */
    register(command: MessageCommand, filepath?: string): void;
    /**
     * Deregisters a module.
     * @param command - Module to use.
     */
    deregister(command: MessageCommand): void;
    /**
     * Handles a message.
     * @param message - Message to handle.
     */
    handle(message: Message): Promise<boolean | null>;
    /**
     * Handles normal messageCommands.
     * @param message - Message to handle.
     * @param content - Content of message without command.
     * @param command - MessageCommand instance.
     * @param ignore - Ignore inhibitors and other checks.
     */
    handleDirectCommand(message: Message, content: string, command: MessageCommand, ignore?: boolean): Promise<boolean | null>;
    /**
     * Handles regex and conditional messageCommands.
     * @param message - Message to handle.
     */
    handleRegexAndConditionalCommands(message: Message): Promise<boolean>;
    /**
     * Handles regex messageCommands.
     * @param message - Message to handle.
     */
    handleRegexCommands(message: Message): Promise<boolean>;
    /**
     * Handles conditional messageCommands.
     * @param message - Message to handle.
     */
    handleConditionalCommands(message: Message): Promise<boolean>;
    /**
     * Runs inhibitors with the all type.
     * @param message - Message to handle.
     * @param slash - Whether or not the command should is a slash command.
     */
    runAllTypeInhibitors(message: Message | AkairoMessage, slash?: boolean): Promise<boolean>;
    /**
     * Runs inhibitors with the pre type.
     * @param message - Message to handle.
     */
    runPreTypeInhibitors(message: Message | AkairoMessage): Promise<boolean>;
    /**
     * Runs inhibitors with the post type.
     * @param message - Message to handle.
     * @param command - MessageCommand to handle.
     * @param slash - Whether or not the command should is a slash command.
     */
    runPostTypeInhibitors(message: Message | AkairoMessage, command: MessageCommand, slash?: boolean): Promise<boolean>;
    /**
     * Runs permission checks.
     * @param message - Message that called the command.
     * @param command - MessageCommand to cooldown.
     * @param slash - Whether the command is a slash command.
     */
    runPermissionChecks(message: Message | AkairoMessage, command: MessageCommand, slash?: boolean): Promise<boolean>;
    /**
     * Runs cooldowns and checks if a user is under cooldown.
     * @param message - Message that called the command.
     * @param command - MessageCommand to cooldown.
     */
    runCooldowns(message: Message | AkairoMessage, command: MessageCommand): boolean;
    /**
     * Runs a command.
     * @param message - Message to handle.
     * @param command - MessageCommand to handle.
     * @param args - Arguments to use.
     */
    runCommand(message: Message, command: MessageCommand, args: any): Promise<void>;
    /**
     * Parses the command and its argument list.
     * @param message - Message that called the command.
     */
    parseCommand(message: Message | AkairoMessage): Promise<ParsedComponentData>;
    /**
     * Parses the command and its argument list using prefix overwrites.
     * @param message - Message that called the command.
     */
    parseCommandOverwrittenPrefixes(message: Message | AkairoMessage): Promise<ParsedComponentData>;
    /**
     * Runs parseWithPrefix on multiple prefixes and returns the best parse.
     * @param message - Message to parse.
     * @param pairs - Pairs of prefix to associated messageCommands. That is, `[string, Set<string> | null][]`.
     */
    parseMultiplePrefixes(message: Message | AkairoMessage, pairs: [string, Set<string> | null][]): ParsedComponentData;
    /**
     * Tries to parse a message with the given prefix and associated messageCommands.
     * Associated messageCommands refer to when a prefix is used in prefix overrides.
     * @param message - Message to parse.
     * @param prefix - Prefix to use.
     * @param associatedCommands - Associated messageCommands.
     */
    parseWithPrefix(message: Message | AkairoMessage, prefix: string, associatedCommands?: Set<string> | null): ParsedComponentData;
    /**
     * Handles errors from the handling.
     * @param err - The error.
     * @param message - Message that called the command.
     * @param command - MessageCommand that errored.
     */
    emitError(err: Error, message: Message | AkairoMessage, command?: MessageCommand | AkairoModule): void;
    /**
     * Sweep command util instances from cache and returns amount sweeped.
     * @param lifetime - Messages older than this will have their command util instance sweeped. This is in milliseconds and defaults to the `commandUtilLifetime` option.
     */
    sweepCommandUtil(lifetime?: number): number;
    /**
     * Adds an ongoing prompt in order to prevent command usage in the channel.
     * @param channel - Channel to add to.
     * @param user - User to add.
     */
    addPrompt(channel: TextBasedChannel, user: User): void;
    /**
     * Removes an ongoing prompt.
     * @param channel - Channel to remove from.
     * @param user - User to remove.
     */
    removePrompt(channel: TextBasedChannel, user: User): void;
    /**
     * Checks if there is an ongoing prompt.
     * @param channel - Channel to check.
     * @param user - User to check.
     */
    hasPrompt(channel: TextBasedChannel, user: User): boolean;
    /**
     * Finds a command by alias.
     * @param name - Alias to find with.
     */
    findCommand(name: string): MessageCommand;
    /**
     * Set the inhibitor handler to use.
     * @param inhibitorHandler - The inhibitor handler.
     */
    useInhibitorHandler(inhibitorHandler: InhibitorHandler): MessageCommandHandler;
    /**
     * Set the listener handler to use.
     * @param listenerHandler - The listener handler.
     */
    useListenerHandler(listenerHandler: ListenerHandler): MessageCommandHandler;
    /**
     * Set the context menu command handler to use.
     * @param contextMenuCommandHandler - The context menu command handler.
     */
    useContextMenuCommandHandler(contextMenuCommandHandler: ContextMenuCommandHandler): MessageCommandHandler;
}
declare type Events = MessageCommandHandlerEventsType;
export default interface MessageCommandHandler extends AkairoHandler {
    /**
     * Loads a command.
     * @param thing - Module or path to module.
     */
    load(thing: string | MessageCommand): Promise<MessageCommand>;
    /**
     * Reads all messageCommands from the directory and loads them.
     * @param directory - Directory to load from. Defaults to the directory passed in the constructor.
     * @param filter - Filter for files, where true means it should be loaded.
     */
    loadAll(directory?: string, filter?: LoadPredicate): Promise<MessageCommandHandler>;
    /**
     * Removes a command.
     * @param id - ID of the command.
     */
    remove(id: string): MessageCommand;
    /**
     * Removes all messageCommands.
     */
    removeAll(): MessageCommandHandler;
    /**
     * Reloads a command.
     * @param id - ID of the command.
     */
    reload(id: string): Promise<MessageCommand>;
    /**
     * Reloads all messageCommands.
     */
    reloadAll(): Promise<MessageCommandHandler>;
    on<K extends keyof Events>(event: K, listener: (...args: Events[K]) => Awaitable<void>): this;
    once<K extends keyof Events>(event: K, listener: (...args: Events[K]) => Awaitable<void>): this;
}
export interface MessageCommandHandlerOptions extends AkairoHandlerOptions {
    /**
     * Regular expression to automatically make command aliases.
     * For example, using `/-/g` would mean that aliases containing `-` would be valid with and without it.
     * So, the alias `command-name` is valid as both `command-name` and `commandname`.
     */
    aliasReplacement?: RegExp;
    /**
     * Whether or not to allow mentions to the client user as a prefix.
     */
    allowMention?: boolean | MentionPrefixPredicate;
    /**
     * Default argument options.
     * @default {}
     */
    argumentDefaults?: DefaultArgumentOptions;
    /**
     * Whether or not to block bots.
     * @default true
     */
    blockBots?: boolean;
    /**
     * Whether or not to block self.
     * @default true
     */
    blockClient?: boolean;
    /**
     * Whether or not to assign `message.util`.
     */
    commandUtil?: boolean;
    /**
     * Milliseconds a message should exist for before its command util instance is marked for removal.
     * If `0`, MessageCommandUtil instances will never be removed and will cause memory to increase indefinitely.
     * @default 300_000 // 5 minutes
     */
    commandUtilLifetime?: number;
    /**
     * Time interval in milliseconds for sweeping command util instances.
     * If `0`, MessageCommandUtil instances will never be removed and will cause memory to increase indefinitely.
     * @default 300_000 // 5 minutes
     */
    commandUtilSweepInterval?: number;
    /**
     * Default cooldown for messageCommands.
     * @default 0
     */
    defaultCooldown?: number;
    /**
     * Whether or not members are fetched on each message author from a guild.
     * @default false
     */
    fetchMembers?: boolean;
    /**
     * Whether or not to handle edited messages using MessageCommandUtil.
     * @default false
     */
    handleEdits?: boolean;
    /**
     * ID of user(s) to ignore cooldown or a function to ignore. Defaults to the client owner(s).
     * @default client.ownerID
     */
    ignoreCooldown?: Snowflake | Snowflake[] | IgnoreCheckPredicate;
    /**
     * ID of user(s) to ignore `userPermissions` checks or a function to ignore.
     * @default []
     */
    ignorePermissions?: Snowflake | Snowflake[] | IgnoreCheckPredicate;
    /**
     * The prefix(es) for command parsing.
     * @default "!"
     */
    prefix?: string | string[] | PrefixSupplier;
    /**
     * Whether or not to store messages in MessageCommandUtil.
     * @default false
     */
    storeMessages?: boolean;
    /**
     * Show "BotName is typing" information message on the text channels when a command is running.
     * @default false
     */
    typing?: boolean;
    /**
     * Whether or not to skip built in reasons post type inhibitors so you can make custom ones.
     * @default false
     */
    skipBuiltInPostInhibitors?: boolean;
}
/**
 * Data for managing cooldowns.
 */
export interface CooldownData {
    /**
     * When the cooldown ends.
     */
    end: number;
    /**
     * Timeout object.
     */
    timer: NodeJS.Timer;
    /**
     * Number of times the command has been used.
     */
    uses: number;
}
/**
 * Various parsed components of the message.
 */
export interface ParsedComponentData {
    /**
     * The content to the right of the prefix.
     */
    afterPrefix?: string;
    /**
     * The alias used.
     */
    alias?: string;
    /**
     * The command used.
     */
    command?: MessageCommand;
    /**
     * The content to the right of the alias.
     */
    content?: string;
    /**
     * The prefix used.
     */
    prefix?: string;
}
/**
 * A function that returns whether this message should be ignored for a certain check.
 * @param message - Message to check.
 * @param command - MessageCommand to check.
 */
export declare type IgnoreCheckPredicate = (message: Message | AkairoMessage, command: MessageCommand) => boolean;
/**
 * A function that returns whether mentions can be used as a prefix.
 * @param message - Message to option for.
 */
export declare type MentionPrefixPredicate = (message: Message) => boolean | Promise<boolean>;
/**
 * A function that returns the prefix(es) to use.
 * @param message - Message to get prefix for.
 */
export declare type PrefixSupplier = (message: Message) => string | string[] | Promise<string | string[]>;
export {};
/**
 * @typedef {CommandInteractionOptionResolver} VSCodePleaseStopRemovingMyImports
 * @internal
 */
//# sourceMappingURL=MessageCommandHandler.d.ts.map