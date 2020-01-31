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

  words.forEach((word) => {
    const result = configs.find(
      (config) => config.name.toLowerCase() === word.toLowerCase()
      && config.collectible === true,
    );

    if (result) {
      const champion = configs.find(
        (config) => config.name.toLowerCase() === word.toLowerCase()
        && config.collectible === false,
      );

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
      description += `**Cost:** ${result.cost}`;
      description += `\n**Region:** ${result.region}`;
      if (result.keywords.length) {
        description += `\n**Keywords:** ${result.keywords.join(', ')}`;
      }
      if (result.descriptionRaw.length) {
        description += `\n\n${result.descriptionRaw}`;
      }

      // Champion
      if (champion && champion.levelupDescriptionRaw.length) {
        description += `\n\n**Level up:** ${champion.levelupDescriptionRaw}`;
      }
      if (champion && champion.keywords.length) {
        description += `\n**Keywords Level Up:** ${champion.keywords.join(', ')}`;
      }
      if (champion && champion.descriptionRaw.length) {
        description += `\n\n${champion.descriptionRaw}`;
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
