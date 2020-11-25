const Discord = require("discord.js");

module.exports = {
  name: "help-m",
  aliases: ["hm"],
  description: "Mostrar todos los comandos de Música y descripciones",
  execute(message) {
    let commands = message.client.commands.array();

    let helpEmbed = new Discord.MessageEmbed()
      .setTitle("Ayuda con la Música :D")
      .setDescription("Lista de comandos Musicales")
      .setColor("#F8AA2A")

    commands.forEach((cmd) => {
      helpEmbed.addField(`**${message.client.prefix}${cmd.name} ${cmd.aliases ? `(${cmd.aliases})` : ""}**`,`${cmd.description}`,true)
    })

    helpEmbed.setTimestamp();

    return message.channel.send(helpEmbed).catch(console.error);
  }
};