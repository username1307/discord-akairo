const { Base } = require('discord.js');

class AkairoMessage extends Base {
    constructor(client, interaction) {
        super(client);

        this.author = interaction.user;
        this.applicationId = interaction.applicationId;
        this.channelId = interaction.channelId;
        this.content = interaction.toString();
        this.createdTimestamp = interaction.createdTimestamp;
        this.guildId = interaction.guildId;
        this.id = interaction.id;
        this.interaction = interaction;
        this.member = interaction.member;
        this.partial = false;
    }

    /**
     * The channel that the interaction was sent in.
     */
    get channel() {
        return this.interaction.channel;
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
     * Indicates whether this interaction is received from a guild.
     * @returns {boolean}
     */
    inGuild() {
        return Boolean(this.guildId && this.member);
    }

    /**
     * Deletes the reply to the command.
     * @returns {Promise<void>}
     */
    delete() {
        return this.interaction.deleteReply();
    }
}

module.exports = AkairoMessage;
