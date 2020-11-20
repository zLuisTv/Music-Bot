/*
  ____        _     _____                
 | __ )  ___ | |_  | ____|__ _ ___ _   _ 
 |  _ \ / _ \| __| |  _| / _` / __| | | |
 | |_) | (_) | |_  | |__| (_| \__ \ |_| |
 |____/ \___/ \__| |_____\__,_|___/\__, |
                                   |___/ 
*/

const Discord = require("discord.js");
const client = new Discord.Client({ partials: ["MESSAGE", "CHANNEL", "REACTION"]});
const config = require("./config.json");
const {prefix, token} = require ("./config.json")

const ms = require('ms')
const moment = require('moment');
require("moment-duration-format");
const fetch = require("node-fetch")
const fs = require('fs');

client.on("ready" , () =>{
    console.log(`Iniciado como ${client.user.tag}!`);
    console.log('')
    console.log('')
    console.log('╔[═════════════════════════════════════════════════════════════════]╗')
    console.log(`[Start] ${new Date()}`);
    console.log('╚[═════════════════════════════════════════════════════════════════]╝')
    console.log('')
    console.log('╔[════════════]╗')
    console.log('Created By: LuisM#1423')
    console.log('╚[════════════]╝')
    const actividad = [``,`Bot Easy`,`Prefix: !`,"Owner: LuisM#1423"
      ];
    setInterval(()=>{const index = Math.floor(Math.random() * (actividad.length - 1) + 1 );
    client.user.setPresence({
       status: "online",
       activity: {
          name: actividad[index],
          type: "WATCHING"
       }
     })
    }, 5000);
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

client.on("message", async message => {
  if(message.content.startsWith(prefix)){

  const args = message.content.slice(prefix.length).trim().split(/ +/);
  const command = args.shift().toLowerCase();
  
  if(command == 'ping') {
    try {
      const m = await message.channel.send("Haciendo ping ..."); // Asegúrese de que el async esté escrito, en la parte superior del cliente. En ("mensaje", ...)
      const embed = new Discord.MessageEmbed()
      .setColor("RANDOM") // ¿Estás cansado de elegir los colores para insertar? ¡Simplemente escriba "RANDOM" en él!
      .addField("⌛ Latencia", `**${m.createdTimestamp -  message.createdTimestamp}ms**`)
      .addField("💓 API", `**${Math.floor(client.ws.ping)}ms**`) // Use "client.ping" si su Discord.js es <1.15.1 --- Use "client.ws.ping" si su Discord.js es> 12.0.0
      return m.edit(`🏓 Pong!`, embed, {timeout: 10000 });
    } catch (error) {
      return message.channel.send(`Algo salió mal: ${error.message}`);
    }
  } 
  
  
}
});

client.login(config.token); 
