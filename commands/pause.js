const { canModifyQueue } = require("../util/ComeQueso");
const { MessageEmbed } = require('discord.js');


module.exports = {
  name: "pause",
  description: "Pausar la música que se está reproduciendo actualmente",
  execute(message) {
    const queue = message.client.queue.get(message.guild.id);
    if (!queue) return message.reply("There is nothing playing.").catch(console.error);
    if (!canModifyQueue(message.member)) return;

    if (queue.playing) {
      queue.playing = false;
      queue.connection.dispatcher.pause(true);
      let user = message.author;
      
      const embed3 = new MessageEmbed()
            .setTitle(`${user.username} ⏸ La transmisión ha sido pausada .`)
            .setColor("#F5ECEC")
        return queue.textChannel.send(embed3).catch(console.error);
    }
  }
};