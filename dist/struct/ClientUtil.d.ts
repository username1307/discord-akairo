/// <reference types="node" />
import { AttachmentBuilder, AttachmentData, BufferResolvable, Collection, EmbedBuilder, EmbedData, Emoji, Guild, GuildChannel, GuildMember, PermissionsString, Role, Snowflake, ThreadChannel, User } from 'discord.js';
import type { Stream } from 'stream';
import type AkairoClient from './AkairoClient.js';
/**
 * Client utilities to help with common tasks.
 */
export default class ClientUtil {
    /**
     * The Akairo client.
     */
    readonly client: AkairoClient;
    /**
     * @param client - The client.
     */
    constructor(client: AkairoClient);
    /**
     * Makes a MessageAttachment.
     * @param file - The file.
     * @param data - The filename.
     */
    attachment(file: BufferResolvable | Stream, data?: AttachmentData): AttachmentBuilder;
    /**
     * Checks if a string could be referring to a channel.
     * @param text - Text to check.
     * @param channel - Channel to check.
     * @param caseSensitive - Makes checking by name case sensitive.
     * @param wholeWord - Makes checking by name match full word only.
     */
    checkChannel<C extends ThreadChannel | GuildChannel>(text: string, channel: C, caseSensitive?: boolean, wholeWord?: boolean): boolean;
    /**
     * Checks if a string could be referring to a emoji.
     * @param text - Text to check.
     * @param emoji - Emoji to check.
     * @param caseSensitive - Makes checking by name case sensitive.
     * @param wholeWord - Makes checking by name match full word only.
     */
    checkEmoji(text: string, emoji: Emoji, caseSensitive?: boolean, wholeWord?: boolean): boolean;
    /**
     * Checks if a string could be referring to a guild.
     * @param text - Text to check.
     * @param guild - Guild to check.
     * @param caseSensitive - Makes checking by name case sensitive.
     * @param wholeWord - Makes checking by name match full word only.
     */
    checkGuild(text: string, guild: Guild, caseSensitive?: boolean, wholeWord?: boolean): boolean;
    /**
     * Checks if a string could be referring to a member.
     * @param text - Text to check.
     * @param member - Member to check.
     * @param caseSensitive - Makes checking by name case sensitive.
     * @param wholeWord - Makes checking by name match full word only.
     */
    checkMember(text: string, member: GuildMember, caseSensitive?: boolean, wholeWord?: boolean): boolean;
    /**
     * Checks if a string could be referring to a role.
     * @param text - Text to check.
     * @param role - Role to check.
     * @param caseSensitive - Makes checking by name case sensitive.
     * @param wholeWord - Makes checking by name match full word only.
     */
    checkRole(text: string, role: Role, caseSensitive?: boolean, wholeWord?: boolean): boolean;
    /**
     * Resolves a user from a string, such as an ID, a name, or a mention.
     * @param text - Text to resolve.
     * @param user - Collection of users to find in.
     * @param caseSensitive - Makes finding by name case-sensitive.
     * @param wholeWord - Makes finding by name match full word only.
     */
    checkUser(text: string, user: User, caseSensitive?: boolean, wholeWord?: boolean): boolean;
    /**
     * Makes a Collection.
     * @param iterable - Entries to fill with.
     */
    collection<K, V>(iterable?: ReadonlyArray<readonly [K, V]> | null): Collection<K, V>;
    /**
     * Compares two member objects presences and checks if they stopped or started a stream or not.
     * Returns `0`, `1`, or `2` for no change, stopped, or started.
     * @param oldMember - The old member.
     * @param newMember - The new member.
     */
    compareStreaming(oldMember: GuildMember, newMember: GuildMember): 0 | 1 | 2;
    /**
     * Makes a MessageEmbed.
     * @param data - Embed data.
     */
    embed(data?: EmbedData): EmbedBuilder;
    /**
     * Combination of `<Client>.fetchUser()` and `<Guild>.fetchMember()`.
     * @param guild - Guild to fetch in.
     * @param id - ID of the user.
     * @param cache - Whether to add to cache.
     */
    fetchMember(guild: Guild, id: Snowflake, cache: boolean): Promise<GuildMember>;
    /**
     * Array of permission names.
     */
    permissionNames(): PermissionsString[];
    /**
     * Resolves a channel from a string, such as an ID, a name, or a mention.
     * @param text - Text to resolve.
     * @param channels - Collection of channels to find in.
     * @param caseSensitive - Makes finding by name case-sensitive.
     * @param wholeWord - Makes finding by name match full word only.
     */
    resolveChannel<C extends ThreadChannel | GuildChannel>(text: string, channels: Collection<Snowflake, C>, caseSensitive?: boolean, wholeWord?: boolean): C | null;
    /**
     * Resolves multiple channels from a string, such as an ID, a name, or a mention.
     * @param text - Text to resolve.
     * @param channels - Collection of channels to find in.
     * @param caseSensitive - Makes finding by name case sensitive.
     * @param wholeWord - Makes finding by name match full word only.
     */
    resolveChannels<C extends ThreadChannel | GuildChannel>(text: string, channels: Collection<Snowflake, C>, caseSensitive?: boolean, wholeWord?: boolean): Collection<Snowflake, C>;
    /**
     * Resolves a custom emoji from a string, such as a name or a mention.
     * @param text - Text to resolve.
     * @param emojis - Collection of emojis to find in.
     * @param caseSensitive - Makes finding by name case-sensitive.
     * @param wholeWord - Makes finding by name match full word only.
     */
    resolveEmoji(text: string, emojis: Collection<Snowflake, Emoji>, caseSensitive?: boolean, wholeWord?: boolean): Emoji | null;
    /**
     * Resolves multiple custom emojis from a string, such as a name or a mention.
     * @param text - Text to resolve.
     * @param emojis - Collection of emojis to find in.
     * @param caseSensitive - Makes finding by name case sensitive.
     * @param wholeWord - Makes finding by name match full word only.
     */
    resolveEmojis(text: string, emojis: Collection<Snowflake, Emoji>, caseSensitive?: boolean, wholeWord?: boolean): Collection<Snowflake, Emoji>;
    /**
     * Resolves a guild from a string, such as an ID or a name.
     * @param text - Text to resolve.
     * @param guilds - Collection of guilds to find in.
     * @param caseSensitive - Makes finding by name case sensitive.
     * @param wholeWord - Makes finding by name match full word only.
     */
    resolveGuild(text: string, guilds: Collection<Snowflake, Guild>, caseSensitive?: boolean, wholeWord?: boolean): Guild | null;
    /**
     * Resolves multiple guilds from a string, such as an ID or a name.
     * @param text - Text to resolve.
     * @param guilds - Collection of guilds to find in.
     * @param caseSensitive - Makes finding by name case sensitive.
     * @param wholeWord - Makes finding by name match full word only.
     */
    resolveGuilds(text: string, guilds: Collection<Snowflake, Guild>, caseSensitive?: boolean, wholeWord?: boolean): Collection<Snowflake, Guild>;
    /**
     * Resolves a member from a string, such as an ID, a name, or a mention.
     * @param text - Text to resolve.
     * @param members - Collection of members to find in.
     * @param caseSensitive - Makes finding by name case-sensitive.
     * @param wholeWord - Makes finding by name match full word only.
     */
    resolveMember(text: string, members: Collection<Snowflake, GuildMember>, caseSensitive?: boolean, wholeWord?: boolean): GuildMember | null;
    /**
     * Resolves multiple members from a string, such as an ID, a name, or a mention.
     * @param text - Text to resolve.
     * @param members - Collection of members to find in.
     * @param caseSensitive - Makes finding by name case sensitive.
     * @param wholeWord - Makes finding by name match full word only.
     */
    resolveMembers(text: string, members: Collection<Snowflake, GuildMember>, caseSensitive?: boolean, wholeWord?: boolean): Collection<Snowflake, GuildMember>;
    /**
     * Resolves a permission number and returns an array of permission names.
     * @param number - The permissions number.
     */
    resolvePermissionNumber(number: number): string[];
    /**
     * Resolves a role from a string, such as an ID, a name, or a mention.
     * @param text - Text to resolve.
     * @param roles - Collection of roles to find in.
     * @param caseSensitive - Makes finding by name case-sensitive.
     * @param wholeWord - Makes finding by name match full word only.
     */
    resolveRole(text: string, roles: Collection<Snowflake, Role>, caseSensitive?: boolean, wholeWord?: boolean): Role | null;
    /**
     * Resolves multiple roles from a string, such as an ID, a name, or a mention.
     * @param text - Text to resolve.
     * @param roles - Collection of roles to find in.
     * @param caseSensitive - Makes finding by name case-sensitive.
     * @param wholeWord - Makes finding by name match full word only.
     */
    resolveRoles(text: string, roles: Collection<Snowflake, Role>, caseSensitive?: boolean, wholeWord?: boolean): Collection<Snowflake, Role>;
    /**
     * Resolves a user from a string, such as an ID, a name, or a mention.
     * @param text - Text to resolve.
     * @param users - Collection of users to find in.
     * @param caseSensitive - Makes finding by name case sensitive.
     * @param wholeWord - Makes finding by name match full word only.
     */
    resolveUser(text: Snowflake | string, users: Collection<Snowflake, User>, caseSensitive?: boolean, wholeWord?: boolean): User | null;
    /**
     * Resolves multiple users from a string, such as an ID, a name, or a mention.
     * @param text - Text to resolve.
     * @param users - Collection of users to find in.
     * @param caseSensitive - Makes finding by name case-sensitive.
     * @param wholeWord - Makes finding by name match full word only.
     */
    resolveUsers(text: string, users: Collection<Snowflake, User>, caseSensitive?: boolean, wholeWord?: boolean): Collection<Snowflake, User>;
}
//# sourceMappingURL=ClientUtil.d.ts.map