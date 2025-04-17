const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require("discord.js");
const { exec } = require('child_process')

module.exports = {
  data: new SlashCommandBuilder()
    .setName('동기화')
    .setDescription('깃허브 저장소와 코드를 동기화합니다.')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
  onlyGuild:true,
  async execute(interaction){
    await interaction.deferReply(); // 긴 작업이니까 일단 응답 예약

    exec('git pull', (error, stdout, stderr) => {
      if (error) {
        interaction.editReply(`❌ 오류 발생:\n\`\`\`\n${error.message}\n\`\`\``);
        return;
      }

      if (stderr) {
        interaction.editReply(`⚠️ 경고:\n\`\`\`\n${stderr}\n\`\`\``);
        return;
      }
      const embed = new EmbedBuilder()
        .setTitle('✅ pull 완료')
        .setDescription(`\n\`\`\`\n${stdout}\n\`\`\``)
        .setColor('Blurple')
        .setTimestamp()
      interaction.editReply({embeds:[embed]});
    })

    
  }
}