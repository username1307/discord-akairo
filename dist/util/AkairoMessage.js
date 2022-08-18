import { Base, ApplicationCommandOptionType, cleanContent, } from 'discord.js';
/**
 * A command interaction represented as a message.
 */
export default class AkairoMessage extends Base {
    /**
     * @param client - AkairoClient
     * @param interaction - CommandInteraction
     */
    constructor(client, interaction) {
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
                    ApplicationCommandOptionType.Subcommand,
                    ApplicationCommandOptionType.SubcommandGroup,
                ].includes(option.type))
                    continue;
                this.content += ` ${option.name}: ${options.get(option.name, false)?.value}`;
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
            ? cleanContent(this.content, this.channel)
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
        return this.interaction.ephemeral
            ? null
            : `https://discord.com/channels/${this.guild ? this.guild.id : '@me'}/${this.channel?.id}/${this.id}`;
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
//# sourceMappingURL=AkairoMessage.js.map