/* eslint-disable no-cond-assign */
require('dotenv').config();

const Discord = require('discord.js');

const rarityColor = require('./config/color.json').rarity;

const configs = require('./config/data/set1-en_us.json');

const client = new Discord.Client();

function getWordsBetween(str) {
  const results = [];
  const re = /{([^}]+)}/g;
  let text;

  while (text = re.exec(str)) {
    results.push(text[1]);
  }
  return results;
}

client.on('message', (message) => {
  const words = getWordsBetween(message.content);

  // console.log(message.member.hasPermission('ADMINISTRATOR'));

  words.forEach((word) => {
    const visible = { cost: false, keyword: true, description: true };

    const result = configs.find(
      (config) => config.name.toLowerCase() === word.toLowerCase()
      && config.collectible === true,
    );

    if (result) {
      const champion = configs.find(
        (config) => config.name.toLowerCase() === word.toLowerCase()
        && config.collectible === false,
      );

      // Check duplicate
      if (champion && result.cost !== champion.cost) {
        visible.cost = true;
      }
      if (champion && JSON.stringify(result.keywords) === JSON.stringify(champion.keywords)) {
        visible.keyword = false;
      }
      if (champion && result.descriptionRaw === champion.descriptionRaw) {
        visible.description = false;
      }

      const fields = [];
      if (result.type === 'Unit') {
        let { attack, health } = result;

        if (champion) {
          attack = `${attack} -> ${champion.attack}`;
          health = `${health} -> ${champion.health}`;
        }

        fields[0] = { name: 'Attack', value: attack, inline: true };
        fields[1] = { name: 'Health', value: health, inline: true };
      }

      let description = '';
      description += `**Cost:** ${visible.cost ? `${result.cost} -> ${champion.cost}` : result.cost}`;
      description += `\n**Region:** ${result.region}`;

      // Keywords
      if (result.keywords.length) {
        description += `\n**Keywords:** ${result.keywords.join(', ')}`;
      }
      if (champion && champion.keywords.length && !visible.keyword) {
        description += `\n**Keywords Level Up:** ${champion.keywords.join(', ')}`;
      }

      // Description
      if (result.descriptionRaw.length) {
        description += `\n\n${result.descriptionRaw}`;
      }
      // Level up
      if (result.levelupDescriptionRaw.length) {
        description += `\n\n**Level up:** ${result.levelupDescriptionRaw}`;
      }
      // Leveled up
      if (champion && champion.descriptionRaw.length && visible.description) {
        description += `\n\n**Leveled up:** ${champion.descriptionRaw}`;
      }
      // Wallpaper
      description += `\n\n[Wallpaper](https://felipe10fe.github.io/Lor-Datadragon/en_us/img/cards/${result.cardCode}-full.png)`;

      if (champion) {
        description += ` | [Wallpaper Level Up](https://felipe10fe.github.io/Lor-Datadragon/en_us/img/cards/${champion.cardCode}-full.png)`;
      }

      message.channel.send({
        embed: {
          color: parseInt(rarityColor[result.rarity], 0),
          image: { url: champion ? `https://felipe10fe.github.io/Lor-Datadragon/en_us/img/cards/${champion.cardCode}.png` : '' },
          author: {
            name: result.name,
            icon_url: `https://felipe10fe.github.io/Lor-Datadragon/en_us/img/regions/icon-${result.regionRef.toLowerCase()}.png`,
          },
          thumbnail: { url: `https://felipe10fe.github.io/Lor-Datadragon/en_us/img/cards/${result.cardCode}.png` },
          fields,
          description,
        },
      });
    }
  });
});

// Establish Connection
client.login(process.env.DISCORD_TOKEN);
