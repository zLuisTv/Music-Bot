const Discord = require("discord.js");
const client = new Discord.Client();

const ytdlDiscord = require("ytdl-core-discord");
const scdl = require("soundcloud-downloader");
const { canModifyQueue } = require("../util/ComeQueso");
const { small } = require("ffmpeg-static");
const { Video } = require("simple-youtube-api");
const { getVideoID } = require("ytdl-core-discord");


module.exports = {
  async play(song, message) {
    const { PRUNING, SOUNDCLOUD_CLIENT_ID } = require("../config.json");
    const queue = message.client.queue.get(message.guild.id);

    if (!song) {
      queue.channel.leave()
      message.client.queue.delete(message.guild.id);
      const embed = new Discord.MessageEmbed()
      .setTitle("🚫 La transmisión ha finalizado.")
      .setColor("#F5ECEC")
      console.log('╔[═════════════════════════════════════════════════════════════════]╗')
      console.log(`[Start] ${new Date()}`);
      console.log('')
      console.log(`[Message Author] ${message.author.tag}`)
      console.log('');
      console.log(`[Guild] ${message.guild.name}`);
      console.log(``);
      console.log(`[Finish]`)
      console.log('╚[═════════════════════════════════════════════════════════════════]╝')
      return queue.textChannel.send(embed).catch(console.error);
      
    }

    let stream = null;
    let streamType = song.url.includes("youtube.com") ? "opus" : "ogg/opus";

    try {
      if (song.url.includes("youtube.com")) {
        stream = await ytdlDiscord(song.url, { highWaterMark: 1 << 25 });
      } else if (song.url.includes("soundcloud.com")) {
        try {
          stream = await scdl.downloadFormat(song.url, scdl.FORMATS.OPUS, SOUNDCLOUD_CLIENT_ID ? SOUNDCLOUD_CLIENT_ID : undefined);
        } catch (error) {
          stream = await scdl.downloadFormat(song.url, scdl.FORMATS.MP3, SOUNDCLOUD_CLIENT_ID ? SOUNDCLOUD_CLIENT_ID : undefined);
          streamType = "unknown";
        }
      }
    } catch (error) {
      if (queue) {
        queue.songs.shift();
        module.exports.play(queue.songs[0], message);
      }

      console.error(error);
     // const embed1 = new Discord.MessageEmbed()
    //  .setTitle(`Error: ${error.message ? error.message : error}`)
    //  .setColor("#F5ECEC")
      return console.log(error);
    }

    queue.connection.on("disconnect", () => message.client.queue.delete(message.guild.id));

    const dispatcher = queue.connection
      .play(stream, { type: streamType })
      .on("finish", () => {
        if (collector && !collector.ended) collector.stop();

        if (queue.loop) {

          // si el bucle está activado, empuja la canción al final de la cola
          // para que pueda repetirse sin cesar
          
          let lastSong = queue.songs.shift();
          queue.songs.push(lastSong);
          module.exports.play(queue.songs[0], message);
        } else {

          // Reproducir recursivamente la siguiente canción

          queue.songs.shift();
          module.exports.play(queue.songs[0], message);
        }
      })
      .on("error", (err) => {
        console.error(err);
        queue.songs.shift();
        module.exports.play(queue.songs[0], message);
      });
    dispatcher.setVolumeLogarithmic(queue.volume / 100);


    try {


      const textEmbed = new Discord.MessageEmbed()
      .setColor("#F5ECEC")
      .setAuthor('Reproduciendo', message.author.displayAvatarURL())
      .setDescription(`**[${song.title}](${song.url}) \n[═══════════════════════════════════════════════]**`)
      .addField('**Solicitado por:**', `${message.author.tag}`)
      .addField("Duración:",`${song.duration} segundos`)
//      .addField('Artista:',`**${}**`)
//        .setThumbnail(client.user.displayAvatarURL())//https://cdn.discordapp.com/emojis/393564669807427584.gif
//      .setThumbnail(`https://i.ytimg.com/vi/${}/maxresdefault.jpg`)
      .setFooter("🎶 Quesito Music")
      .setTimestamp()
//╔[═════════════════════════════════════════════════════════════════]╗

//╚[═════════════════════════════════════════════════════════════════]╝
      var playingMessage = await queue.textChannel.send(textEmbed); 
      console.log('╔[═════════════════════════════════════════════════════════════════]╗')
      console.log(`[Start] ${new Date()}`);
      console.log('')
      console.log(`[Message Author] ${message.author.tag}`)
      console.log('');
      console.log(`[Guild] ${message.guild.name}`);
      console.log(``);
      console.log(`[Music] ${song.title}`);
      console.log(``);
      console.log('╚[═════════════════════════════════════════════════════════════════]╝')
      await playingMessage.react("⏯");
      await playingMessage.react("⏭");
      await playingMessage.react("⏹");
      await playingMessage.react("🔁");
    } catch (error) {
      console.error(error);
    }

    const filter = (reaction, user) => user.id !== message.client.user.id;
    var collector = playingMessage.createReactionCollector(filter, {
      time: song.duration > 0 ? song.duration * 1000 : 600000
    });

    collector.on("collect", (reaction, user) => {
      if (!queue) return;
      const member = message.guild.member(user);

      switch (reaction.emoji.name) {
        case "⏭":
          queue.playing = true; 
          reaction.users.remove(user).catch(console.error);
          if (!canModifyQueue(member)) return;
          queue.connection.dispatcher.end();
          const embed2 = new Discord.MessageEmbed()
          .setTitle(`${user.username} ⏩ Sé salto la canción`)
          .setColor("#F5ECEC")
          queue.textChannel.send(embed2).catch(console.error);
          collector.stop();
          break;

        case "⏯":
          reaction.users.remove(user).catch(console.error);
          if (!canModifyQueue(member)) return;
          if (queue.playing) {
            queue.playing = !queue.playing;
            queue.connection.dispatcher.pause(true);
            const embed3 = new Discord.MessageEmbed()
            .setTitle(`${user.username} ⏸ La transmisión ha sido pausada .`)
            .setColor("#F5ECEC")
            queue.textChannel.send(embed3).catch(console.error);
          } else {
            queue.playing = !queue.playing;
            queue.connection.dispatcher.resume();
            const embed4 = new Discord.MessageEmbed()
            .setTitle(`${user.username} ▶ reanudando transmisión...!`)
            .setColor("#F5ECEC")
            queue.textChannel.send(embed4).catch(console.error);
          }
          break;

        case "🔁":
          reaction.users.remove(user).catch(console.error);
          queue.loop = !queue.loop;
          const embed5 = new Discord.MessageEmbed()
          .setTitle(`Loop is now ${queue.loop ? "**on**" : "**off**"}`)
          .setColor('#F5ECEC')
          queue.textChannel.send(embed5).catch(console.error);
          break;

        case "⏹":
          reaction.users.remove(user).catch(console.error);
          if (!canModifyQueue(member)) return;
          queue.songs = [];
          const embed6 = new Discord.MessageEmbed()
          .setTitle(`${user.username} ⏹  Detuvo la transmisión`)
          .setColor("#F5ECEC")
          queue.textChannel.send(embed6).catch(console.error);
          console.log('╔[═════════════════════════════════════════════════════════════════]╗')
          console.log(`[Start] ${new Date()}`);
          console.log('')
          console.log(`[Message Author] ${message.author.tag}`)
          console.log('');
          console.log(`[Guild] ${message.guild.name}`);
          console.log(``);
          console.log(`[Finish] ${song.title}`);
          console.log('╚[═════════════════════════════════════════════════════════════════]╝')
          try {
            queue.connection.dispatcher.end();
          } catch (error) {
            console.error(error);
            queue.connection.disconnect();
          }
          collector.stop();
          break;

        default:
          reaction.users.remove(user).catch(console.error);
          break;
      }
    });

    collector.on("end", () => {
      playingMessage.reactions.removeAll().catch(console.error);
      if (PRUNING && playingMessage && !playingMessage.deleted) {
        playingMessage.delete({ timeout: 5000 }).catch(console.error);
      }
    });
  }
};
