"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
/* eslint-disable require-await */
const discord_js_1 = require("discord.js");
const AkairoMessage_js_1 = __importDefault(require("../../util/AkairoMessage.js"));
const MessageCommandHandler_1 = __importDefault(require("./MessageCommandHandler"));
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
        var _a, _b;
        if (this.handler instanceof MessageCommandHandler_1.default &&
            this.handler.storeMessages) {
            if (Array.isArray(message)) {
                for (const msg of message) {
                    (_a = this.messages) === null || _a === void 0 ? void 0 : _a.set(msg.id, msg);
                }
            }
            else {
                (_b = this.messages) === null || _b === void 0 ? void 0 : _b.set(message.id, message);
            }
        }
        return message;
    }
    edit(options) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.isSlashMessage(this.message)) {
                return this.lastResponse.edit(options);
            }
            else {
                return this.message.interaction.editReply(options);
            }
        });
    }
    reply(options) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            const newOptions = (typeof options === 'string' ? { content: options } : options);
            if (!this.isSlashMessage(this.message) &&
                !this.shouldEdit &&
                !(newOptions instanceof discord_js_1.MessagePayload) &&
                !this.deleted) {
                newOptions.reply = {
                    messageReference: this.message,
                    failIfNotExists: (_a = newOptions.failIfNotExists) !== null && _a !== void 0 ? _a : this.handler.client.options.failIfNotExists,
                };
            }
            return this.send(newOptions);
        });
    }
    send(options) {
        var _a, _b, _c;
        return __awaiter(this, void 0, void 0, function* () {
            const hasFiles = typeof options === 'string' || !((_a = options.files) === null || _a === void 0 ? void 0 : _a.length)
                ? false
                : ((_b = options.files) === null || _b === void 0 ? void 0 : _b.length) > 0;
            const newOptions = typeof options === 'string' ? { content: options } : options;
            if (!this.isSlashMessage(this.message)) {
                newOptions.ephemeral = undefined;
                if (this.shouldEdit &&
                    !hasFiles &&
                    !MessageCommandUtil.deletedMessages.has(this.lastResponse.id) &&
                    !this.lastResponse.attachments.size) {
                    return this.lastResponse.edit(newOptions);
                }
                const sent = yield ((_c = this.message.channel) === null || _c === void 0 ? void 0 : _c.send(newOptions));
                const lastSent = this.setLastResponse(sent);
                this.setEditable(!lastSent.attachments.size);
                return sent;
            }
            else {
                newOptions.reply = undefined;
                if (this.lastResponse ||
                    this.message.interaction.deferred ||
                    this.message.interaction.replied) {
                    this.lastResponse = (yield this.message.interaction.editReply(newOptions));
                    return this.lastResponse;
                }
                else {
                    Object.assign(newOptions, { fetchReply: true });
                    this.lastResponse = (yield this.message.interaction.reply(newOptions));
                    return this.lastResponse;
                }
            }
        });
    }
    sendNew(options) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.isSlashMessage(this.message)) {
                const sent = yield ((_a = this.message.channel) === null || _a === void 0 ? void 0 : _a.send(options));
                const lastSent = this.setLastResponse(sent);
                this.setEditable(!lastSent.attachments.size);
                return sent;
            }
            else {
                const sent = (yield this.message.interaction.followUp(options));
                this.setLastResponse(sent);
                return sent;
            }
        });
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
    delete() {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            if (this.isSlashMessage(this.message)) {
                return this.message.interaction.deleteReply();
            }
            else {
                return (_a = this.lastResponse) === null || _a === void 0 ? void 0 : _a.delete();
            }
        });
    }
}
exports.default = MessageCommandUtil;
/**
 * Saved deleted message ids.
 */
MessageCommandUtil.deletedMessages = new Set();
//# sourceMappingURL=MessageCommandUtil.js.map