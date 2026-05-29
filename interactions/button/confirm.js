const { EmbedBuilder } = require('discord.js')
const Database = require('better-sqlite3')
module.exports = {
  name:"confirm",
  async execute(interaction){
    const db = new Database('DB/user.db')
    const find = db.prepare('SELECT * FROM user WHERE user_id=? AND server=?')
    const user = find.get(interaction.user.id,interaction.guildId)

    //동일 회원 존재여부 확인
    if (!user){
      db.close()
      await interaction.reply({ephemeral:true,content:'⚠️ 등록되어있지 않습니다.'})
      return
    }

    //user에서 삭제
    db.prepare('DELETE FROM user WHERE user_id=? AND server=?')
      .run(interaction.user.id,interaction.guildId)
    //inventory에서 삭제 
    db.prepare('DELETE FROM inventory WHERE user_id=? AND server=?')
      .run(interaction.user.id,interaction.guildId)
    //break에서 삭제
    db.prepare('DELETE FROM break WHERE user_id=? AND server=?')
      .run(interaction.user.id,interaction.guildId)
    //dex에서 삭제
    db.prepare('DELETE FROM dex WHERE user_id=? AND server=?')
      .run(interaction.user.id,interaction.guildId)
    //reward에서 삭제
    db.prepare('DELETE FROM reward WHERE user_id=? AND server=?')
      .run(interaction.user.id,interaction.guildId)

    db.close()

    const embed = new EmbedBuilder()
      .setColor('Blurple')
      .setTitle('탈퇴가 완료되었습니다.')
      .setDescription('그동안 별빛 수집가를 이용해 주셔서 감사합니다.')

    await interaction.update({embeds:[embed],components:[]})
  }
}
