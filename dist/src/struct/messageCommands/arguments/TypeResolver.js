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
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const url_1 = require("url");
const Constants_js_1 = require("../../../util/Constants.js");
/**
 * Type resolver for command arguments.
 * The types are documented under ArgumentType.
 */
class TypeResolver {
    /**
     * @param handler - The command handler.
     */
    constructor(handler) {
        this.client = handler.client;
        this.commandHandler = handler;
        this.inhibitorHandler = null;
        this.listenerHandler = null;
        this.contextMenuCommandHandler = null;
        this.types = new discord_js_1.Collection();
        this.addBuiltInTypes();
    }
    /**
     * Adds built-in types.
     */
    addBuiltInTypes() {
        const builtIns = {
            [Constants_js_1.ArgumentTypes.STRING]: (_message, phrase) => {
                return phrase || null;
            },
            [Constants_js_1.ArgumentTypes.LOWERCASE]: (_message, phrase) => {
                return phrase ? phrase.toLowerCase() : null;
            },
            [Constants_js_1.ArgumentTypes.UPPERCASE]: (_message, phrase) => {
                return phrase ? phrase.toUpperCase() : null;
            },
            [Constants_js_1.ArgumentTypes.CHAR_CODES]: (_message, phrase) => {
                if (!phrase)
                    return null;
                const codes = [];
                for (const char of phrase)
                    codes.push(char.charCodeAt(0));
                return codes;
            },
            [Constants_js_1.ArgumentTypes.NUMBER]: (_message, phrase) => {
                if (!phrase || isNaN(+phrase))
                    return null;
                return parseFloat(phrase);
            },
            [Constants_js_1.ArgumentTypes.INTEGER]: (_message, phrase) => {
                if (!phrase || isNaN(+phrase))
                    return null;
                return parseInt(phrase);
            },
            [Constants_js_1.ArgumentTypes.BIGINT]: (_message, phrase) => {
                if (!phrase || isNaN(+phrase))
                    return null;
                return BigInt(phrase);
            },
            // Just for fun.
            [Constants_js_1.ArgumentTypes.EMOJINT]: (_message, phrase) => {
                if (!phrase)
                    return null;
                const n = phrase.replace(/0⃣|1⃣|2⃣|3⃣|4⃣|5⃣|6⃣|7⃣|8⃣|9⃣|🔟/g, (m) => {
                    return [
                        '0⃣',
                        '1⃣',
                        '2⃣',
                        '3⃣',
                        '4⃣',
                        '5⃣',
                        '6⃣',
                        '7⃣',
                        '8⃣',
                        '9⃣',
                        '🔟',
                    ]
                        .indexOf(m)
                        .toString();
                });
                if (isNaN(n))
                    return null;
                return parseInt(n);
            },
            [Constants_js_1.ArgumentTypes.URL]: (_message, phrase) => {
                if (!phrase)
                    return null;
                if (/^<.+>$/.test(phrase))
                    phrase = phrase.slice(1, -1);
                try {
                    return new url_1.URL(phrase);
                }
                catch (err) {
                    return null;
                }
            },
            [Constants_js_1.ArgumentTypes.DATE]: (_message, phrase) => {
                if (!phrase)
                    return null;
                const timestamp = Date.parse(phrase);
                if (isNaN(timestamp))
                    return null;
                return new Date(timestamp);
            },
            [Constants_js_1.ArgumentTypes.COLOR]: (_message, phrase) => {
                if (!phrase)
                    return null;
                const color = parseInt(phrase.replace('#', ''), 16);
                if (color < 0 || color > 0xffffff || isNaN(color)) {
                    return null;
                }
                return color;
            },
            [Constants_js_1.ArgumentTypes.USER]: (_message, phrase) => {
                if (!phrase)
                    return null;
                return this.client.util.resolveUser(phrase, this.client.users.cache);
            },
            [Constants_js_1.ArgumentTypes.USERS]: (_message, phrase) => {
                if (!phrase)
                    return null;
                const users = this.client.util.resolveUsers(phrase, this.client.users.cache);
                return users.size ? users : null;
            },
            [Constants_js_1.ArgumentTypes.MEMBER]: (message, phrase) => {
                if (!phrase)
                    return null;
                if (!message.inGuild())
                    return null;
                return this.client.util.resolveMember(phrase, message.guild.members.cache);
            },
            [Constants_js_1.ArgumentTypes.MEMBERS]: (message, phrase) => {
                if (!phrase)
                    return null;
                if (!message.inGuild())
                    return null;
                const members = this.client.util.resolveMembers(phrase, message.guild.members.cache);
                return members.size ? members : null;
            },
            [Constants_js_1.ArgumentTypes.RELEVANT]: (message, phrase) => {
                if (!phrase)
                    return null;
                const person = message.inGuild()
                    ? this.client.util.resolveMember(phrase, message.guild.members.cache)
                    : this.client.util.resolveUser(phrase, new discord_js_1.Collection([
                        [
                            message.channel.recipient.id,
                            message.channel.recipient,
                        ],
                        [this.client.user.id, this.client.user],
                    ]));
                if (!person)
                    return null;
                return message.guild ? person.user : person;
            },
            [Constants_js_1.ArgumentTypes.RELEVANTS]: (message, phrase) => {
                if (!phrase)
                    return null;
                const persons = message.inGuild()
                    ? this.client.util.resolveMembers(phrase, message.guild.members.cache)
                    : this.client.util.resolveUsers(phrase, new discord_js_1.Collection([
                        [
                            message.channel.recipient.id,
                            message.channel.recipient,
                        ],
                        [this.client.user.id, this.client.user],
                    ]));
                if (!persons.size)
                    return null;
                return message.inGuild()
                    ? persons.mapValues((member) => member.user)
                    : persons;
            },
            [Constants_js_1.ArgumentTypes.CHANNEL]: (message, phrase) => {
                if (!phrase)
                    return null;
                if (!message.inGuild())
                    return null;
                return this.client.util.resolveChannel(phrase, message.guild.channels.cache);
            },
            [Constants_js_1.ArgumentTypes.CHANNELS]: (message, phrase) => {
                if (!phrase)
                    return null;
                if (!message.inGuild())
                    return null;
                const channels = this.client.util.resolveChannels(phrase, message.guild.channels.cache);
                return channels.size ? channels : null;
            },
            [Constants_js_1.ArgumentTypes.TEXT_CHANNEL]: (message, phrase) => {
                if (!phrase)
                    return null;
                if (!message.inGuild())
                    return null;
                const channel = this.client.util.resolveChannel(phrase, message.guild.channels.cache);
                if (!channel || channel.type !== discord_js_1.ChannelType.GuildText)
                    return null;
                return channel;
            },
            [Constants_js_1.ArgumentTypes.TEXT_CHANNELS]: (message, phrase) => {
                if (!phrase)
                    return null;
                if (!message.inGuild())
                    return null;
                const channels = this.client.util.resolveChannels(phrase, message.guild.channels.cache);
                if (!channels.size)
                    return null;
                const textChannels = channels.filter((c) => c.type === discord_js_1.ChannelType.GuildText);
                return textChannels.size
                    ? textChannels
                    : null;
            },
            [Constants_js_1.ArgumentTypes.VOICE_CHANNEL]: (message, phrase) => {
                if (!phrase)
                    return null;
                if (!message.inGuild())
                    return null;
                const channel = this.client.util.resolveChannel(phrase, message.guild.channels.cache);
                if (!channel || channel.type !== discord_js_1.ChannelType.GuildVoice)
                    return null;
                return channel;
            },
            [Constants_js_1.ArgumentTypes.VOICE_CHANNELS]: (message, phrase) => {
                if (!phrase)
                    return null;
                if (!message.inGuild())
                    return null;
                const channels = this.client.util.resolveChannels(phrase, message.guild.channels.cache);
                if (!channels.size)
                    return null;
                const voiceChannels = channels.filter((c) => c.type === discord_js_1.ChannelType.GuildVoice);
                return voiceChannels.size
                    ? voiceChannels
                    : null;
            },
            [Constants_js_1.ArgumentTypes.CATEGORY_CHANNEL]: (message, phrase) => {
                if (!phrase)
                    return null;
                if (!message.inGuild())
                    return null;
                const channel = this.client.util.resolveChannel(phrase, message.guild.channels.cache);
                if ((channel === null || channel === void 0 ? void 0 : channel.type) !== discord_js_1.ChannelType.GuildCategory)
                    return null;
                return channel;
            },
            [Constants_js_1.ArgumentTypes.CATEGORY_CHANNELS]: (message, phrase) => {
                if (!phrase)
                    return null;
                if (!message.inGuild())
                    return null;
                const channels = this.client.util.resolveChannels(phrase, message.guild.channels.cache);
                if (!channels.size)
                    return null;
                const categoryChannels = channels.filter((c) => c.type === discord_js_1.ChannelType.GuildCategory);
                return categoryChannels.size
                    ? categoryChannels
                    : null;
            },
            [Constants_js_1.ArgumentTypes.NEWS_CHANNEL]: (message, phrase) => {
                if (!phrase)
                    return null;
                if (!message.inGuild())
                    return null;
                const channel = this.client.util.resolveChannel(phrase, message.guild.channels.cache);
                if ((channel === null || channel === void 0 ? void 0 : channel.type) !== discord_js_1.ChannelType.GuildNews)
                    return null;
                return channel;
            },
            [Constants_js_1.ArgumentTypes.NEWS_CHANNELS]: (message, phrase) => {
                if (!phrase)
                    return null;
                if (!message.inGuild())
                    return null;
                const channels = this.client.util.resolveChannels(phrase, message.guild.channels.cache);
                if (!channels.size)
                    return null;
                const newsChannels = channels.filter((c) => c.type === discord_js_1.ChannelType.GuildNews);
                return newsChannels.size
                    ? newsChannels
                    : null;
            },
            [Constants_js_1.ArgumentTypes.STAGE_CHANNEL]: (message, phrase) => {
                if (!phrase)
                    return null;
                if (!message.inGuild())
                    return null;
                const channel = this.client.util.resolveChannel(phrase, message.guild.channels.cache);
                if ((channel === null || channel === void 0 ? void 0 : channel.type) !== discord_js_1.ChannelType.GuildStageVoice)
                    return null;
                return channel;
            },
            [Constants_js_1.ArgumentTypes.STAGE_CHANNELS]: (message, phrase) => {
                if (!phrase)
                    return null;
                if (!message.inGuild())
                    return null;
                const channels = this.client.util.resolveChannels(phrase, message.guild.channels.cache);
                if (!channels.size)
                    return null;
                const storeChannels = channels.filter((c) => c.type === discord_js_1.ChannelType.GuildStageVoice);
                return storeChannels.size
                    ? storeChannels
                    : null;
            },
            [Constants_js_1.ArgumentTypes.THREAD_CHANNEL]: (message, phrase) => {
                if (!phrase)
                    return null;
                if (!message.inGuild())
                    return null;
                const channel = this.client.util.resolveChannel(phrase, message.guild.channels.cache);
                if (!channel || !channel.isThread())
                    return null;
                return channel;
            },
            [Constants_js_1.ArgumentTypes.THREAD_CHANNELS]: (message, phrase) => {
                if (!phrase)
                    return null;
                if (!message.inGuild())
                    return null;
                const channels = this.client.util.resolveChannels(phrase, message.guild.channels.cache);
                if (!channels.size)
                    return null;
                const storeChannels = channels.filter((c) => c.isThread());
                return storeChannels.size
                    ? storeChannels
                    : null;
            },
            [Constants_js_1.ArgumentTypes.ROLE]: (message, phrase) => {
                if (!phrase)
                    return null;
                if (!message.inGuild())
                    return null;
                return this.client.util.resolveRole(phrase, message.guild.roles.cache);
            },
            [Constants_js_1.ArgumentTypes.ROLES]: (message, phrase) => {
                if (!phrase)
                    return null;
                if (!message.inGuild())
                    return null;
                const roles = this.client.util.resolveRoles(phrase, message.guild.roles.cache);
                return roles.size ? roles : null;
            },
            [Constants_js_1.ArgumentTypes.EMOJI]: (message, phrase) => {
                if (!phrase)
                    return null;
                if (!message.inGuild())
                    return null;
                return this.client.util.resolveEmoji(phrase, message.guild.emojis.cache);
            },
            [Constants_js_1.ArgumentTypes.EMOJIS]: (message, phrase) => {
                if (!phrase)
                    return null;
                if (!message.inGuild())
                    return null;
                const emojis = this.client.util.resolveEmojis(phrase, message.guild.emojis.cache);
                return emojis.size ? emojis : null;
            },
            [Constants_js_1.ArgumentTypes.GUILD]: (_message, phrase) => {
                if (!phrase)
                    return null;
                return this.client.util.resolveGuild(phrase, this.client.guilds.cache);
            },
            [Constants_js_1.ArgumentTypes.GUILDS]: (_message, phrase) => {
                if (!phrase)
                    return null;
                const guilds = this.client.util.resolveGuilds(phrase, this.client.guilds.cache);
                return guilds.size ? guilds : null;
            },
            [Constants_js_1.ArgumentTypes.MESSAGE]: (message, phrase) => {
                if (!phrase)
                    return null;
                try {
                    return message.channel.messages.fetch(phrase);
                }
                catch (e) {
                    return null;
                }
            },
            [Constants_js_1.ArgumentTypes.GUILD_MESSAGE]: (message, phrase) => __awaiter(this, void 0, void 0, function* () {
                if (!phrase)
                    return null;
                if (!message.inGuild())
                    return null;
                for (const channel of message.guild.channels.cache.values()) {
                    if (!channel.isTextBased())
                        continue;
                    try {
                        return yield channel.messages.fetch(phrase);
                    }
                    catch (err) {
                        if (/^Invalid Form Body/.test(err.message))
                            return null;
                    }
                }
                return null;
            }),
            [Constants_js_1.ArgumentTypes.RELEVANT_MESSAGE]: (message, phrase) => __awaiter(this, void 0, void 0, function* () {
                if (!phrase)
                    return null;
                const hereMsg = yield message.channel.messages
                    .fetch(phrase)
                    .catch(() => null);
                if (hereMsg) {
                    return hereMsg;
                }
                if (message.inGuild()) {
                    for (const channel of message.guild.channels.cache.values()) {
                        if (!channel.isTextBased())
                            continue;
                        try {
                            return yield channel.messages.fetch(phrase);
                        }
                        catch (err) {
                            if (/^Invalid Form Body/.test(err.message))
                                return null;
                        }
                    }
                }
                return null;
            }),
            [Constants_js_1.ArgumentTypes.INVITE]: (_message, phrase) => {
                if (!phrase)
                    return null;
                try {
                    return this.client.fetchInvite(phrase);
                }
                catch (e) {
                    return null;
                }
            },
            [Constants_js_1.ArgumentTypes.USER_MENTION]: (_message, phrase) => {
                var _a;
                if (!phrase)
                    return null;
                const id = phrase.match(/<@!?(\d{17,19})>/);
                if (!id)
                    return null;
                return (_a = this.client.users.cache.get(id[1])) !== null && _a !== void 0 ? _a : null;
            },
            [Constants_js_1.ArgumentTypes.MEMBER_MENTION]: (message, phrase) => {
                var _a;
                if (!phrase)
                    return null;
                if (!message.inGuild())
                    return null;
                const id = phrase.match(/<@!?(\d{17,19})>/);
                if (!id)
                    return null;
                return (_a = message.guild.members.cache.get(id[1])) !== null && _a !== void 0 ? _a : null;
            },
            [Constants_js_1.ArgumentTypes.CHANNEL_MENTION]: (message, phrase) => {
                var _a;
                if (!phrase)
                    return null;
                if (!message.inGuild())
                    return null;
                const id = phrase.match(/<#(\d{17,19})>/);
                if (!id)
                    return null;
                return (_a = message.guild.channels.cache.get(id[1])) !== null && _a !== void 0 ? _a : null;
            },
            [Constants_js_1.ArgumentTypes.ROLE_MENTION]: (message, phrase) => {
                var _a;
                if (!phrase)
                    return null;
                if (!message.guild)
                    return null;
                const id = phrase.match(/<@&(\d{17,19})>/);
                if (!id)
                    return null;
                return (_a = message.guild.roles.cache.get(id[1])) !== null && _a !== void 0 ? _a : null;
            },
            [Constants_js_1.ArgumentTypes.EMOJI_MENTION]: (message, phrase) => {
                var _a;
                if (!phrase)
                    return null;
                if (!message.inGuild())
                    return null;
                const id = phrase.match(/<a?:[a-zA-Z0-9_]+:(\d{17,19})>/);
                if (!id)
                    return null;
                return (_a = message.guild.emojis.cache.get(id[1])) !== null && _a !== void 0 ? _a : null;
            },
            [Constants_js_1.ArgumentTypes.COMMAND_ALIAS]: (_message, phrase) => {
                var _a;
                if (!phrase)
                    return null;
                return (_a = this.commandHandler.findCommand(phrase)) !== null && _a !== void 0 ? _a : null;
            },
            [Constants_js_1.ArgumentTypes.COMMAND]: (_message, phrase) => {
                var _a;
                if (!phrase)
                    return null;
                return (_a = this.commandHandler.modules.get(phrase)) !== null && _a !== void 0 ? _a : null;
            },
            [Constants_js_1.ArgumentTypes.INHIBITOR]: (_message, phrase) => {
                var _a, _b;
                if (!phrase)
                    return null;
                return (_b = (_a = this.inhibitorHandler) === null || _a === void 0 ? void 0 : _a.modules.get(phrase)) !== null && _b !== void 0 ? _b : null;
            },
            [Constants_js_1.ArgumentTypes.LISTENER]: (_message, phrase) => {
                var _a, _b;
                if (!phrase)
                    return null;
                return (_b = (_a = this.listenerHandler) === null || _a === void 0 ? void 0 : _a.modules.get(phrase)) !== null && _b !== void 0 ? _b : null;
            },
            [Constants_js_1.ArgumentTypes.CONTEXT_MENU_COMMAND]: (_message, phrase) => {
                var _a, _b;
                if (!phrase)
                    return null;
                return ((_b = (_a = this.contextMenuCommandHandler) === null || _a === void 0 ? void 0 : _a.modules.get(phrase)) !== null && _b !== void 0 ? _b : null);
            },
        };
        for (const [key, value] of Object.entries(builtIns)) {
            this.types.set(key, value);
        }
    }
    type(name) {
        return this.types.get(name);
    }
    /**
     * Adds a new type.
     * @param name - Name of the type.
     * @param fn - Function that casts the type.
     */
    addType(name, fn) {
        this.types.set(name, fn);
        return this;
    }
    /**
     * Adds multiple new types.
     * @param types  - Object with keys as the type name and values as the cast function.
     */
    addTypes(types) {
        for (const [key, value] of Object.entries(types)) {
            this.addType(key, value);
        }
        return this;
    }
}
exports.default = TypeResolver;
//# sourceMappingURL=TypeResolver.js.map