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
var queue = new  Map();
const { readdirSync } = require("fs");
const { join } = require("path");
client.aliases = new Collection();
client.commands = new Collection();
client.prefix = prefix;
client.queue = new Map();
client.config = config;
const cooldowns = new Collection();

client.on("ready" , () =>{
    console.log(`Iniciado como ${client.user.tag}!`);
    console.log('')
    console.log('')
    console.log('╔[═════════════════════════════════════════════════════════════════]╗')
    console.log(`[Start] ${new Date()}`);
    console.log('╚[═════════════════════════════════════════════════════════════════]╝')
    console.log('')
    console.log('╔[════════════]╗')
    console.log('Created By: False#9680')
    console.log('╚[════════════]╝')
    const actividad = [``,`Bot Easy`,`Prefix: !`,"Owner: False#9680"
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

let commandFiles = readdirSync(join(__dirname, "commands", )).filter((file) => file.endsWith(".js")) 

 for (const file of commandFiles) {
   const command = require(join(__dirname, "commands" ,  `${file}`));
   client.commands.set(command.name, command);
 }
 
 client.on("message", async (message) => {
   if (message.author.bot) return;
   if (!message.guild) return;
 
   const prefixRegex = new RegExp(`^(<@!?${client.user.id}>|${escapeRegex(prefix)})\\s*`);
   if (!prefixRegex.test(message.content)) return;
 
   const [, matchedPrefix] = message.content.match(prefixRegex);
 
   const args = message.content.slice(matchedPrefix.length).trim().split(/ +/);
   const commandName = args.shift().toLowerCase();
  
   const command =
     client.commands.get(commandName) ||
     client.commands.find((cmd) => cmd.aliases && cmd.aliases.includes(commandName));
 
   if (!command) return;
 
   if (!cooldowns.has(command.name)) {
     cooldowns.set(command.name, new Collection());
   }
 
   const now = Date.now();
   const timestamps = cooldowns.get(command.name);
   const cooldownAmount = (command.cooldown || 1) * 2000;
 
   if (timestamps.has(message.author.id)) {
     const expirationTime = timestamps.get(message.author.id) + cooldownAmount;
 
     if (now < expirationTime) {
       const timeLeft = (expirationTime - now) / 1000;
       return message.reply(
         `please wait ${timeLeft.toFixed(1)} more second(s) before reusing the \`${command.name}\` command.`
       );
     }
   }
 
   timestamps.set(message.author.id, now);
   setTimeout(() => timestamps.delete(message.author.id), cooldownAmount);
 
   try {
     command.execute(message, args);
   } catch (error) {
     console.error(error);
     message.reply("There was an error executing that command.").catch(console.error);
   }
 });


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
