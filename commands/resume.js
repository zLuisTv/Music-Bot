const { canModifyQueue } = require("../util/ComeQueso");
const { MessageEmbed } = require('discord.js');


module.exports = {
  name: ["resume", "reanude"],
  aliases: ["r"],
  description: "Reanudar la reproducción de música actualmente",
  execute(message) {
    const queue = message.client.queue.get(message.guild.id);
    if (!queue) return message.reply("There is nothing playing.").catch(console.error);
    if (!canModifyQueue(message.member)) return;

    if (!queue.playing) {
      queue.playing = true;
      queue.connection.dispatcher.resume();

      const embed4 = new MessageEmbed()
            .setTitle(`${user.username} ▶ reanudando transmisión...!`)
            .setColor("#F5ECEC")
      return queue.textChannel.send(embed4).catch(console.error);
    }

    return message.reply("The queue is not paused.").catch(console.error);
  }
};