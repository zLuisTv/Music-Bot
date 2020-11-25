const { canModifyQueue } = require("../util/ComeQueso");
const { MessageEmbed } = require('discord.js');

module.exports = {
  name: "loop",
  aliases: ['l'],
  description: "Alternar bucle de música",
  execute(message) {
    const queue = message.client.queue.get(message.guild.id);
    if (!queue) return message.reply("There is nothing playing.").catch(console.error);
    if (!canModifyQueue(message.member)) ;

    // toggle from false to true and reverse
    queue.loop = !queue.loop;
    const embed5 = new MessageEmbed()
          .setTitle(`Loop is now ${queue.loop ? "**on**" : "**off**"}`)
          .setColor('#F5ECEC')
     return queue.textChannel.send(embed5).catch(console.error);
  }
};