const { EmbedBuilder,ActionRowBuilder,ButtonBuilder, ButtonStyle } = require('discord.js')
const Database = require('better-sqlite3')
const client = require('../../client')

module.exports = {
  name:"ready",
  async execute(interaction){
    //db
    const db = new Database('DB/user.db')
    const server = interaction.guildId
    const your_id = interaction.user.id

    //거래 창
    async function trade_ui(t1_id,t2_id,t1_data,t2_data,t1_ready,t2_ready,end){
      const end_date = new Date(end)
      const t1 = await interaction.guild.members.fetch(t1_id)
      const t2 = await interaction.guild.members.fetch(t2_id)
      const embed = new EmbedBuilder()
      .setColor('Blurple')
      .setTitle('💰 유저거래')
      .setDescription(
        `거래자: <@${t1_id}>, <@${t2_id}>\n`+
        `거래 자동 만료: ${end_date.toLocaleTimeString('ko-KR', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: false,
          timeZone: 'Asia/Seoul'
        })}`+` (${Math.ceil((end-Date.now())/60_000)}분 남음)\n\n`
      )
      .setTimestamp()
      .addFields(
        {name:t1.displayName+` (준비:${t1_ready?'✅':'☑️'})`, value:'```\n'+(Object.keys(t1_data).length===0?'거래 품목이 없습니다':Object.keys(t1_data).map(e=>`${e} x ${t1_data[e]}개`).join('\n'))+'\n```'},
        {name:t2.displayName+` (준비:${t2_ready?'✅':'☑️'})`, value:'```\n'+(Object.keys(t2_data).length===0?'거래 품목이 없습니다':Object.keys(t2_data).map(e=>`${e} x ${t2_data[e]}개`).join('\n'))+'\n```'}
      )
      return embed
    } 


    const your_trade_data = db.prepare('SELECT * FROM trade WHERE user_id=? AND server=?')
      .get(your_id,server)

    //거래중인지 확인
    if(!your_trade_data){
      db.close()
      await interaction.reply({ephemeral:true, content:'⚠️ 현재 거래하고 있지 않습니다.'})
      return
    }

    //이미 준비했는지 확인
    if(your_trade_data.ready===1){
      db.close()
      await interaction.deferUpdate()
      return
    }

    const your_data = JSON.parse(your_trade_data.data)
    const not_approved = []
    const find_your_item = db.prepare("SELECT * FROM inventory WHERE user_id=? AND server=? AND item=? AND count>=?")

    for(const item of Object.keys(your_data)){
      const is_exist = find_your_item.get(your_id,server,item,your_data[item])
      if(!is_exist) not_approved.push(item)      
    }

    //준비 승인 불가
    if(not_approved.length>0){
      db.close()
      await interaction.reply({ephemeral:true,content:'⚠️ 거래 품목 중 소지하지 않거나, 개수를 초과한 품목이 있습니다\n'
        +`해당 품목: ${not_approved.join(', ')}`
      })
      return
    }
  
    //업데이트
    db.prepare('UPDATE trade SET ready=? WHERE user_id=? AND server=?')
      .run(1,your_id,server)

    //상대 데이터 불러오기
    const target_trade_data = db.prepare('SELECT * FROM trade WHERE id=? AND user_id!=?')
      .get(your_trade_data.id,your_id)
    
    db.close()

    //임베드 관련 데이터
    const traders_id = [0,0]
    const traders_data = [0,0]
    const traders_ready = [0,0]

    traders_id[your_trade_data.seq] = your_id
    traders_id[target_trade_data.seq] = target_trade_data.user_id

    traders_data[your_trade_data.seq] = JSON.parse(your_trade_data.data)
    traders_data[target_trade_data.seq] = JSON.parse(target_trade_data.data)

    traders_ready[your_trade_data.seq] = 1
    traders_ready[target_trade_data.seq] = target_trade_data.ready
    
    //한쪽만 준비 완료
    if(target_trade_data.ready===0){
      
      const embed = await trade_ui(...traders_id,...traders_data,...traders_ready,your_trade_data.end)
      const trade_channel = await client.channels.fetch(your_trade_data.channel)
      const trade_message = await trade_channel.messages.fetch(your_trade_data.id)

      await trade_message.edit({ embeds:[embed] })
      await interaction.deferUpdate()
    
    //양쪽 준비 완료
    }else{
      const embed = await
      (async function trade_ui(t1_id,t2_id,t1_data,t2_data,end){
        const end_date = new Date(end)
        const t1 = await interaction.guild.members.fetch(t1_id)
        const t2 = await interaction.guild.members.fetch(t2_id)
        const embed = new EmbedBuilder()
        .setColor('Blurple')
        .setTitle('💰 유저거래')
        .setDescription(
          `거래자: <@${t1_id}>, <@${t2_id}>\n`+
          `거래 자동 만료: ${end_date.toLocaleTimeString('ko-KR', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: false,
            timeZone: 'Asia/Seoul'
          })}`+` (${Math.ceil((end-Date.now())/60_000)}분 남음)\n`+
          '\n**거래 품목이 확정되었습니다.**\n**거래를 진행하시려면 승인 버튼을 눌러주세요.**\n'
        )
        .setTimestamp()
        .addFields(
          {name:t1.displayName+` (승인:☑️)`, value:'```\n'+(Object.keys(t1_data).length===0?'거래 품목이 없습니다':Object.keys(t1_data).map(e=>`${e} x ${t1_data[e]}개`).join('\n'))+'\n```'},
          {name:t2.displayName+` (승인:☑️)`, value:'```\n'+(Object.keys(t2_data).length===0?'거래 품목이 없습니다':Object.keys(t2_data).map(e=>`${e} x ${t2_data[e]}개`).join('\n'))+'\n```'}
        )
        return embed
      })(...traders_id,...traders_data,your_trade_data.end)

      const trade_channel = await client.channels.fetch(your_trade_data.channel)
      const trade_message = await trade_channel.messages.fetch(your_trade_data.id)

      const row = new ActionRowBuilder()
        .addComponents(
          new ButtonBuilder()
            .setLabel('승인')
            .setCustomId('confirm_trade')
            .setEmoji('✅')
            .setStyle(ButtonStyle.Secondary),
          new ButtonBuilder()
            .setLabel('취소')
            .setCustomId('cancel_trade')
            .setEmoji('❌')
            .setStyle(ButtonStyle.Secondary)
        )

      await trade_message.edit({ embeds:[embed], components:[row] })
      await interaction.deferUpdate()
    }
  }
}