const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require("discord.js");
const { exec } = require('child_process')

module.exports = {
  data: new SlashCommandBuilder()
    .setName('명령어배포')
    .setDescription('슬래쉬 커맨드를 배포합니다.')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
  onlyGuild:true,
  async execute(interaction){
    
    await interaction.reply({embeds:[
      new EmbedBuilder().setColor('Blurple').setTitle('📤 슬래시 커맨드를 배포하는 중입니다...')
    ]});

    exec('node deploy-commands.js', (error, stdout, stderr) => {
      if (error) {
        console.error(`에러 발생: ${error.message}`);
        return interaction.followUp(`에러가 발생했습니다: ${error.message}`);
      }
      if (stderr) {
        console.error(`stderr: ${stderr}`);
        return interaction.followUp(`stderr: ${stderr}`);
      }
      console.log(`stdout: ${stdout}`);

      interaction.editReply({embeds:[
        new EmbedBuilder().setColor('Blurple').setTitle('✅ 슬래시 커맨드가 성공적으로 배포되었습니다!')
        .setDescription(`\`\`\`\n${stdout}\n\`\`\``)
      ]})
    });

    
  }
}