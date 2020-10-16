import EMOJIS from '../../bot/core/config/emojis.json';
import CHANNELS from '../../bot/core/config/channels.json';
import ROLES from '../../bot/core/config/roles.json';

import ChannelsHelper from "../../bot/core/entities/channels/channelsHelper";
import VotingHelper from "../events/voting/votingHelper";
import UsersHelper from "../../bot/core/entities/users/usersHelper";

export default class RedemptionHelper {

    static async onReaction(reaction, user) {
        const emoji = reaction.emoji.name;
        const isVoteEmoji = [EMOJIS.VOTE_FOR, EMOJIS.VOTE_AGAINST].indexOf(emoji) > -1;
        const channelID = reaction.message.channel.id;

        if (user.bot) return false;
        if (!isVoteEmoji) return false;
        if (channelID !== CHANNELS.INTRO.id) return false;

        // Process the vote
        this.processVote(reaction, user);
    }

    static async notify(guild, message) {
        return ChannelsHelper.sendByCodes(guild, ['ENTRY'], message);
    }

    static async processVote(reaction, user) {
        const guild = reaction.message.guild;
        const voterMember = UsersHelper.getMemberByID(guild, user.id);
        const targetUser = reaction.message.author;
        const targetMember = UsersHelper.getMemberByID(guild, targetUser.id);

        let forVotes = 0;
        let againstVotes = 0;

        try {
            // If member left, don't do anything.
            if (!targetMember) return false;
            
            // If targetMember has "member" role, don't do anything.
            if (UsersHelper.hasRoleID(targetMember, ROLES.MEMBER.id)) return false;
            
            // Calculate the number of required votes for the redemption poll.
            const reqForVotes = VotingHelper.getNumRequired(guild, .05);
            const reqAgainstVotes = VotingHelper.getNumRequired(guild, .025);
            
            // Remove invalid reactions
            if (!UsersHelper.hasRoleID(voterMember, ROLES.MEMBER.id)) 
            await reaction.remove(user.id);
            
            // Get existing reactions on message.
            reaction.message.reactions.cache.map(reactionType => {
                if (reactionType.emoji.name === EMOJIS.VOTE_FOR) forVotes = reactionType.count - 1;
                if (reactionType.emoji.name === EMOJIS.VOTE_AGAINST) againstVotes = reactionType.count - 1;
            });
            
            const votingStatusTitle = `${targetUser.username}'s entry was voted upon!`;
            const votingStatusText = votingStatusTitle +
            `\nStill required: ` +
            `Entry ${EMOJIS.VOTE_FOR}: ${Math.max(0, reqForVotes - forVotes)} | ` +
            `Removal ${EMOJIS.VOTE_AGAINST}: ${Math.max(0, reqAgainstVotes - againstVotes)}`;
            
            // Notify the relevant channels.
            await this.notify(guild, votingStatusText);
            
            // Handle user approved.
            if (forVotes >= reqForVotes) {
                // Give intro roles
                const { MEMBER, BEGINNER, SUBSCRIBER } = ROLES;

                const introRolesNames = [MEMBER.name, BEGINNER.name, SUBSCRIBER.name];
                const introRoles = RolesHelper.getRoles(this.msg.guild, introRolesNames)
                
                await targetMember.roles.add(introRoles);
                await targetMember.send('You were voted into The Coop and now have full access!');
                await this.notify(guild, 
                    `${targetUser.username} approved based on votes!` +
                    `${forVotes ? `\n\n${EMOJIS.VOTE_FOR.repeat(forVotes)}` : ''}` +
                    `${againstVotes ? `\n\n${EMOJIS.VOTE_AGAINST.repeat(againstVotes)}` : ''}`
                );
                    
            // Handle user rejected.
            } else if (againstVotes >= reqAgainstVotes) {
                await this.notify(guild, `${targetUser.username} was removed and banned (voted out)!`);
                await targetMember.send('You were voted out of The Coop!');
                await targetMember.ban();
            }            
                
        } catch(e) {
            console.error(e);
        }
    }
}