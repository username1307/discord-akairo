import 'source-map-support/register';
import AkairoClient, { AkairoOptions } from './struct/AkairoClient';
import AkairoHandler, {
    AkairoHandlerOptions,
    LoadPredicate,
} from './struct/AkairoHandler';
import AkairoModule, { AkairoModuleOptions } from './struct/AkairoModule';
import ClientUtil from './struct/ClientUtil';
import Argument, {
    ArgumentMatch,
    ArgumentOptions,
    ArgumentPromptData,
    ArgumentPromptOptions,
    ArgumentType,
    ArgumentTypeCaster,
    BaseArgumentType,
    DefaultArgumentOptions,
    DefaultValueSupplier,
    FailureData,
    OtherwiseContentModifier,
    OtherwiseContentSupplier,
    ParsedValuePredicate,
    PromptContentModifier,
    PromptContentSupplier,
} from './struct/messageCommands/arguments/Argument';
import ArgumentRunner, {
    ArgumentRunnerState,
} from './struct/messageCommands/arguments/ArgumentRunner';
import TypeResolver from './struct/messageCommands/arguments/TypeResolver';
import SlashCommand, {
    AkairoApplicationCommandAutocompleteOption,
    AkairoApplicationCommandChannelOptionData,
    AkairoApplicationCommandChoicesData,
    AkairoApplicationCommandNonOptionsData,
    AkairoApplicationCommandNumericOptionData,
    AkairoApplicationCommandStringOptionData,
    AkairoApplicationCommandOptionData,
    AkairoApplicationCommandSubCommandData,
    AkairoApplicationCommandSubGroupData,
    SlashCommandOptions,
    SlashOption,
} from './struct/slashCommands/SlashCommand';
import SlashCommandHandler, {
    SlashCommandHandlerOptions,
    SlashResolveTypes,
} from './struct/slashCommands/SlashCommandHandler.js';
import MessageCommand, {
    ArgumentGenerator,
    BeforeAction,
    MessageCommandOptions,
    ExecutionPredicate,
    KeySupplier,
    MissingPermissionSupplier,
    RegexSupplier,
} from './struct/messageCommands/MessageCommand';
import MessageCommandHandler, {
    MessageCommandHandlerOptions,
    CooldownData,
    IgnoreCheckPredicate,
    MentionPrefixPredicate,
    ParsedComponentData,
    PrefixSupplier,
} from './struct/messageCommands/MessageCommandHandler';
import MessageCommandUtil from './struct/messageCommands/MessageCommandUtil';
import ContentParser, {
    ContentParserOptions,
    ContentParserResult,
    ExtractedFlags,
    StringData,
} from './struct/messageCommands/ContentParser';
import Flag from './struct/messageCommands/Flag';
import ContextMenuCommand, {
    ContextMenuCommandOptions,
} from './struct/contextMenuCommands/ContextMenuCommand';
import ContextMenuCommandHandler from './struct/contextMenuCommands/ContextMenuCommandHandler';
import Inhibitor, { InhibitorOptions } from './struct/inhibitors/Inhibitor';
import InhibitorHandler from './struct/inhibitors/InhibitorHandler';
import Listener, {
    ListenerOptions,
    ListenerType,
} from './struct/listeners/Listener';
import ListenerHandler from './struct/listeners/ListenerHandler';
import type {
    AkairoClientEvents,
    AkairoHandlerEvents,
    SlashCommandHandlerEvents,
    MessageCommandHandlerEvents,
    ContextMenuCommandHandlerEvents,
    InhibitorHandlerEvents,
    ListenerHandlerEvents,
} from './typings/events';
import AkairoError from './util/AkairoError';
import AkairoMessage from './util/AkairoMessage';
import Category from './util/Category';
import * as Constants from './util/Constants';
import Util from './util/Util';

declare module 'discord.js' {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    export interface Message<Cached extends boolean = boolean> extends Base {
        /**
         * Extra properties applied to the Discord.js message object.
         * Utilities for command responding.
         * Available on all messages after 'all' inhibitors and built-in inhibitors (bot, client).
         * Not all properties of the util are available, depending on the input.
         * */
        util?: MessageCommandUtil<Message>;
    }
}

export {
    AkairoClient,
    AkairoError,
    AkairoHandler,
    AkairoMessage,
    AkairoModule,
    Argument,
    ArgumentRunner,
    ArgumentRunnerState,
    Category,
    ClientUtil,
    SlashCommand,
    SlashCommandHandler,
    MessageCommand,
    MessageCommandHandler,
    MessageCommandUtil,
    Constants,
    ContentParser,
    ContentParserResult,
    ContextMenuCommand,
    ContextMenuCommandHandler,
    Flag,
    Inhibitor,
    InhibitorHandler,
    Listener,
    ListenerHandler,
    PromptContentModifier,
    TypeResolver,
    Util,
};
export type {
    AkairoApplicationCommandAutocompleteOption,
    AkairoApplicationCommandChannelOptionData,
    AkairoApplicationCommandChoicesData,
    AkairoApplicationCommandNonOptionsData,
    AkairoApplicationCommandNumericOptionData,
    AkairoApplicationCommandOptionData,
    AkairoApplicationCommandSubCommandData,
    AkairoApplicationCommandSubGroupData,
    AkairoApplicationCommandStringOptionData,
    AkairoClientEvents,
    AkairoHandlerEvents,
    AkairoHandlerOptions,
    AkairoModuleOptions,
    AkairoOptions,
    ArgumentGenerator,
    ArgumentMatch,
    ArgumentOptions,
    ArgumentPromptData,
    ArgumentPromptOptions,
    ArgumentType,
    ArgumentTypeCaster,
    BaseArgumentType,
    BeforeAction,
    MessageCommandHandlerEvents,
    SlashCommandHandlerOptions,
    SlashCommandOptions,
    MessageCommandHandlerOptions,
    MessageCommandOptions,
    ContentParserOptions,
    ContextMenuCommandHandlerEvents,
    ContextMenuCommandOptions,
    CooldownData,
    DefaultArgumentOptions,
    DefaultValueSupplier,
    ExecutionPredicate,
    ExtractedFlags,
    FailureData,
    IgnoreCheckPredicate,
    InhibitorHandlerEvents,
    InhibitorOptions,
    KeySupplier,
    ListenerHandlerEvents,
    ListenerOptions,
    ListenerType,
    LoadPredicate,
    MentionPrefixPredicate,
    MissingPermissionSupplier,
    OtherwiseContentModifier,
    OtherwiseContentSupplier,
    ParsedComponentData,
    ParsedValuePredicate,
    PrefixSupplier,
    PromptContentSupplier,
    RegexSupplier,
    SlashOption,
    SlashResolveTypes,
    StringData,
    SlashCommandHandlerEvents,
};
