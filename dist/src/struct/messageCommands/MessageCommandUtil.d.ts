import { APIMessage, Collection, InteractionReplyOptions, Message, MessageEditOptions, MessageOptions, MessagePayload, ReplyMessageOptions, Snowflake, WebhookEditMessageOptions } from 'discord.js';
import AkairoMessage from '../../util/AkairoMessage.js';
import type ContextMenuCommandHandler from '../contextMenuCommands/ContextMenuCommandHandler.js';
import MessageCommandHandler, { ParsedComponentData } from './MessageCommandHandler';
/**
 * MessageCommand utilities.
 */
export default class MessageCommandUtil<MessageType extends AkairoMessage | Message> {
    /**
     * Saved deleted message ids.
     */
    static deletedMessages: Set<string>;
    /**
     * The command handler.
     */
    handler: MessageCommandHandler | ContextMenuCommandHandler;
    /**
     * Whether or not the command is a slash command.
     */
    isSlash: boolean;
    /**
     * The last response sent.
     */
    lastResponse: Message | null;
    /**
     * Message that triggered the command.
     */
    message: MessageType;
    /**
     * Messages stored from prompts and prompt replies.
     */
    messages: Collection<Snowflake, Message> | null;
    /**
     * The parsed components.
     */
    parsed: ParsedComponentData | null;
    /**
     * Whether or not the last response should be edited.
     */
    shouldEdit: boolean;
    /**
     * Whether or not `this.message` has been deleted.
     */
    get deleted(): boolean;
    /**
     * @param handler - The command handler.
     * @param message - Message that triggered the command.
     */
    constructor(handler: MessageCommandHandler | ContextMenuCommandHandler, message: MessageType);
    /**
     * Whether or not the provided message is a slash message
     * @param message - The message to test
     */
    isSlashMessage(message: Message | AkairoMessage): message is AkairoMessage;
    /**
     * Adds client prompt or user reply to messages.
     * @param message - Message to add.
     */
    addMessage(message: Message): Message;
    addMessage(message: Message[]): Message[];
    /**
     * Edits the last response.
     * If the message is a slash command, edits the slash response.
     * @param options - Options to use.
     */
    edit(options: string | MessageEditOptions | MessagePayload): Promise<Message>;
    edit(options: string | WebhookEditMessageOptions | MessagePayload): Promise<Message | APIMessage>;
    /**
     * Send an inline reply or respond to a slash command.
     * If the message is a slash command, it replies or edits the last reply.
     * @param options - Options to use.
     */
    reply(options: string | MessagePayload | ReplyMessageOptions): Promise<Message>;
    reply(options: string | MessagePayload | InteractionReplyOptions): Promise<Message | APIMessage>;
    /**
     * Sends a response or edits an old response if available.
     * @param options - Options to use.
     */
    send(options: string | MessagePayload | MessageOptions): Promise<Message>;
    send(options: string | MessagePayload | InteractionReplyOptions): Promise<Message | APIMessage>;
    /**
     * Sends a response, overwriting the last response.
     * @param options - Options to use.
     */
    sendNew(options: string | MessagePayload | MessageOptions): Promise<Message>;
    sendNew(options: string | MessagePayload | InteractionReplyOptions): Promise<Message | APIMessage>;
    /**
     * Changes if the message should be edited.
     * @param state - Change to editable or not.
     */
    setEditable(state: boolean): MessageCommandUtil<MessageType>;
    /**
     * Sets the last response.
     * @param message - The last response.
     */
    setLastResponse(message: Message): Message;
    /**
     * Deletes the last response.
     */
    delete(): Promise<Message | void>;
}
//# sourceMappingURL=MessageCommandUtil.d.ts.map