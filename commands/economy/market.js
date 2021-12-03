const _ = require('lodash');
const { MessageEmbed, GuildEmoji } = require('discord.js');
const Pages = require(`${process.cwd()}/struct/Paginate`);
const market = require(`${process.cwd()}/shop/market.json`);
const text = require(`${process.cwd()}/util/string`);
const Discord = require("discord.js")
const { Color } = require("../../config.js")
module.exports = {
  name: "market",
  aliases: ["market","shop"],
  enabled: true,			    
  memberPermissions: [ "SEND_MESSAGES" ],		
  botPermissions: [ "SEND_MESSAGES","EMBED_LINKS" ],		
  ownerOnly: false,			
  cooldown: 5000,
  run: async (bot, message,[type],prefix) => {
    let selected = market.filter(x => x.type === type?.toLowerCase());
    
        if (!selected.length){
          selected = market;
        };
    
        const pages = new Pages(_.chunk(selected, 24).map((chunk, i, o) => {
          return new MessageEmbed()
          .setColor('GREY')
          .setTitle('Gamble\'s Market')
          .setDescription('__You can view all of the items in the market__')
          .setFooter(`Market | \©️${new Date().getFullYear()} Bobo\u2000\u2000•\u2000\u2000Page ${i+1} of ${o.length}`)
          .addFields(...chunk.map(item => {
            return {
              inline: true,
              name: `${item.emoji || ""}\`[${item.id}]\` ${item.name}`,
              value: [
                item.description,
                `Type: *${item.type}*`,
                `Price: *${text.commatize(item.price)}*`,
                `Check Preview : \`${prefix}previewitem ${item.id}\``,
                `Purchase: \`${prefix}buy ${item.id} [amount]\``
              ].join('\n')
            };
          }));
        }));
    
        const msg = await message.channel.send({embeds:[pages.firstPage]});
    
        if (pages.size === 1){
          return;
        };
    
        const prev = bot.emojis.cache.get('767062237722050561') || '◀';
        const next = bot.emojis.cache.get('767062244034084865') || '▶';
        const terminate = bot.emojis.cache.get('767062250279927818') || '❌';
    
        const filter = (_, user) => user.id === message.author.id;
        const collector = msg.createReactionCollector({filter});
        const navigators = [ prev, next, terminate ];
        let timeout = setTimeout(()=> collector.stop(), 90000);
    
        for (let i = 0; i < navigators.length; i++) {
          await msg.react(navigators[i]);
        };
    
        collector.on('collect', async reaction => {
    
          switch(reaction.emoji.name){
            case prev instanceof GuildEmoji ? prev.name : prev:
              msg.edit({embeds:[pages.previous()]});
            break;
            case next instanceof GuildEmoji ? next.name : next:
              msg.edit({embeds:[pages.next()]});
            break;
            case terminate instanceof GuildEmoji ? terminate.name : terminate:
              collector.stop();
            break;
          };
    
          await reaction.users.remove(message.author.id);
          timeout.refresh();
        });
    
       collector.on('end', async () => await msg.reactions.removeAll());
    
  }}
         
