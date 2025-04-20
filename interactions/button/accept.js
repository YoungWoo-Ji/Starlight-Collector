const { EmbedBuilder,ActionRowBuilder,ButtonBuilder, ButtonStyle } = require('discord.js')
const Database = require('better-sqlite3')
module.exports = {
  name:"accept",
  async execute(interaction){

    const customId = interaction.customId
    const target_id = interaction.user.id
    const your_id = customId.split('-')[2]
    const server = interaction.guildId
    const channel = interaction.channelId    

    const now = Date.now()
    const end = now + 600_000
    const end_date = new Date(end)

    const you = await interaction.guild.members.fetch(your_id)
    const target = await interaction.guild.members.fetch(target_id)

    const db = new Database('DB/user.db')
    const insert_trade_data = db.prepare('INSERT INTO trade (id,user_id,server,channel,end,seq) VALUES (?,?,?,?,?,?)')
    const tradeId = interaction.message.id
    insert_trade_data.run(tradeId,your_id,server,channel,end,0)
    insert_trade_data.run(tradeId,target_id,server,channel,end,1)
    db.close()

    //타임아웃 10분
    setTimeout(async () => {
      const db = new Database('DB/user.db')
      const trade = db.prepare('SELECT * FROM trade WHERE id=?').all(tradeId)
      if(trade.length===0) return
      db.prepare('DELETE FROM trade WHERE id = ?').run(tradeId)
      await interaction.followUp({embeds:[
        new EmbedBuilder()
          .setTitle('❌ 거래 만료')
          .setColor('Blurple')
          .setTimestamp()
          .setDescription(`<@${your_id}>, <@${target_id}> 의 거래가 10분이 지나 만료되었습니다\n`+
            '거래를 다시 시작하려면 `/거래 요청` 명령어를 다시 사용해주세요.')
      ]})
      db.close()
    }, end-Date.now());
    

    const embed = new EmbedBuilder()
      .setColor('Blurple')
      .setTitle('💰 유저거래')
      .setDescription(
        `거래자: <@${your_id}>, <@${target_id}>\n`+
        `거래 자동 만료: ${end_date.toLocaleTimeString('ko-KR', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: false,
          timeZone: 'Asia/Seoul'
        })}`+' (10분 남음)\n\n'
      )
      .setTimestamp()
      .addFields(
        {name:you.displayName+' (준비:☑️)', value:'```\n'+'거래 품목이 없습니다'+'\n```'},
        {name:target.displayName+' (준비:☑️)', value:'```\n'+'거래 품목이 없습니다'+'\n```'}
      )
      
      const row = new ActionRowBuilder()
        .addComponents(
          new ButtonBuilder()
            .setLabel('준비')
            .setCustomId('ready')
            .setEmoji('✅')
            .setStyle(ButtonStyle.Secondary),
          new ButtonBuilder()
            .setLabel('취소')
            .setCustomId('cancel_trade')
            .setEmoji('❌')
            .setStyle(ButtonStyle.Secondary)
        )

    await interaction.update({embeds:[embed],components:[row]})
  }
}