"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/* eslint-disable require-await */
const discord_js_1 = require("discord.js");
const AkairoMessage_js_1 = require("../../util/AkairoMessage.js");
const MessageCommandHandler_1 = require("./MessageCommandHandler");
/**
 * MessageCommand utilities.
 */
class MessageCommandUtil {
    /**
     * @param handler - The command handler.
     * @param message - Message that triggered the command.
     */
    constructor(handler, message) {
        this.handler = handler;
        this.message = message;
        this.parsed = null;
        this.shouldEdit = false;
        this.lastResponse = null;
        this.messages =
            this.handler instanceof MessageCommandHandler_1.default &&
                this.handler.storeMessages
                ? new discord_js_1.Collection()
                : null;
        this.isSlash = this.message instanceof AkairoMessage_js_1.default;
    }
    /**
     * Whether or not `this.message` has been deleted.
     */
    get deleted() {
        return this.isSlash
            ? false
            : MessageCommandUtil.deletedMessages.has(this.message.id);
    }
    /**
     * Whether or not the provided message is a slash message
     * @param message - The message to test
     */
    isSlashMessage(message) {
        return message instanceof AkairoMessage_js_1.default;
    }
    addMessage(message) {
        if (this.handler instanceof MessageCommandHandler_1.default &&
            this.handler.storeMessages) {
            if (Array.isArray(message)) {
                for (const msg of message) {
                    this.messages?.set(msg.id, msg);
                }
            }
            else {
                this.messages?.set(message.id, message);
            }
        }
        return message;
    }
    async edit(options) {
        if (!this.isSlashMessage(this.message)) {
            return this.lastResponse.edit(options);
        }
        else {
            return this.message.interaction.editReply(options);
        }
    }
    async reply(options) {
        const newOptions = (typeof options === 'string' ? { content: options } : options);
        if (!this.isSlashMessage(this.message) &&
            !this.shouldEdit &&
            !(newOptions instanceof discord_js_1.MessagePayload) &&
            !this.deleted) {
            newOptions.reply = {
                messageReference: this.message,
                failIfNotExists: newOptions.failIfNotExists ??
                    this.handler.client.options.failIfNotExists,
            };
        }
        return this.send(newOptions);
    }
    async send(options) {
        const hasFiles = typeof options === 'string' || !options.files?.length
            ? false
            : options.files?.length > 0;
        const newOptions = typeof options === 'string' ? { content: options } : options;
        if (!this.isSlashMessage(this.message)) {
            newOptions.ephemeral = undefined;
            if (this.shouldEdit &&
                !hasFiles &&
                !MessageCommandUtil.deletedMessages.has(this.lastResponse.id) &&
                !this.lastResponse.attachments.size) {
                return this.lastResponse.edit(newOptions);
            }
            const sent = await this.message.channel?.send(newOptions);
            const lastSent = this.setLastResponse(sent);
            this.setEditable(!lastSent.attachments.size);
            return sent;
        }
        else {
            newOptions.reply = undefined;
            if (this.lastResponse ||
                this.message.interaction.deferred ||
                this.message.interaction.replied) {
                this.lastResponse = (await this.message.interaction.editReply(newOptions));
                return this.lastResponse;
            }
            else {
                Object.assign(newOptions, { fetchReply: true });
                this.lastResponse = (await this.message.interaction.reply(newOptions));
                return this.lastResponse;
            }
        }
    }
    async sendNew(options) {
        if (!this.isSlashMessage(this.message)) {
            const sent = await this.message.channel?.send(options);
            const lastSent = this.setLastResponse(sent);
            this.setEditable(!lastSent.attachments.size);
            return sent;
        }
        else {
            const sent = (await this.message.interaction.followUp(options));
            this.setLastResponse(sent);
            return sent;
        }
    }
    /**
     * Changes if the message should be edited.
     * @param state - Change to editable or not.
     */
    setEditable(state) {
        this.shouldEdit = Boolean(state);
        return this;
    }
    /**
     * Sets the last response.
     * @param message - The last response.
     */
    setLastResponse(message) {
        if (Array.isArray(message)) {
            this.lastResponse = message.slice(-1)[0];
        }
        else {
            this.lastResponse = message;
        }
        return this.lastResponse;
    }
    /**
     * Deletes the last response.
     */
    async delete() {
        if (this.isSlashMessage(this.message)) {
            return this.message.interaction.deleteReply();
        }
        else {
            return this.lastResponse?.delete();
        }
    }
}
exports.default = MessageCommandUtil;
/**
 * Saved deleted message ids.
 */
MessageCommandUtil.deletedMessages = new Set();
//# sourceMappingURL=MessageCommandUtil.js.map