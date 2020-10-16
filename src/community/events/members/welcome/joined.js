import CHANNELS from '../../../../bot/core/config/channels.json';

import ChannelsHelper from '../../../../bot/core/entities/channels/channelsHelper';
import MessagesHelper from '../../../../bot/core/entities/messages/messagesHelper';
import UsersHelper from '../../../../bot/core/entities/users/usersHelper';

export default async function memberJoined(member) {

  try {
    const welcomeMessage = await ChannelsHelper._postToChannelCode('ENTRY', 
      `Welcome <@${member.user.id}> to The Coop, I am Cooper.` +
      ` We are an referral/invite only community, please introduce yourself. <#${CHANNELS.INTRO.id}>`
    ); 

    // Send direct message and channel message about next steps.
    await member.send(
      'Welcome to The Coop! View your welcome message and next steps here: ' + 
      MessagesHelper.link(welcomeMessage)
    );

    // Add to database
    await UsersHelper.addToDatabase(member);

  } catch(e) {
    console.error(e)
  }
}