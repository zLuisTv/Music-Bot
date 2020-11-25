const { play } = require("../includes/play");
const { YOUTUBE_API_KEY, SOUNDCLOUD_CLIENT_ID } = require("../config.json");
const ytdl = require("ytdl-core");
const YouTubeAPI = require("simple-youtube-api");
const youtube = new YouTubeAPI(YOUTUBE_API_KEY);
const scdl = require("soundcloud-downloader");


module.exports = {
  name: "play",
  cooldown: 3,
  aliases: ["p"],
  description: "Reproduce audio de YouTube o Soundcloud",
  async execute(message, args) {
    const { channel } = message.member.voice;

    const serverQueue = message.client.queue.get(message.guild.id);
    if (!channel) return message.reply("¡Primero debes unirte a un canal de voz!").catch(console.error);
    if (serverQueue && channel !== message.guild.me.voice.channel)
      return message.reply(`Debes estar en el mismo canal que ${message.client.user}`).catch(console.error);

    if (!args.length)
      return message
        .reply(`Usa: ${message.client.prefix}play <YouTube URL | Video Name | Soundcloud URL>`)
        .catch(console.error);

    const permissions = channel.permissionsFor(message.client.user);
    if (!permissions.has("CONNECT"))
      return message.reply("No se puede conectar al canal de voz, faltan permisos");
    if (!permissions.has("SPEAK"))
      return message.reply("No puedo hablar en este canal de voz, ¡asegúrese de tener los permisos adecuados!");

    const search = args.join(" ");
    const videoPattern = /^(https?:\/\/)?(www\.)?(m\.)?(youtube\.com|youtu\.?be)\/.+$/gi;
    const playlistPattern = /^.*(list=)([^#\&\?]*).*/gi;
    const scRegex = /^https?:\/\/(soundcloud\.com)\/(.*)$/;
    const url = args[0];
    const urlValid = videoPattern.test(args[0]);

    // Inicia la lista de reproducción si se proporcionó la URL de la lista de reproducción
    if (!videoPattern.test(args[0]) && playlistPattern.test(args[0])) {
      return message.client.commands.get("playlist").execute(message, args);
    }

    const queueConstruct = {
      textChannel: message.channel,
      channel,
      connection: null,
      songs: [],
      loop: false,
      volume: 100,
      playing: true
    };

    let songInfo = null;
    let song = null;

    if (urlValid) {
      try {
        songInfo = await ytdl.getInfo(url);
        song = {
          title: songInfo.videoDetails.title,
          url: songInfo.videoDetails.video_url,
          duration: songInfo.videoDetails.lengthSeconds,
          image: songInfo.videoDetails.thumbnail.url
        };
      } catch (error) {
        console.error(error);
        
      }
    } else if (scRegex.test(url)) {
      try {
        const trackInfo = await scdl.getInfo(url, SOUNDCLOUD_CLIENT_ID);
        song = {
          title: trackInfo.title,
          url: trackInfo.permalink_url,
          duration: trackInfo.duration / 1000,
          image: trackInfo.thumbnail
        };
      } catch (error) {
        if (error.statusCode === 404)
          return message.reply("No se pudo encontrar esa pista de Soundcloud.").catch(console.error);
        return message.reply("Se produjo un error al reproducir esa pista de Soundcloud.").catch(console.error);
      }
    } else {
      try {
        const results = await youtube.searchVideos(search, 1);
        songInfo = await ytdl.getInfo(results[0].url);
        song = {
          title: songInfo.videoDetails.title,
          url: songInfo.videoDetails.video_url,
          duration: songInfo.videoDetails.lengthSeconds,
          image: songInfo.videoDetails.thumbnail
        };
      } catch (error) {
        console.error(error);
        return message.reply("No se encontró ningún video con un título coincidente").catch(console.error);
      }
    }

    if (serverQueue) {
      serverQueue.songs.push(song);
      return serverQueue.textChannel
        .send(`✅ **${song.title}** ha sido agregado a la cola por ${message.author}`)
        .catch(console.error);
    }

    queueConstruct.songs.push(song);
    message.client.queue.set(message.guild.id, queueConstruct);

    try {
      queueConstruct.connection = await channel.join();
      await queueConstruct.connection.voice.setSelfDeaf(true);
      play(queueConstruct.songs[0], message);
    } catch (error) {
      console.error(error);
      message.client.queue.delete(message.guild.id);
      await channel.leave()
      return message.channel.send(`No se pudo unir al canal: ${error}`).catch(console.error);
    }
  }
};