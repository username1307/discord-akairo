"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
/**
 * A command interaction represented as a message.
 */
class AkairoMessage extends discord_js_1.Base {
    /**
     * @param client - AkairoClient
     * @param interaction - CommandInteraction
     */
    constructor(client, interaction) {
        var _a;
        super(client);
        this.author = interaction.user;
        this.applicationId = interaction.applicationId;
        this.channelId = interaction.channelId;
        this.content = `${!interaction.command || interaction.isChatInputCommand() ? '/' : ''}${interaction.commandName}`;
        this.createdTimestamp = interaction.createdTimestamp;
        this.guildId = interaction.guildId;
        this.id = interaction.id;
        this.interaction = interaction;
        this.member = interaction.member;
        this.partial = false;
        const options = interaction.options;
        if (interaction.isChatInputCommand()) {
            if (options['_group'])
                this.content += `group: ${options['_group']}`;
            if (options['_subcommand'])
                this.content += `subcommand: ${options['_subcommand']}`;
            for (const option of options['_hoistedOptions']) {
                if ([
                    discord_js_1.ApplicationCommandOptionType.Subcommand,
                    discord_js_1.ApplicationCommandOptionType.SubcommandGroup,
                ].includes(option.type))
                    continue;
                this.content += ` ${option.name}: ${(_a = options.get(option.name, false)) === null || _a === void 0 ? void 0 : _a.value}`;
            }
        }
        else if (interaction.isMessageContextMenuCommand()) {
            this.content += ` message: ${options.getMessage('message').id}`;
        }
        else if (interaction.isUserContextMenuCommand()) {
            this.content += ` message: ${options.getUser('user').id}`;
        }
    }
    /**
     * The channel that the interaction was sent in.
     */
    get channel() {
        return this.interaction.channel;
    }
    /**
     * The message contents with all mentions replaced by the equivalent text.
     * If mentions cannot be resolved to a name, the relevant mention in the message content will not be converted.
     */
    get cleanContent() {
        return this.content != null
            ? (0, discord_js_1.cleanContent)(this.content, this.channel)
            : null;
    }
    /**
     * The guild the interaction was sent in (if in a guild channel).
     */
    get guild() {
        return this.interaction.guild;
    }
    /**
     * The time the message was sent at
     */
    get createdAt() {
        return this.interaction.createdAt;
    }
    /**
     * The url to jump to this message
     */
    get url() {
        var _a;
        return this.interaction.ephemeral
            ? null
            : `https://discord.com/channels/${this.guild ? this.guild.id : '@me'}/${(_a = this.channel) === null || _a === void 0 ? void 0 : _a.id}/${this.id}`;
    }
    /**
     * Indicates whether this interaction is received from a guild.
     */
    inGuild() {
        return Boolean(this.guildId && this.member);
    }
    /**
     * Deletes the reply to the command.
     */
    delete() {
        return this.interaction.deleteReply();
    }
    /**
     * Replies or edits the reply of the slash command.
     * @param options The options to edit the reply.
     */
    reply(options) {
        return this.util.reply(options);
    }
}
exports.default = AkairoMessage;
//# sourceMappingURL=AkairoMessage.js.map