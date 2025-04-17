const { SlashCommandBuilder, EmbedBuilder,ActionRowBuilder,ButtonBuilder,ButtonStyle } = require("discord.js");

module.exports = {
	data: new SlashCommandBuilder()
		.setName('상점')
		.setDescription('다양한 물품을 구매하고 교환합니다.')
    .setDMPermission(false),
	async execute(interaction) {
    const embed = new EmbedBuilder()
      .setTitle('💰 상점')
      .setColor('Blurple')
      .setDescription('거래 가능한 품목입니다\n\n```\n'+
        '1️⃣ 돌 조각 - 무료\n'+
        '2️⃣ 하급원석 - 보석 조각 x 5\n'+
        '3️⃣ 중급원석 - 하급원석 x 10\n'+
        '4️⃣ 상급원석 - 중급원석 x 10\n```'
      )
    const row = new ActionRowBuilder()
      .addComponents(
        new ButtonBuilder()
          .setCustomId('trade1')
          .setEmoji('1️⃣')
          .setStyle(ButtonStyle.Secondary)
          .setLabel('번'),
        new ButtonBuilder()
          .setCustomId('trade2')
          .setEmoji('2️⃣')
          .setStyle(ButtonStyle.Secondary)
          .setLabel('번'),
        new ButtonBuilder()
          .setCustomId('trade3')
          .setEmoji('3️⃣')
          .setStyle(ButtonStyle.Secondary)
          .setLabel('번'),
        new ButtonBuilder()
          .setCustomId('trade4')
          .setEmoji('4️⃣')
          .setStyle(ButtonStyle.Secondary)
          .setLabel('번')
      )
    await interaction.reply({embeds:[embed],components:[row]})
  }
}