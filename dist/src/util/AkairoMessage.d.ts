import { APIInteractionGuildMember, APIMessage, Base, ChatInputCommandInteraction, ContextMenuCommandInteraction, Guild, GuildMember, InteractionReplyOptions, Message, MessagePayload, Snowflake, TextBasedChannel, User } from 'discord.js';
import type AkairoClient from '../struct/AkairoClient.js';
import type MessageCommandUtil from '../struct/messageCommands/MessageCommandUtil';
/**
 * A command interaction represented as a message.
 */
export default class AkairoMessage extends Base {
    /**
     * The author of the interaction.
     */
    author: User;
    /**
     * The application's id
     */
    applicationId: Snowflake;
    /**
     * The id of the channel this interaction was sent in
     */
    channelId: Snowflake | null;
    /**
     * The command name and arguments represented as a string.
     */
    content: string;
    /**
     * The timestamp the interaction was sent at.
     */
    createdTimestamp: number;
    /**
     * The id of the guild this interaction was sent in
     */
    guildId: Snowflake | null;
    /**
     * The ID of the interaction.
     */
    id: Snowflake;
    /**
     * The command interaction.
     */
    interaction: ChatInputCommandInteraction | ContextMenuCommandInteraction;
    /**
     * Represents the author of the interaction as a guild member.
     * Only available if the interaction comes from a guild where the author is still a member.
     */
    member: GuildMember | APIInteractionGuildMember | null;
    /**
     * Whether or not this message is a partial
     */
    readonly partial: false;
    /**
     * Utilities for command responding.
     */
    util: MessageCommandUtil<AkairoMessage>;
    /**
     * @param client - AkairoClient
     * @param interaction - CommandInteraction
     */
    constructor(client: AkairoClient, interaction: ChatInputCommandInteraction | ContextMenuCommandInteraction);
    /**
     * The channel that the interaction was sent in.
     */
    get channel(): TextBasedChannel | null;
    /**
     * The message contents with all mentions replaced by the equivalent text.
     * If mentions cannot be resolved to a name, the relevant mention in the message content will not be converted.
     */
    get cleanContent(): string | null;
    /**
     * The guild the interaction was sent in (if in a guild channel).
     */
    get guild(): Guild | null;
    /**
     * The time the message was sent at
     */
    get createdAt(): Date;
    /**
     * The url to jump to this message
     */
    get url(): string | null;
    /**
     * Indicates whether this interaction is received from a guild.
     */
    inGuild(): this is this & {
        guild: Guild;
        member: GuildMember;
    };
    /**
     * Deletes the reply to the command.
     */
    delete(): Promise<void>;
    /**
     * Replies or edits the reply of the slash command.
     * @param options The options to edit the reply.
     */
    reply(options: string | MessagePayload | InteractionReplyOptions): Promise<Message | APIMessage>;
}
//# sourceMappingURL=AkairoMessage.d.ts.map