/*
  __  __           _            ____        _   
 |  \/  |_   _ ___(_) ___      | __ )  ___ | |_ 
 | |\/| | | | / __| |/ __|_____|  _ \ / _ \| __|
 | |  | | |_| \__ \ | (_ |_____| |_) | (_) | |_ 
 |_|  |_|\__,_|___/_|\___|     |____/ \___/ \__|
                                                
*/

const Discord = require("discord.js");
const client = new Discord.Client();
const config = require("./config.json");
const { prefix, token } = require("./config.json");

const ytdlDiscord = require("ytdl-core-discord");
const scdl = require("soundcloud-downloader");
const { MessageEmbed } = require("discord.js");
const ytdl = require("discord-ytdl-core");
const YouTubeAPI = require("simple-youtube-api");
const youtube = new YouTubeAPI(config.YOUTUBE_API_KEY);
const { YOUTUBE_API_KEY, SOUNDCLOUD_CLIENT_ID } = require("./config.json");
const createBar = require("string-progressbar");
const queue = new Map();

client.on("ready" , () =>{
    console.log(`Iniciado como ${client.user.tag}!`);
    console.log('')
    console.log('╔[════════════]╗')
    console.log('Created By: Lui#9680')
    console.log('╚[════════════]╝')
     client.user.setPresence({
       status: "online",
      activity: {
        name: "Music Bot (Simple)",
        type: "STREAMING",
        url: "https://twitch.tv/zluisone"
       }
     })
  });
  client.on("warn", (info) => console.log(info));
client.on("error", console.error);


/*
  ____  _             _   
 / ___|| |_ __ _ _ __| |_ 
 \___ \| __/ _` | '__| __|
  ___) | || (_| | |  | |_ 
 |____/ \__\__,_|_|   \__|
                          
*/
//////////////////////////////////////////////////////////////////////////
client.on("message", async message => {
  if(message.content.startsWith(prefix)){

  const args = message.content.slice(prefix.length).trim().split(/ +/);
  const command = args.shift().toLowerCase();
//////////////////////////////////////////////////////////////////////////  
  
    const serverQueue = queue.get(message.guild.id);

    if (command == "play") {
      execute(message, serverQueue);
      return;
    } else if (command == "skip") {
      skip(message, serverQueue);
      return;
    } else if (command == "stop") {
      stop(message, serverQueue);
      return;
    } else if (command == "queue") {
      queueList(message, serverQueue);
      return;
    } else if (command == "pause") {
      pause(message, serverQueue);
      return;
    } else if (command == "resume") {
      resume(message, serverQueue);
      return;
    } else if (command == "nowplaying") {
      nowplaying(message, serverQueue);
      return;
    }
}
});

/*

      _____                 _   _                 
     |  ___|   _ _ __   ___| |_(_) ___  _ __  ___ 
     | |_ | | | | '_ \ / __| __| |/ _ \| '_ \/ __|
     |  _|| |_| | | | | (__| |_| | (_) | | | \__ \
     |_|   \__,_|_| |_|\___|\__|_|\___/|_| |_|___/
                                              
                                              
*/
    

  async function execute(message, serverQueue) {
  let guild = message.guild;
  const args = message.content.split(" ");

  const voiceChannel = message.member.voice.channel;

  if (!voiceChannel)
    return message.channel.send("Debes estar conectado a un canal de voz");

  const permissions = voiceChannel.permissionsFor(message.client.user);
  if (!permissions.has("CONNECT"))
    return message.reply(
      "No se puede conectar al canal de voz, faltan permisos"
    );
  if (!permissions.has("SPEAK"))
    return message.reply(
      "No puedo hablar en este canal de voz, ¡asegúrese de tener los permisos adecuados!"
    );

  const search = args.join(" ");
  const videoPattern = /^(https?:\/\/)?(www\.)?(m\.)?(youtube\.com|youtu\.?be)\/.+$/gi;
  const playlistPattern = /^.*(list=)([^#\&\?]*).*/gi;
  const scRegex = /^https?:\/\/(soundcloud\.com)\/(.*)$/;
  const url = args[0];
  const urlValid = videoPattern.test(args[0]);

    if(!search) return;
  
  let songInfo = null;
  let song = null;

  if (urlValid) {
    try {
      songInfo = await ytdl.getInfo(url);
      song = {
        title: songInfo.videoDetails.title,
        url: songInfo.videoDetails.video_url,
        duration: songInfo.videoDetails.lengthSeconds,
        author: songInfo.videoDetails.author
        //image: songInfo.videoDetails.thumbnail.url
      };
    } catch (error) {
      console.error(error);
      return message.reply(error.message).catch(console.error);
    }
  } else if (scRegex.test(url)) {
    try {
      const trackInfo = await scdl.getInfo(url, SOUNDCLOUD_CLIENT_ID);
      song = {
        title: trackInfo.title,
        url: trackInfo.permalink_url,
        duration: Math.ceil(trackInfo.duration / 1000), //trackInfo.duration / 1000,
        author: trackInfo.author
        //image: trackInfo.thumbnail.url
      };
    } catch (error) {
      console.error(error);
      return message.reply(error.message).catch(console.error);
    }
  } else {
    try {
      const results = await youtube.searchVideos(search, 1);
      songInfo = await ytdl.getInfo(results[0].url);
      song = {
        title: songInfo.videoDetails.title,
        url: songInfo.videoDetails.video_url,
        duration: songInfo.videoDetails.lengthSeconds,
        author: songInfo.videoDetails.author
        //image: songInfo.videoDetails.thumbnail.url
      };
    } catch (error) {
      console.error(error);
      return message.reply(error.message).catch(console.error);
    }
  }

  if (!serverQueue) {
    const queueConstruct = {
      textChannel: message.channel,
      voiceChannel: voiceChannel,
      connection: null,
      songs: [],
      volume: 100,
      playing: true
    };

    queue.set(message.guild.id, queueConstruct);
    queueConstruct.songs.push(song);

    try {
      var connection = await voiceChannel.join();
      queueConstruct.connection = connection;
      await queueConstruct.connection.voice.setSelfDeaf(true);
      play(message.guild, queueConstruct.songs[0], message);
    } catch (error) {
      console.error(error);
      queue.delete(message.guild.id);
      await voiceChannel.leave();
      return message.channel
        .send(`No se pudo unir al canal: ${error}`)
        .catch(console.error);
    }
  } else if (serverQueue){
    serverQueue.songs.push(song);
    return message.channel.send(`**${song.title}** has been added to the queue!`);
  }
}

///////////////////////////////////////////////////////////////////////////////////////

function skip(message, serverQueue) {
  if (!serverQueue)
    return message
      .reply("There is nothing playing that I could skip for you.")
      .catch(console.error);

  serverQueue.playing = true;
  serverQueue.connection.dispatcher.end();
  let user = message.author;

  serverQueue.textChannel
    .send(`${user} ⏩ Skipped playback.`)
    .catch(console.error);
}

function stop(message, serverQueue) {
  if (!serverQueue)
    return message.reply("No hay nada Reproduciendose.").catch(console.error);

  serverQueue.songs = [];
  serverQueue.connection.dispatcher.end();
  let user = message.author;

  serverQueue.textChannel
    .send(`${user} ⏹ Playback stopped.`)
    .catch(console.error);
}

async function queueList(message, serverQueue) {
  const permissions = message.channel.permissionsFor(message.client.user);
  if (!permissions.has(["MANAGE_MESSAGES", "ADD_REACTIONS"]))
    return message.reply(
      "Missing permission to manage messages or add reactions"
    );

  if (!serverQueue)
    return message.channel.send("❌ **Nothing playing in this server**");

  let currentPage = 0;
  const embeds = generateQueueEmbed(message, serverQueue.songs);

  const queueEmbed = await message.channel.send(
    `**Current Page - ${currentPage + 1}/${embeds.length}**`,
    embeds[currentPage]
  );

  try {
    await queueEmbed.react("⬅️");
    await queueEmbed.react("⏹");
    await queueEmbed.react("➡️");
  } catch (error) {
    console.error(error);
    message.channel.send(error.message).catch(console.error);
  }

  const filter = (reaction, user) =>
    ["⬅️", "⏹", "➡️"].includes(reaction.emoji.name) &&
    message.author.id === user.id;
  const collector = queueEmbed.createReactionCollector(filter, { time: 60000 });

  collector.on("collect", async (reaction, user) => {
    try {
      if (reaction.emoji.name === "➡️") {
        if (currentPage < embeds.length - 1) {
          currentPage++;
          queueEmbed.edit(
            `**Current Page - ${currentPage + 1}/${embeds.length}**`,
            embeds[currentPage]
          );
        }
      } else if (reaction.emoji.name === "⬅️") {
        if (currentPage !== 0) {
          --currentPage;
          queueEmbed.edit(
            `**Current Page - ${currentPage + 1}/${embeds.length}**`,
            embeds[currentPage]
          );
        }
      } else {
        collector.stop();
        reaction.message.reactions.removeAll();
      }
      await reaction.users.remove(message.author.id);
    } catch (error) {
      console.error(error);
      return message.channel.send(error.message).catch(console.error);
    }
  });
}

function pause(message, serverQueue) {
  if (!serverQueue)
    return message.reply("No hay nada Reproduciendose.").catch(console.error);

  if (serverQueue.playing) {
    serverQueue.playing = false;
    serverQueue.connection.dispatcher.pause(true);
    let user = message.author;

    return serverQueue.textChannel
      .send(`${user} ⏸ Has paused playback`)
      .catch(console.error);
  }
}

function resume(message, serverQueue) {
  if (!serverQueue)
    return message.reply("No hay nada Reproduciendose.").catch(console.error);

  if (!serverQueue.playing) {
    serverQueue.playing = true;
    serverQueue.connection.dispatcher.resume();

    return serverQueue.textChannel
      .send(`${message.author} Has resumed playback`)
      .catch(console.error);
  }
  return message.reply("The queue is not paused.").catch(console.error);
}

function nowplaying(message, serverQueue) {
  if (!serverQueue)
    return message.reply("There's nothing playing").catch(console.error);

  const song = serverQueue.songs[0];
  const seek =
    (serverQueue.connection.dispatcher.streamTime -
      serverQueue.connection.dispatcher.pausedTime) /
    1000;
  const left = song.duration - seek;

  let nowPlaying = new MessageEmbed()
    .setTitle("🎶 Playing now:")
    .setDescription(`${song.title}\n${song.url}`)
    .setColor("#F8AA2A")
    .setAuthor(message.client.user.username);

  if (song.duration > 0) {
    nowPlaying.addField(
      "\u200b",
      new Date(seek * 1000).toISOString().substr(11, 8) +
        "[" +
        createBar(song.duration == 0 ? seek : song.duration, seek, 20)[0] +
        "]" +
        (song.duration == 0
          ? " ◉ LIVE"
          : new Date(song.duration * 1000).toISOString().substr(11, 8)),
      false
    );
    nowPlaying.setFooter(
      "Time Remaining: " + new Date(left * 1000).toISOString().substr(11, 8)
    );
  }
  return message.channel.send(nowPlaying);
}

function generateQueueEmbed(message, serverQueue) {
  let embeds = [];
  let k = 10;

  for (let i = 0; i < serverQueue.length; i += 10) {
    const current = serverQueue.slice(i, k);
    let j = i;
    k += 10;

    const info = current
      .map(track => `${++j} - [${track.title}](${track.url})`)
      .join("\n");

    const embed = new MessageEmbed()
      .setTitle("Song Queue\n")
      .setThumbnail(message.guild.iconURL())
      .setColor("#F8AA2A")
      .setDescription(
        `**Current Song - [${serverQueue[0].title}](${serverQueue[0].url})**\n\n${info}`
      )
      .setTimestamp();
    embeds.push(embed);
  }

  return embeds;
}

async function play(guild, song, message) {
  const serverQueue = await queue.get(guild.id);

  if (!song) {
    setTimeout(async function() {
      await serverQueue.voiceChannel.leave();
    }, 60000);
    await queue.delete(guild.id);  
    return message.channel.send('❌The queue ended.');
  }

  let stream = null;
  let streamType = song.url.includes("youtube.com") ? "opus" : "ogg/opus";

  try {
    if (song.url.includes("youtube.com")) {
      stream = await ytdl(song.url, {
        filter: "audioonly",
        quality: "highestaudio",
        opusEncoded: true,
        highWaterMark: 1 << 25
      });
    } else if (song.url.includes("soundcloud.com")) {
      try {
        stream = await scdl.downloadFormat(
          song.url,
          scdl.FORMATS.OPUS,
          SOUNDCLOUD_CLIENT_ID
        );
      } catch (error) {
        stream = await scdl.downloadFormat(
          song.url,
          scdl.FORMATS.MP3,
          SOUNDCLOUD_CLIENT_ID
        );
        streamType = "unknown";
      }
    }
  } catch (error) {
    if (queue) {
      queue.songs.shift();
    }

    console.error(error);
  }

  /*      const stream = await ytdl(song.url, {
        filter: "audioonly",
        quality: "highestaudio",
        opusEncoded: true,
        highWaterMark: 1 << 25
      });
      
      
*/

  const dispatcher = await serverQueue.connection
    .play(stream, { type: streamType })
    .on("finish", async () => {
      serverQueue.songs.shift();

      await play(guild, serverQueue.songs[0], message);
    })
    .on("error", error => console.log(error));

  dispatcher.setVolume(serverQueue.volume);

  return serverQueue.textChannel.send(
    `Started Playing 🎶: **${song.title}** \n**${song.url}**`
  );
}

    
client.login(config.token); 
