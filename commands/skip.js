const { canModifyQueue } = require("../util/ComeQueso");
const { MessageEmbed } = require('discord.js');

module.exports = {
  name: "skip",
  aliases: ["s"],
  description: "Omitir la canción que se está reproduciendo actualmente",
  execute(message) {
    const queue = message.client.queue.get(message.guild.id);
    if (!queue)
      return message.reply("There is nothing playing that I could skip for you.").catch(console.error);
    if (!canModifyQueue(message.member)) return;

    queue.playing = true;
    queue.connection.dispatcher.end();
    let user = message.author;

    const embed2 = new MessageEmbed() 
          .setTitle(`${user.username} ⏩ Sé salto la canción`)
          .setColor("#F5ECEC")
    queue.textChannel.send(embed2).catch(console.error);
  }
};