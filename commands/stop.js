const { canModifyQueue } = require("../util/ComeQueso");
const { MessageEmbed } = require('discord.js');

module.exports = {
  name: "stop",
  description: "Detiene la musica",
  execute(message) {
    const queue = message.client.queue.get(message.guild.id);
    
    if (!queue) return message.reply("There is nothing playing.").catch(console.error);
    if (!canModifyQueue(message.member)) return;

    queue.songs = [];
    queue.connection.dispatcher.end();
    let user = message.author;
    
    const embed6 = new MessageEmbed()
          .setTitle(`${user.username} ⏹  Detuvo la transmisión`)
          .setColor("#F5ECEC")
    queue.textChannel.send(embed6).catch(console.error);
  }
};