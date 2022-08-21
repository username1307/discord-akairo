import type { ClientEvents, ContextMenuCommandInteraction, Message } from 'discord.js';
import type AkairoModule from '../struct/AkairoModule.js';
import type MessageCommand from '../struct/messageCommands/MessageCommand';
import type ContextMenuCommand from '../struct/contextMenuCommands/ContextMenuCommand.js';
import type Inhibitor from '../struct/inhibitors/Inhibitor.js';
import type Listener from '../struct/listeners/Listener.js';
import type AkairoMessage from '../util/AkairoMessage.js';
import type { BuiltInReasons } from '../util/Constants.js';
import SlashCommand from '../struct/slashCommands/SlashCommand';
export interface AkairoHandlerEvents {
    /**
     * Emitted when a module is loaded.
     * @param mod - Module loaded.
     * @param isReload - Whether or not this was a reload.
     */
    load: [mod: AkairoModule, isReload: boolean];
    /**
     * Emitted when a module is removed.
     * @param mod - Module removed.
     */
    remove: [mod: AkairoModule];
}
export interface MessageCommandHandlerEvents extends AkairoHandlerEvents {
    /**
     * Emitted when a command is blocked by a post-message inhibitor. The built-in inhibitors are `owner`, `superUser`, `guild`, and `dm`.
     * @param message - Message sent.
     * @param command - MessageCommand blocked.
     * @param reason - Reason for the block.
     */
    commandBlocked: [
        message: Message,
        command: MessageCommand,
        reason: typeof BuiltInReasons | string
    ];
    /**
     * Emitted when a command breaks out with a retry prompt.
     * @param message - Message sent.
     * @param command - MessageCommand being broken out.
     * @param breakMessage - Breakout message.
     */
    commandBreakout: [
        message: Message,
        command: MessageCommand,
        breakMessage: Message
    ];
    /**
     * Emitted when a command is cancelled via prompt or argument cancel.
     * @param message - Message sent.
     * @param command - MessageCommand executed.
     * @param retryMessage - Message to retry with. This is passed when a prompt was broken out of with a message that looks like a command.
     */
    commandCancelled: [
        message: Message,
        command: MessageCommand,
        retryMessage?: Message
    ];
    /**
     * Emitted when a command finishes execution.
     * @param message - Message sent.
     * @param command - MessageCommand executed.
     * @param args - The args passed to the command.
     * @param returnValue - The command's return value.
     */
    commandFinished: [
        message: Message,
        command: MessageCommand,
        args: any,
        returnValue: any
    ];
    /**
     * Emitted when a command is invalid
     * @param message - Message sent.
     * @param command - MessageCommand executed.
     */
    commandInvalid: [message: Message, command: MessageCommand];
    /**
     * Emitted when a command is locked
     * @param message - Message sent.
     * @param command - MessageCommand executed.
     */
    commandLocked: [message: Message, command: MessageCommand];
    /**
     * Emitted when a command starts execution.
     * @param message - Message sent.
     * @param command - MessageCommand executed.
     * @param args - The args passed to the command.
     */
    commandStarted: [message: Message, command: MessageCommand, args: any];
    /**
     * Emitted when a command or slash command is found on cooldown.
     * @param message - Message sent.
     * @param command - MessageCommand blocked.
     * @param remaining - Remaining time in milliseconds for cooldown.
     */
    cooldown: [
        message: Message | AkairoMessage,
        command: MessageCommand,
        remaining: number
    ];
    /**
     * Emitted when a command or inhibitor errors.
     * @param error - The error.
     * @param message - Message sent.
     * @param command - MessageCommand executed.
     */
    error: [error: Error, message: Message, command?: MessageCommand];
    /**
     * Emitted when a user is in a command argument prompt.
     * Used to prevent usage of messageCommands during a prompt.
     * @param message - Message sent.
     */
    inPrompt: [message: Message];
    /**
     * Emitted when a command is loaded.
     * @param command - Module loaded.
     * @param isReload - Whether or not this was a reload.
     */
    load: [command: MessageCommand, isReload: boolean];
    /**
     * Emitted when a message is blocked by a pre-message inhibitor. The built-in inhibitors are 'client' and 'bot'.
     * @param message - Message sent.
     * @param reason - Reason for the block.
     */
    messageBlocked: [message: Message | AkairoMessage, reason: string];
    /**
     * Emitted when a message does not start with the prefix or match a command.
     * @param message - Message sent.
     */
    messageInvalid: [message: Message];
    /**
     * Emitted when a command permissions check is failed.
     * @param message - Message sent.
     * @param command - MessageCommand blocked.
     * @param type - Either 'client' or 'user'.
     * @param missing - The missing permissions.
     */
    missingPermissions: [
        message: Message,
        command: MessageCommand,
        type: 'client' | 'user',
        missing?: any
    ];
    /**
     * Emitted when a command is removed.
     * @param command - MessageCommand removed.
     */
    remove: [command: MessageCommand];
}
export interface SlashCommandHandlerEvents extends AkairoHandlerEvents {
    /**
     * Emitted when a command is blocked by a post-message inhibitor. The built-in inhibitors are `owner`, `superUser`, `guild`, and `dm`.
     * @param message - Message sent.
     * @param command - MessageCommand blocked.
     * @param reason - Reason for the block.
     */
    slashCommandBlocked: [
        message: AkairoMessage,
        command: SlashCommand,
        reason: typeof BuiltInReasons | string
    ];
    /**
     * Emitted when a command finishes execution.
     * @param message - Message sent.
     * @param command - MessageCommand executed.
     * @param args - The args passed to the command.
     * @param returnValue - The command's return value.
     */
    slashCommandFinished: [
        message: AkairoMessage,
        command: SlashCommand,
        args: any,
        returnValue: any
    ];
    /**
     * Emitted when a command is invalid
     * @param message - Message sent.
     * @param command - MessageCommand executed.
     */
    slashCommandInvalid: [message: AkairoMessage, command: SlashCommand];
    /**
     * Emitted when a command is locked
     * @param message - Message sent.
     * @param command - MessageCommand executed.
     */
    slashCommandLocked: [message: AkairoMessage, command: SlashCommand];
    /**
     * Emitted when a command starts execution.
     * @param message - Message sent.
     * @param command - MessageCommand executed.
     * @param args - The args passed to the command.
     */
    slashCommandStarted: [
        message: AkairoMessage,
        command: SlashCommand,
        args: any
    ];
    /**
     * Emitted when a command or inhibitor errors.
     * @param error - The error.
     * @param message - Message sent.
     * @param command - MessageCommand executed.
     */
    error: [error: Error, message: AkairoMessage, command?: SlashCommand];
    /**
     * Emitted when a command is loaded.
     * @param command - Module loaded.
     * @param isReload - Whether or not this was a reload.
     */
    load: [command: SlashCommand, isReload: boolean];
    /**
     * Emitted when a message is blocked by a pre-message inhibitor. The built-in inhibitors are 'client' and 'bot'.
     * @param message - Message sent.
     * @param reason - Reason for the block.
     */
    messageBlocked: [message: AkairoMessage, reason: string];
    /**
     * Emitted when a message does not start with the prefix or match a command.
     * @param message - Message sent.
     */
    messageInvalid: [message: AkairoMessage];
    /**
     * Emitted when a command permissions check is failed.
     * @param message - Message sent.
     * @param command - MessageCommand blocked.
     * @param type - Either 'client' or 'user'.
     * @param missing - The missing permissions.
     */
    missingPermissions: [
        message: AkairoMessage,
        command: SlashCommand,
        type: 'client' | 'user',
        missing?: any
    ];
    /**
     * Emitted when a command is removed.
     * @param command - MessageCommand removed.
     */
    remove: [command: SlashCommand];
}
export interface InhibitorHandlerEvents extends AkairoHandlerEvents {
    /**
     * Emitted when an inhibitor is removed.
     * @param inhibitor - Inhibitor removed.
     */
    remove: [inhibitor: Inhibitor];
    /**
     * Emitted when an inhibitor is loaded.
     * @param inhibitor - Inhibitor loaded.
     * @param isReload - Whether or not this was a reload.
     */
    load: [inhibitor: Inhibitor, isReload: boolean];
}
export interface ListenerHandlerEvents extends AkairoHandlerEvents {
    /**
     * Emitted when a listener is removed.
     * @param listener - Listener removed.
     */
    remove: [listener: Listener];
    /**
     * Emitted when a listener is loaded.
     * @param listener - Listener loaded.
     * @param isReload - Whether or not this was a reload.
     */
    load: [listener: Listener, isReload: boolean];
}
export interface ContextMenuCommandHandlerEvents extends AkairoHandlerEvents {
    /**
     * Emitted when a context menu command is removed.
     * @param contextMenu - Context menu command removed.
     */
    remove: [contextMenu: ContextMenuCommand];
    /**
     * Emitted when a context menu command is loaded.
     * @param contextMenu - Context menu command loaded.
     * @param isReload - Whether or not this was a reload.
     */
    load: [contextMenu: ContextMenuCommand, isReload: boolean];
    /**
     * Emitted when a context menu command errors.
     * @param error - The error.
     * @param interaction - The interaction.
     * @param command - MessageCommand executed.
     */
    error: [
        error: Error,
        interaction: ContextMenuCommandInteraction,
        command: ContextMenuCommand
    ];
    /**
     * Emitted when a context menu command finishes execution.
     * @param interaction - The interaction.
     * @param command - MessageCommand executed.
     * @param returnValue - The command's return value.
     */
    finished: [
        interaction: ContextMenuCommandInteraction,
        command: ContextMenuCommand,
        returnValue: any
    ];
    /**
     * Emitted when a an incoming interaction command cannot be matched with a command.
     * @param interaction - The incoming interaction.
     */
    notFound: [interaction: ContextMenuCommandInteraction];
    /**
     * Emitted when a command starts execution.
     * @param interaction - The interaction.
     * @param command - MessageCommand executed.
     * @param args - The args passed to the command.
     */
    started: [
        interaction: ContextMenuCommandInteraction,
        command: ContextMenuCommand
    ];
    /**
     * Emitted when a command is blocked.
     * @param interaction - The interaction.
     * @param command - MessageCommand blocked.
     * @param reason - Reason for the block.
     */
    blocked: [
        interaction: ContextMenuCommandInteraction,
        command: MessageCommand,
        reason: typeof BuiltInReasons.OWNER | typeof BuiltInReasons.SUPER_USER
    ];
}
export interface AkairoClientEvents extends ClientEvents {
    /**
     * Emitted for akairo debugging information.
     */
    akairoDebug: [message: string, ...other: any[]];
}
//# sourceMappingURL=events.d.ts.map