import { AutocompleteInteraction, Message, PermissionResolvable, Snowflake } from 'discord.js';
import type AkairoMessage from '../../util/AkairoMessage.js';
import type Category from '../../util/Category.js';
import type AkairoClient from '../AkairoClient.js';
import AkairoModule, { AkairoModuleOptions } from '../AkairoModule.js';
import { ArgumentOptions, DefaultArgumentOptions } from './arguments/Argument.js';
import ArgumentRunner, { ArgumentRunnerState } from './arguments/ArgumentRunner.js';
import MessageCommandHandler, { IgnoreCheckPredicate, PrefixSupplier } from './MessageCommandHandler';
import ContentParser, { ContentParserResult } from './ContentParser.js';
import type Flag from './Flag.js';
/**
 * Represents a command.
 */
export default abstract class MessageCommand extends AkairoModule {
    /**
     * MessageCommand names.
     */
    aliases: string[];
    /**
     * Argument options or generator.
     */
    _args?: ArgumentOptions[] | ArgumentGenerator;
    /**
     * Default prompt options.
     */
    argumentDefaults: DefaultArgumentOptions;
    /**
     * The argument runner.
     */
    argumentRunner: ArgumentRunner;
    /**
     * Category the command belongs to.
     */
    category: Category<string, MessageCommand>;
    /**
     * Usable only in this channel type.
     */
    channel?: string;
    /**
     * The Akairo client.
     */
    client: AkairoClient;
    /**
     * Permissions required to run command by the client.
     */
    clientPermissions?: PermissionResolvable | PermissionResolvable[] | MissingPermissionSupplier;
    /**
     * Cooldown in milliseconds.
     */
    cooldown: number | null;
    /**
     * The content parser.
     */
    contentParser: ContentParser;
    /**
     * Description of the command.
     */
    description: string | any | any[];
    /**
     * Whether or not this command can be ran by an edit.
     */
    editable: boolean;
    /**
     * The filepath.
     */
    filepath: string;
    /**
     * The handler.
     */
    handler: MessageCommandHandler;
    /**
     * The ID of the command.
     */
    id: string;
    /**
     * ID of user(s) to ignore cooldown or a function to ignore.
     */
    ignoreCooldown?: Snowflake | Snowflake[] | IgnoreCheckPredicate;
    /**
     * ID of user(s) to ignore `userPermissions` checks or a function to ignore.
     */
    ignorePermissions?: Snowflake | Snowflake[] | IgnoreCheckPredicate;
    /**
     * The key supplier for the locker.
     */
    lock?: KeySupplier | 'channel' | 'guild' | 'user';
    /**
     * Stores the current locks.
     */
    locker?: Set<string>;
    /**
     * Usable only by the client owner.
     */
    ownerOnly: boolean;
    /**
     * MessageCommand prefix overwrite.
     */
    prefix?: string | string[] | PrefixSupplier;
    /**
     * Whether or not to consider quotes.
     */
    quoted: boolean;
    /**
     * Uses allowed before cooldown.
     */
    ratelimit: number;
    /**
     * The regex trigger for this command.
     */
    regex?: RegExp | RegexSupplier;
    /**
     * Whether to allow client superUsers(s) only.
     */
    superUserOnly: boolean;
    /**
     * Whether or not to type during command execution.
     */
    typing: boolean;
    /**
     * Permissions required to run command by the user.
     */
    userPermissions?: PermissionResolvable | PermissionResolvable[] | MissingPermissionSupplier;
    /**
     * Generator for arguments.
     */
    argumentGenerator: ArgumentGenerator;
    /**
     * @param id - MessageCommand ID.
     * @param options - Options for the command.
     */
    constructor(id: string, options?: MessageCommandOptions);
    /**
     * Generator for arguments.
     * When yielding argument options, that argument is ran and the result of the processing is given.
     * The last value when the generator is done is the resulting `args` for the command's `exec`.
     * @param message - Message that triggered the command.
     * @param parsed - Parsed content.
     * @param state - Argument processing state.
     */
    args(message: Message, parsed: ContentParserResult, state: ArgumentRunnerState): IterableIterator<ArgumentOptions | Flag>;
    /**
     * Runs before argument parsing and execution.
     * @param message - Message being handled.
     */
    before(message: Message): any;
    /**
     * Checks if the command should be ran by using an arbitrary condition.
     * @param message - Message being handled.
     */
    condition(message: Message): boolean | Promise<boolean>;
    /**
     * Executes the command.
     * @param message - Message that triggered the command.
     * @param args - Evaluated arguments.
     */
    exec(message: Message, args: any): any;
    exec(message: Message | AkairoMessage, args: any): any;
    /**
     * Respond to autocomplete interactions for this command.
     * @param interaction The autocomplete interaction
     */
    autocomplete(interaction: AutocompleteInteraction): any;
    /**
     * Parses content using the command's arguments.
     * @param message - Message to use.
     * @param content - String to parse.
     */
    parse(message: Message, content: string): Promise<Flag | any>;
}
export default interface MessageCommand extends AkairoModule {
    /**
     * Reloads the command.
     */
    reload(): Promise<MessageCommand>;
    /**
     * Removes the command.
     */
    remove(): MessageCommand;
}
/**
 * Options to use for command execution behavior.
 */
export interface MessageCommandOptions extends AkairoModuleOptions {
    /**
     * MessageCommand names.
     * @default []
     */
    aliases?: string[];
    /**
     * Argument options or generator.
     * @default this._args || this.args || []
     */
    args?: ArgumentOptions[] | ArgumentGenerator;
    /**
     * The default argument options.
     * @default {}
     */
    argumentDefaults?: DefaultArgumentOptions;
    /**
     * Function to run before argument parsing and execution.
     * @default this.before || (() => undefined)
     */
    before?: BeforeAction;
    /**
     * Restricts channel to either 'guild' or 'dm'.
     * @default null
     */
    channel?: 'guild' | 'dm';
    /**
     * Permissions required by the client to run this command.
     * @default this.clientPermissions
     */
    clientPermissions?: PermissionResolvable | PermissionResolvable[] | MissingPermissionSupplier;
    /**
     * Whether or not to run on messages that are not directly messageCommands.
     * @default this.condition || (() => false)
     */
    condition?: ExecutionPredicate;
    /**
     * The command cooldown in milliseconds.
     * @default null
     */
    cooldown?: number;
    /**
     * Description of the command.
     * @default ""
     */
    description?: string | any | any[];
    /**
     * Whether or not message edits will run this command.
     * @default true
     */
    editable?: boolean;
    /**
     * Flags to use when using an ArgumentGenerator
     * @default []
     */
    flags?: string[];
    /**
     * ID of user(s) to ignore cooldown or a function to ignore.
     */
    ignoreCooldown?: Snowflake | Snowflake[] | IgnoreCheckPredicate;
    /**
     * ID of user(s) to ignore `userPermissions` checks or a function to ignore.
     */
    ignorePermissions?: Snowflake | Snowflake[] | IgnoreCheckPredicate;
    /**
     * The key type or key generator for the locker. If lock is a string, it's expected one of 'guild', 'channel', or 'user'
     */
    lock?: KeySupplier | 'guild' | 'channel' | 'user';
    /**
     * Option flags to use when using an ArgumentGenerator.
     * @default []
     */
    optionFlags?: string[];
    /**
     * Whether or not to allow client owner(s) only.
     * @default false
     */
    ownerOnly?: boolean;
    /**
     * The prefix(es) to overwrite the global one for this command.
     * @default this.prefix
     */
    prefix?: string | string[] | PrefixSupplier;
    /**
     * Whether or not to consider quotes.
     * @default true
     */
    quoted?: boolean;
    /**
     * Amount of command uses allowed until cooldown.
     * @default 1
     */
    ratelimit?: number;
    /**
     * A regex to match in messages that are not directly messageCommands. The args object will have `match` and `matches` properties.
     * @default this.regex
     */
    regex?: RegExp | RegexSupplier;
    /**
     * Custom separator for argument input.
     */
    separator?: string;
    /**
     * Whether to allow client superUsers(s) only.
     * @default false
     */
    superUserOnly?: boolean;
    /**
     * Whether or not to type in channel during execution.
     * @default false
     */
    typing?: boolean;
    /**
     * Permissions required by the user to run this command.
     * @default this.userPermissions
     */
    userPermissions?: PermissionResolvable | PermissionResolvable[] | MissingPermissionSupplier;
}
/**
 * A function to run before argument parsing and execution.
 * @param message - Message that triggered the command.
 */
export declare type BeforeAction = (message: Message) => any;
/**
 * A function used to supply the key for the locker.
 * @param message - Message that triggered the command.
 * @param args - Evaluated arguments.
 */
export declare type KeySupplier = (message: Message | AkairoMessage, args: any) => string;
/**
 * A function used to check if the command should run arbitrarily.
 * @param message - Message to check.
 */
export declare type ExecutionPredicate = (message: Message) => boolean | Promise<boolean>;
/**
 * A function used to check if a message has permissions for the command.
 * A non-null return value signifies the reason for missing permissions.
 * @param message - Message that triggered the command.
 */
export declare type MissingPermissionSupplier = (message: Message | AkairoMessage) => Promise<any> | any;
/**
 * A function used to return a regular expression.
 * @param message - Message to get regex for.
 */
export declare type RegexSupplier = (message: Message) => RegExp;
/**
 * Generator for arguments.
 * When yielding argument options, that argument is ran and the result of the processing is given.
 * The last value when the generator is done is the resulting `args` for the command's `exec`.
 * @param message - Message that triggered the command.
 * @param parsed - Parsed content.
 * @param state - Argument processing state.
 */
export declare type ArgumentGenerator = (message: Message, parsed: ContentParserResult, state: ArgumentRunnerState) => IterableIterator<ArgumentOptions | Flag>;
//# sourceMappingURL=MessageCommand.d.ts.map