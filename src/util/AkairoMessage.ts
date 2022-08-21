import {
    APIInteractionGuildMember,
    APIMessage,
    Base,
    ApplicationCommandOptionType,
    ChatInputCommandInteraction,
    ContextMenuCommandInteraction,
    CommandInteractionOptionResolver,
    Guild,
    GuildMember,
    InteractionReplyOptions,
    Message,
    MessagePayload,
    Snowflake,
    TextBasedChannel,
    User,
    cleanContent,
} from 'discord.js';
import type AkairoClient from '../struct/AkairoClient.js';
import type MessageCommandUtil from '../struct/messageCommands/MessageCommandUtil';

/**
 * A command interaction represented as a message.
 */
export default class AkairoMessage extends Base {
    /**
     * The author of the interaction.
     */
    public declare author: User;

    /**
     * The application's id
     */
    public declare applicationId: Snowflake;

    /**
     * The id of the channel this interaction was sent in
     */
    public declare channelId: Snowflake | null;

    /**
     * The command name and arguments represented as a string.
     */
    public declare content: string;

    /**
     * The timestamp the interaction was sent at.
     */
    public declare createdTimestamp: number;

    /**
     * The id of the guild this interaction was sent in
     */
    public declare guildId: Snowflake | null;

    /**
     * The ID of the interaction.
     */
    public declare id: Snowflake;

    /**
     * The command interaction.
     */
    public declare interaction:
        | ChatInputCommandInteraction
        | ContextMenuCommandInteraction;

    /**
     * Represents the author of the interaction as a guild member.
     * Only available if the interaction comes from a guild where the author is still a member.
     */
    public declare member: GuildMember | APIInteractionGuildMember | null;

    /**
     * Whether or not this message is a partial
     */
    public declare readonly partial: false;

    /**
     * Utilities for command responding.
     */
    public declare util: MessageCommandUtil<AkairoMessage>;

    /**
     * @param client - AkairoClient
     * @param interaction - CommandInteraction
     */
    public constructor(
        client: AkairoClient,
        interaction: ChatInputCommandInteraction | ContextMenuCommandInteraction
    ) {
        super(client);

        this.author = interaction.user;
        this.applicationId = interaction.applicationId;
        this.channelId = interaction.channelId;
        this.content = `${
            !interaction.command || interaction.isChatInputCommand() ? '/' : ''
        }${interaction.commandName}`;
        this.createdTimestamp = interaction.createdTimestamp;
        this.guildId = interaction.guildId;
        this.id = interaction.id;
        this.interaction = interaction;
        this.member = interaction.member;
        this.partial = false;

        const options = interaction.options as CommandInteractionOptionResolver;
        if (interaction.isChatInputCommand()) {
            if (options['_group'])
                this.content += `group: ${options['_group']}`;
            if (options['_subcommand'])
                this.content += `subcommand: ${options['_subcommand']}`;
            for (const option of options['_hoistedOptions']) {
                if (
                    [
                        ApplicationCommandOptionType.Subcommand,
                        ApplicationCommandOptionType.SubcommandGroup,
                    ].includes(option.type)
                )
                    continue;
                this.content += ` ${option.name}: ${
                    options.get(option.name, false)?.value
                }`;
            }
        } else if (interaction.isMessageContextMenuCommand()) {
            this.content += ` message: ${options.getMessage('message')!.id}`;
        } else if (interaction.isUserContextMenuCommand()) {
            this.content += ` message: ${options.getUser('user')!.id}`;
        }
    }

    /**
     * The channel that the interaction was sent in.
     */
    public get channel(): TextBasedChannel | null {
        return this.interaction.channel;
    }

    /**
     * The message contents with all mentions replaced by the equivalent text.
     * If mentions cannot be resolved to a name, the relevant mention in the message content will not be converted.
     */
    public get cleanContent(): string | null {
        return this.content != null
            ? cleanContent(this.content, this.channel!)
            : null;
    }

    /**
     * The guild the interaction was sent in (if in a guild channel).
     */
    public get guild(): Guild | null {
        return this.interaction.guild;
    }

    /**
     * The time the message was sent at
     */
    public get createdAt(): Date {
        return this.interaction.createdAt;
    }

    /**
     * The url to jump to this message
     */
    public get url(): string | null {
        return this.interaction.ephemeral
            ? null
            : `https://discord.com/channels/${
                  this.guild ? this.guild.id : '@me'
              }/${this.channel?.id}/${this.id}`;
    }

    /**
     * Indicates whether this interaction is received from a guild.
     */
    public inGuild(): this is this & { guild: Guild; member: GuildMember } {
        return Boolean(this.guildId && this.member);
    }

    /**
     * Deletes the reply to the command.
     */
    public delete(): Promise<void> {
        return this.interaction.deleteReply();
    }

    /**
     * Replies or edits the reply of the slash command.
     * @param options The options to edit the reply.
     */
    public reply(
        options: string | MessagePayload | InteractionReplyOptions
    ): Promise<Message | APIMessage> {
        return this.util.reply(options);
    }
}
