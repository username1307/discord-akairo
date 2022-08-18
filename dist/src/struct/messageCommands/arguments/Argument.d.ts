/// <reference types="node" />
import type { BaseGuildVoiceChannel, CategoryChannel, Collection, Emoji, Guild, GuildBasedChannel, GuildChannel, GuildEmoji, GuildMember, Invite, Message, MessageOptions, MessagePayload, NewsChannel, Role, StageChannel, TextChannel, ThreadChannel, User, VoiceChannel } from 'discord.js';
import type { URL } from 'url';
import type AkairoClient from '../../AkairoClient.js';
import ContextMenuCommand from '../../contextMenuCommands/ContextMenuCommand.js';
import Inhibitor from '../../inhibitors/Inhibitor.js';
import Listener from '../../listeners/Listener.js';
import type MessageCommand from '../MessageCommand';
import type MessageCommandHandler from '../MessageCommandHandler';
import Flag from '../Flag.js';
import type TypeResolver from './TypeResolver.js';
/** ```ts
 * <R = unknown> = ArgumentTypeCaster<R>
 * ``` */
declare type ATC<R = unknown> = ArgumentTypeCaster<R>;
/** ```ts
 * keyof BaseArgumentType
 * ``` */
declare type KBAT = keyof BaseArgumentType;
/** ```ts
 * <R> = ArgumentTypeCasterReturn<R>
 * ``` */
declare type ATCR<R> = ArgumentTypeCasterReturn<R>;
/** ```ts
 * ArgumentType
 * ``` */
declare type AT = ArgumentType;
/** ```ts
 * BaseArgumentType
 * ``` */
declare type BAT = BaseArgumentType;
/** ```ts
 * <T extends ArgumentTypeCaster> = ArgumentTypeCaster<ArgumentTypeCasterReturn<T>>
 * ``` */
declare type ATCATCR<T extends ArgumentTypeCaster> = ArgumentTypeCaster<ArgumentTypeCasterReturn<T>>;
/** ```ts
 * <T extends keyof BaseArgumentType> = ArgumentTypeCaster<BaseArgumentType[T]>
 * ``` */
declare type ATCBAT<T extends keyof BaseArgumentType> = ArgumentTypeCaster<BaseArgumentType[T]>;
/**
 * Represents an argument for a command.
 */
export default class Argument {
    /**
     * The command this argument belongs to.
     */
    command: MessageCommand;
    /**
     * The default value of the argument or a function supplying the default value.
     */
    default: DefaultValueSupplier | any;
    /**
     *  Description of the command.
     */
    description: string | any;
    /**
     * The string(s) to use for flag or option match.
     */
    flag?: string | string[] | null;
    /**
     * The index to start from.
     */
    index?: number;
    /**
     * The amount of phrases to match for rest, separate, content, or text match.
     */
    limit: number;
    /**
     * The method to match text.
     */
    match: ArgumentMatch;
    /**
     * Function to modify otherwise content.
     */
    modifyOtherwise: OtherwiseContentModifier;
    /**
     * Whether to process multiple option flags instead of just the first.
     */
    multipleFlags: boolean;
    /**
     * The content or function supplying the content sent when argument parsing fails.
     */
    otherwise?: string | MessagePayload | MessageOptions | OtherwiseContentSupplier;
    /**
     * The prompt options.
     */
    prompt?: ArgumentPromptOptions | boolean;
    /**
     * The type to cast to or a function to use to cast.
     */
    type: ArgumentType | ArgumentTypeCaster;
    /**
     * Whether the argument is unordered.
     */
    unordered: boolean | number | number[];
    /**
     * @param command - MessageCommand of the argument.
     * @param options - Options for the argument.
     */
    constructor(command: MessageCommand, options?: ArgumentOptions);
    /**
     * The client.
     */
    get client(): AkairoClient;
    /**
     * The command handler.
     */
    get handler(): MessageCommandHandler;
    /**
     * Casts a phrase to this argument's type.
     * @param message - Message that called the command.
     * @param phrase - Phrase to process.
     */
    cast(message: Message, phrase: string): Promise<any>;
    /**
     * Collects input from the user by prompting.
     * @param message - Message to prompt.
     * @param commandInput - Previous input from command if there was one.
     * @param parsedInput - Previous parsed input from command if there was one.
     */
    collect(message: Message, commandInput?: string, parsedInput?: any): Promise<Flag | any>;
    /**
     * Processes the type casting and prompting of the argument for a phrase.
     * @param message - The message that called the command.
     * @param phrase - The phrase to process.
     */
    process(message: Message, phrase: string): Promise<Flag | any>;
    /**
     * Casts a phrase to this argument's type.
     * @param type - The type to cast to.
     * @param resolver - The type resolver.
     * @param message - Message that called the command.
     * @param phrase - Phrase to process.
     */
    static cast<T extends ATC>(type: T, resolver: TypeResolver, message: Message, phrase: string): Promise<ATCR<T>>;
    static cast<T extends KBAT>(type: T, resolver: TypeResolver, message: Message, phrase: string): Promise<BAT[T]>;
    static cast(type: AT | ATC, resolver: TypeResolver, message: Message, phrase: string): Promise<any>;
    /**
     * Creates a type that is the left-to-right composition of the given types.
     * If any of the types fails, the entire composition fails.
     * @param types - Types to use.
     */
    static compose<T extends ATC>(...types: T[]): ATCATCR<T>;
    static compose<T extends KBAT>(...types: T[]): ATCBAT<T>;
    static compose(...types: (AT | ATC)[]): ATC;
    /**
     * Creates a type that is the left-to-right composition of the given types.
     * If any of the types fails, the composition still continues with the failure passed on.
     * @param types - Types to use.
     */
    static composeWithFailure<T extends ATC>(...types: T[]): ATCATCR<T>;
    static composeWithFailure<T extends KBAT>(...types: T[]): ATCBAT<T>;
    static composeWithFailure(...types: (AT | ATC)[]): ATC;
    /**
     * Checks if something is null, undefined, or a fail flag.
     * @param value - Value to check.
     */
    static isFailure(value: any): value is null | undefined | (Flag & {
        value: any;
    });
    /**
     * Creates a type from multiple types (product type).
     * Only inputs where each type resolves with a non-void value are valid.
     * @param types - Types to use.
     */
    static product<T extends ATC>(...types: T[]): ATCATCR<T>;
    static product<T extends KBAT>(...types: T[]): ATCBAT<T>;
    static product(...types: (AT | ATC)[]): ATC;
    /**
     * Creates a type where the parsed value must be within a range.
     * @param type - The type to use.
     * @param min - Minimum value.
     * @param max - Maximum value.
     * @param inclusive - Whether or not to be inclusive on the upper bound.
     */
    static range<T extends ATC>(type: T, min: number, max: number, inclusive?: boolean): ATCATCR<T>;
    static range<T extends KBAT>(type: T, min: number, max: number, inclusive?: boolean): ATCBAT<T>;
    static range(type: AT | ATC, min: number, max: number, inclusive?: boolean): ATC;
    /**
     * Creates a type that parses as normal but also tags it with some data.
     * Result is in an object `{ tag, value }` and wrapped in `Flag.fail` when failed.
     * @param type - The type to use.
     * @param tag - Tag to add. Defaults to the `type` argument, so useful if it is a string.
     */
    static tagged<T extends ATC>(type: T, tag?: any): ATCATCR<T>;
    static tagged<T extends KBAT>(type: T, tag?: any): ATCBAT<T>;
    static tagged(type: AT | ATC, tag?: any): ATC;
    /**
     * Creates a type from multiple types (union type).
     * The first type that resolves to a non-void value is used.
     * Each type will also be tagged using `tagged` with themselves.
     * @param types - Types to use.
     */
    static taggedUnion<T extends ATC>(...types: T[]): ATCATCR<T>;
    static taggedUnion<T extends KBAT>(...types: T[]): ATCBAT<T>;
    static taggedUnion(...types: (AT | ATC)[]): ATC;
    /**
     * Creates a type that parses as normal but also tags it with some data and carries the original input.
     * Result is in an object `{ tag, input, value }` and wrapped in `Flag.fail` when failed.
     * @param type - The type to use.
     * @param tag - Tag to add. Defaults to the `type` argument, so useful if it is a string.
     */
    static taggedWithInput<T extends ATC>(type: T, tag?: any): ATCATCR<T>;
    static taggedWithInput<T extends KBAT>(type: T, tag?: any): ATCBAT<T>;
    static taggedWithInput(type: AT | ATC, tag?: any): ATC;
    /**
     * Creates a type from multiple types (union type).
     * The first type that resolves to a non-void value is used.
     * @param types - Types to use.
     */
    static union<T extends ATC>(...types: T[]): ATCATCR<T>;
    static union<T extends KBAT>(...types: T[]): ATCBAT<T>;
    static union(...types: (AT | ATC)[]): ATC;
    /**
     * Creates a type with extra validation.
     * If the predicate is not true, the value is considered invalid.
     * @param type - The type to use.
     * @param predicate - The predicate function.
     */
    static validate<T extends ATC>(type: T, predicate: ParsedValuePredicate): ATCATCR<T>;
    static validate<T extends KBAT>(type: T, predicate: ParsedValuePredicate): ATCBAT<T>;
    static validate(type: AT | ATC, predicate: ParsedValuePredicate): ATC;
    /**
     * Creates a type that parses as normal but also carries the original input.
     * Result is in an object `{ input, value }` and wrapped in `Flag.fail` when failed.
     * @param type - The type to use.
     */
    static withInput<T extends ATC>(type: T): ATC<ATCR<T>>;
    static withInput<T extends KBAT>(type: T): ATCBAT<T>;
    static withInput(type: AT | ATC): ATC;
}
/**
 * Options for how an argument parses text.
 */
export interface ArgumentOptions {
    /**
     * Default value if no input or did not cast correctly.
     * If using a flag match, setting the default value to a non-void value inverses the result.
     */
    default?: DefaultValueSupplier | any;
    /**
     * The description of the argument
     */
    description?: string | any | any[];
    /**
     * The string(s) to use as the flag for flag or option match.
     */
    flag?: string | string[];
    /**
     * ID of the argument for use in the args object. This does nothing inside an ArgumentGenerator.
     */
    id?: string;
    /**
     * Index of phrase to start from. Applicable to phrase, text, content, rest, or separate match only.
     * Ignored when used with the unordered option.
     */
    index?: number;
    /**
     * Amount of phrases to match when matching more than one.
     * Applicable to text, content, rest, or separate match only.
     * @default Infinity.
     */
    limit?: number;
    /**
     * Method to match text. Defaults to 'phrase'.
     * @default ArgumentMatches.PHRASE
     */
    match?: ArgumentMatch;
    /**
     * Function to modify otherwise content.
     */
    modifyOtherwise?: OtherwiseContentModifier;
    /**
     * Whether or not to have flags process multiple inputs.
     * For option flags, this works like the separate match; the limit option will also work here.
     * For flags, this will count the number of occurrences.
     * @default false
     */
    multipleFlags?: boolean;
    /**
     * Text sent if argument parsing fails. This overrides the `default` option and all prompt options.
     */
    otherwise?: string | MessagePayload | MessageOptions | OtherwiseContentSupplier;
    /**
     * Prompt options for when user does not provide input.
     */
    prompt?: ArgumentPromptOptions | boolean;
    /**
     * Type to cast to.
     * @default ArgumentTypes.STRING
     */
    type?: ArgumentType | ArgumentTypeCaster;
    /**
     * Marks the argument as unordered.
     * Each phrase is evaluated in order until one matches (no input at all means no evaluation).
     * Passing in a number forces evaluation from that index onwards.
     * Passing in an array of numbers forces evaluation on those indices only.
     * If there is a match, that index is considered used and future unordered args will not check that index again.
     * If there is no match, then the prompting or default value is used.
     * Applicable to phrase match only.
     * @default false
     */
    unordered?: boolean | number | number[];
}
/**
 * Data passed to argument prompt functions.
 */
export interface ArgumentPromptData {
    /**
     * Whether the prompt is infinite or not.
     */
    infinite: boolean;
    /**
     * The message that caused the prompt.
     */
    message: Message;
    /**
     * Amount of retries so far.
     */
    retries: number;
    /**
     * The input phrase that caused the prompt if there was one, otherwise an empty string.
     */
    phrase: string;
    /**
     * The value that failed if there was one, otherwise null.
     */
    failure: void | (Flag & {
        value: any;
    });
}
/**
 * A prompt to run if the user did not input the argument correctly.
 * Can only be used if there is not a default value (unless optional is true).
 */
export interface ArgumentPromptOptions {
    /**
     * Whenever an input matches the format of a command, this option controls whether or not to cancel this command and run that command.
     * The command to be run may be the same command or some other command.
     * Defaults to true,
     */
    breakout?: boolean;
    /**
     * Text sent on cancellation of command.
     */
    cancel?: string | MessagePayload | MessageOptions | PromptContentSupplier;
    /**
     * Word to use for cancelling the command. Defaults to 'cancel'.
     */
    cancelWord?: string;
    /**
     * Text sent on amount of tries reaching the max.
     */
    ended?: string | MessagePayload | MessageOptions | PromptContentSupplier;
    /**
     * Prompts forever until the stop word, cancel word, time limit, or retry limit.
     * Note that the retry count resets back to one on each valid entry.
     * The final evaluated argument will be an array of the inputs.
     * Defaults to false.
     */
    infinite?: boolean;
    /**
     * Amount of inputs allowed for an infinite prompt before finishing. Defaults to Infinity.
     */
    limit?: number;
    /**
     * Function to modify cancel messages.
     */
    modifyCancel?: PromptContentModifier;
    /**
     * Function to modify out of tries messages.
     */
    modifyEnded?: PromptContentModifier;
    /**
     * Function to modify retry prompts.
     */
    modifyRetry?: PromptContentModifier;
    /**
     * Function to modify start prompts.
     */
    modifyStart?: PromptContentModifier;
    /**
     * Function to modify timeout messages.
     */
    modifyTimeout?: PromptContentModifier;
    /**
     * Prompts only when argument is provided but was not of the right type. Defaults to false.
     */
    optional?: boolean;
    /**
     * Amount of retries allowed. Defaults to 1.
     */
    retries?: number;
    /**
     * Text sent on a retry (failure to cast type).
     */
    retry?: string | MessagePayload | MessageOptions | PromptContentSupplier;
    /**
     * Text sent on start of prompt.
     */
    start?: string | MessagePayload | MessageOptions | PromptContentSupplier;
    /**
     * Word to use for ending infinite prompts. Defaults to 'stop'.
     */
    stopWord?: string;
    /**
     * Time to wait for input. Defaults to 30000.
     */
    time?: number;
    /**
     * Text sent on collector time out.
     */
    timeout?: string | MessagePayload | MessageOptions | PromptContentSupplier;
}
/**
 * The method to match arguments from text.
 * - `phrase` matches by the order of the phrases inputted.
 * It ignores phrases that matches a flag.
 * - `flag` matches phrases that are the same as its flag.
 * The evaluated argument is either true or false.
 * - `option` matches phrases that starts with the flag.
 * The phrase after the flag is the evaluated argument.
 * - `rest` matches the rest of the phrases.
 * It ignores phrases that matches a flag.
 * It preserves the original whitespace between phrases and the quotes around phrases.
 * - `separate` matches the rest of the phrases and processes each individually.
 * It ignores phrases that matches a flag.
 * - `text` matches the entire text, except for the command.
 * It ignores phrases that matches a flag.
 * It preserves the original whitespace between phrases and the quotes around phrases.
 * - `content` matches the entire text as it was inputted, except for the command.
 * It preserves the original whitespace between phrases and the quotes around phrases.
 * - `restContent` matches the rest of the text as it was inputted.
 * It preserves the original whitespace between phrases and the quotes around phrases.
 * - `none` matches nothing at all and an empty string will be used for type operations.
 */
export declare type ArgumentMatch = 'phrase' | 'flag' | 'option' | 'rest' | 'separate' | 'text' | 'content' | 'restContent' | 'none';
/**
 * - `string` does not cast to any type.
 * - `lowercase` makes the input lowercase.
 * - `uppercase` makes the input uppercase.
 * - `charCodes` transforms the input to an array of char codes.
 * - `number` casts to a number.
 * - `integer` casts to an integer.
 * - `bigint` casts to a big integer.
 * - `url` casts to an `URL` object.
 * - `date` casts to a `Date` object.
 * - `color` casts a hex code to an integer.
 * - `commandAlias` tries to resolve to a command from an alias.
 * - `command` matches the ID of a command.
 * - `inhibitor` matches the ID of an inhibitor.
 * - `listener` matches the ID of a listener.
 * - `task` matches the ID of a task.
 * - `contextMenuCommand` matches the ID of a context menu command.
 *
 * Possible Discord-related types.
 * These types can be plural (add an 's' to the end) and a collection of matching objects will be used.
 * - `user` tries to resolve to a user.
 * - `member` tries to resolve to a member.
 * - `relevant` tries to resolve to a relevant user, works in both guilds and DMs.
 * - `channel` tries to resolve to a channel.
 * - `textChannel` tries to resolve to a text channel.
 * - `voiceChannel` tries to resolve to a voice channel.
 * - `categoryChannel` tries to resolve to a category channel.
 * - `newsChannel` tries to resolve to a news channel.
 * - `storeChannel` tries to resolve to a store channel.
 * - `stageChannel` tries to resolve to a stage channel.
 * - `threadChannel` tries to resolve a thread channel.
 * - `role` tries to resolve to a role.
 * - `emoji` tries to resolve to a custom emoji.
 * - `guild` tries to resolve to a guild.
 *
 * Other Discord-related types:
 * - `message` tries to fetch a message from an ID within the channel.
 * - `guildMessage` tries to fetch a message from an ID within the guild.
 * - `relevantMessage` is a combination of the above, works in both guilds and DMs.
 * - `invite` tries to fetch an invite object from a link.
 * - `userMention` matches a mention of a user.
 * - `memberMention` matches a mention of a guild member.
 * - `channelMention` matches a mention of a channel.
 * - `roleMention` matches a mention of a role.
 * - `emojiMention` matches a mention of an emoji.
 */
export interface BaseArgumentType {
    string: string | null;
    lowercase: string | null;
    uppercase: string | null;
    charCodes: number[] | null;
    number: number | null;
    integer: number | null;
    bigint: bigint | null;
    emojint: number | null;
    url: URL | null;
    date: Date | null;
    color: number | null;
    user: User | null;
    users: Collection<string, User> | null;
    member: GuildMember | null;
    members: Collection<string, GuildMember> | null;
    relevant: User | GuildMember | null;
    relevants: Collection<string, User> | Collection<string, GuildMember> | null;
    channel: GuildBasedChannel | BaseGuildVoiceChannel | null;
    channels: Collection<string, GuildBasedChannel | BaseGuildVoiceChannel> | null;
    textChannel: TextChannel | null;
    textChannels: Collection<string, TextChannel> | null;
    voiceChannel: VoiceChannel | null;
    voiceChannels: Collection<string, VoiceChannel> | null;
    categoryChannel: CategoryChannel | null;
    categoryChannels: Collection<string, CategoryChannel> | null;
    newsChannel: NewsChannel | null;
    newsChannels: Collection<string, NewsChannel> | null;
    stageChannel: StageChannel | null;
    stageChannels: Collection<string, StageChannel> | null;
    threadChannel: ThreadChannel | null;
    threadChannels: Collection<string, ThreadChannel> | null;
    role: Role | null;
    roles: Collection<string, Role> | null;
    emoji: Emoji | null;
    emojis: Collection<string, Emoji> | null;
    guild: Guild | null;
    guilds: Collection<string, Guild> | null;
    message: Message | null;
    guildMessage: Message | null;
    relevantMessage: Message | null;
    invite: Invite | null;
    userMention: User | null;
    memberMention: GuildMember | null;
    channelMention: ThreadChannel | GuildChannel | null;
    roleMention: Role | null;
    emojiMention: GuildEmoji | null;
    commandAlias: MessageCommand | null;
    command: MessageCommand | null;
    inhibitor: Inhibitor | null;
    listener: Listener | null;
    contextMenuCommand: ContextMenuCommand | null;
}
/**
 * The type that the argument should be cast to.
 *
 * An array of strings can be used to restrict input to only those strings, case insensitive.
 * The array can also contain an inner array of strings, for aliases.
 * If so, the first entry of the array will be used as the final argument.
 *
 * A regular expression can also be used.
 * The evaluated argument will be an object containing the `match` and `matches` if global.
 */
export declare type ArgumentType = keyof BaseArgumentType | (string | string[])[] | RegExp | string;
/**
 * A function for processing user input to use as an argument.
 * A void return value will use the default value for the argument or start a prompt.
 * Any other truthy return value will be used as the evaluated argument.
 * If returning a Promise, the resolved value will go through the above steps.
 * @param message - Message that triggered the command.
 * @param phrase - The user input.
 */
export declare type ArgumentTypeCaster<R = unknown> = (message: Message, phrase: string) => R;
/**
 * The return type of an argument.
 */
export declare type ArgumentTypeCasterReturn<R> = R extends ArgumentTypeCaster<infer S> ? S : R;
/**
 * Data passed to functions that run when things failed.
 */
export interface FailureData {
    /**
     * The input phrase that failed if there was one, otherwise an empty string.
     */
    phrase: string;
    /**
     * The value that failed if there was one, otherwise null.
     */
    failure: void | (Flag & {
        value: any;
    });
}
/**
 * Defaults for argument options.
 */
export interface DefaultArgumentOptions {
    /**
     * Default prompt options.
     */
    prompt?: ArgumentPromptOptions;
    /**
     * Default text sent if argument parsing fails.
     */
    otherwise?: string | MessagePayload | MessageOptions | OtherwiseContentSupplier;
    /**
     * Function to modify otherwise content.
     */
    modifyOtherwise?: OtherwiseContentModifier;
}
/**
 * Function get the default value of the argument.
 * @param message - Message that triggered the command.
 * @param data - Miscellaneous data.
 */
export declare type DefaultValueSupplier = (message: Message, data: FailureData) => any;
/**
 * A function for validating parsed arguments.
 * @param message - Message that triggered the command.
 * @param phrase - The user input.
 * @param value - The parsed value.
 */
export declare type ParsedValuePredicate = (message: Message, phrase: string, value: any) => boolean;
/**
 * A function modifying a prompt text.
 * @param message - Message that triggered the command.
 * @param text - Text to modify.
 * @param data - Miscellaneous data.
 */
export declare type OtherwiseContentModifier = (message: Message, text: string, data: FailureData) => string | MessagePayload | MessageOptions | Promise<string | MessagePayload | MessageOptions>;
/**
 * A function returning the content if argument parsing fails.
 * @param message - Message that triggered the command.
 * @param data - Miscellaneous data.
 */
export declare type OtherwiseContentSupplier = (message: Message, data: FailureData) => string | MessagePayload | MessageOptions | Promise<string | MessagePayload | MessageOptions>;
/**
 * A function modifying a prompt text.
 * @param message - Message that triggered the command.
 * @param text - Text from the prompt to modify.
 * @param data - Miscellaneous data.
 */
export declare type PromptContentModifier = (message: Message, text: string, data: ArgumentPromptData) => string | MessagePayload | MessageOptions | Promise<string | MessagePayload | MessageOptions>;
/**
 * A function returning text for the prompt.
 * @param message - Message that triggered the command.
 * @param data - Miscellaneous data.
 */
export declare type PromptContentSupplier = (message: Message, data: ArgumentPromptData) => string | MessagePayload | MessageOptions | Promise<string | MessagePayload | MessageOptions>;
export {};
//# sourceMappingURL=Argument.d.ts.map