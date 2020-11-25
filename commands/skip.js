const { canModifyQueue } = require("../util/Quesito");
const { MessageEmbed } = require('discord.js');

module.exports = {
  name: "skip",
  aliases: ["s"],
  description: "Omitir la canción que se está reproduciendo actualmente",
  execute(message) {
    const queue = message.client.queue.get(message.guild.id);
    if (!queue)
      return message.reply("No hay nada reproduciendo para que pueda saltar por ti.").catch(console.error);
    if (!canModifyQueue(message.member)) return;

    queue.playing = true;
    queue.connection.dispatcher.end();
    let user = message.author;

    const embed2 = new MessageEmbed() 
          .setDescription(`**${user.username}** ⏩ Sé salto la canción`)
          .setColor("#F5ECEC")
    queue.textChannel.send(embed2).catch(console.error);
  }
};
