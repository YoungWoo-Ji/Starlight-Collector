const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require("discord.js");
const { exec } = require('child_process')

module.exports = {
  data: new SlashCommandBuilder()
    .setName('재시작')
    .setDescription('봇을 재시작합니다.')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
  onlyGuild:true,
  async execute(interaction){
    await interaction.reply({embeds:[
      new EmbedBuilder()
        .setColor('Blurple')
        .setTitle('♻️ 봇을 재시작 중입니다...')
    ]});

    exec('pm2 restart bot', (error, stdout, stderr) => {
      if (error) {
        console.error(`에러 발생: ${error.message}`);
        return;
      }
      if (stderr) {
        console.error(`stderr: ${stderr}`);
        return;
      }
      console.log(`stdout: ${stdout}`);
    })

  }
}