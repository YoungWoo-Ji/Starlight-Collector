const { EmbedBuilder,ActionRowBuilder,ButtonBuilder, ButtonStyle } = require('discord.js')
const Database = require('better-sqlite3')
const client = require('../../client')

module.exports = {
  name:"confirm_trade",
  async execute(interaction){

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
        })}`+` (${Math.ceil((end-Date.now())/60_000)}분 남음)\n`+
        '\n**거래 품목이 확정되었습니다.**\n**거래를 진행하시려면 승인 버튼을 눌러주세요.**\n'
      )
      .setTimestamp()
      .addFields(
        {name:t1.displayName+` (승인:${t1_ready===2?'✅':'☑️'})`, value:'```\n'+(Object.keys(t1_data).length===0?'거래 품목이 없습니다':Object.keys(t1_data).map(e=>`${e} x ${t1_data[e]}개`).join('\n'))+'\n```'},
        {name:t2.displayName+` (승인:${t2_ready===2?'✅':'☑️'})`, value:'```\n'+(Object.keys(t2_data).length===0?'거래 품목이 없습니다':Object.keys(t2_data).map(e=>`${e} x ${t2_data[e]}개`).join('\n'))+'\n```'}
      )
      return embed
    }

    //db
    const db = new Database('DB/user.db')
    const server = interaction.guildId
    const your_id = interaction.user.id

    const your_trade_data = db.prepare('SELECT * FROM trade WHERE user_id=? AND server=?')
      .get(your_id,server)

    //거래중인지 확인
    if(!your_trade_data){
      db.close()
      await interaction.reply({ephemeral:true, content:'⚠️ 현재 거래하고 있지 않습니다.'})
      return
    }

    //이미 승인했는지 확인
    if(your_trade_data.ready===2){
      db.close()
      await interaction.deferUpdate()
      return
    }

    //업데이트
    db.prepare('UPDATE trade SET ready=? WHERE user_id=? AND server=?')
      .run(2,your_id,server)

    //상대 데이터 불러오기
    const target_trade_data = db.prepare('SELECT * FROM trade WHERE id=? AND user_id!=?')
      .get(your_trade_data.id,your_id)

    //임베드 관련 데이터
    const traders_id = [0,0]
    const traders_data = [0,0]
    const traders_ready = [0,0]

    traders_id[your_trade_data.seq] = your_id
    traders_id[target_trade_data.seq] = target_trade_data.user_id

    traders_data[your_trade_data.seq] = JSON.parse(your_trade_data.data)
    traders_data[target_trade_data.seq] = JSON.parse(target_trade_data.data)

    traders_ready[your_trade_data.seq] = 2
    traders_ready[target_trade_data.seq] = target_trade_data.ready

    //한쪽만 준비 완료
    if(target_trade_data.ready!==2){
      db.close()
      const embed = await trade_ui(...traders_id,...traders_data,...traders_ready,your_trade_data.end)
      const trade_channel = await client.channels.fetch(your_trade_data.channel)
      const trade_message = await trade_channel.messages.fetch(your_trade_data.id)

      await trade_message.edit({ embeds:[embed] })
      await interaction.deferUpdate()
    
    //양쪽 준비 완료
    }else{

      //본인 아이템 확인
      const your_data = JSON.parse(your_trade_data.data)
      const your_not_approved = []
      const find_your_item = db.prepare("SELECT * FROM inventory WHERE user_id=? AND server=? AND item=? AND count>=?")
      for(const item of Object.keys(your_data)){
        const is_exist = find_your_item.get(your_id,server,item,your_data[item])
        if(!is_exist) your_not_approved.push(item)      
      }

      //상대 아이템 확인
      const target_data = JSON.parse(target_trade_data.data)
      const target_not_approved = []
      for(const item of Object.keys(target_data)){
        const is_exist = find_your_item.get(target_trade_data.user_id,server,item,target_data[item])
        if(!is_exist) target_not_approved.push(item)      
      }

      //승인 불가
      const trade_channel = await client.channels.fetch(your_trade_data.channel)
      const trade_message = await trade_channel.messages.fetch(your_trade_data.id)
      if(your_not_approved.length+target_not_approved.length>0){
        //거래 데이터 삭제
        db.prepare('DELETE FROM trade WHERE id=?').run(your_trade_data.id)
        db.close()
        const traders_wrong_items = [0,0]
        traders_wrong_items[your_trade_data.seq] = your_not_approved
        traders_wrong_items[target_trade_data.seq] = target_not_approved
        const t1 = await interaction.guild.members.fetch(traders_id[0])
        const t2 = await interaction.guild.members.fetch(traders_id[1])
        const embed = new EmbedBuilder()
          .setTitle('❌ 거래 취소됨')
          .setColor('Blurple')
          .setDescription('소지하고 있지 않거나, 개수를 초과하는 아이템이 거래 품목에 올라와 있습니다.')
          .addFields(
            {name:t1.displayName, value:'```\n'+(traders_wrong_items[0].length===0?'해당 사항이 없습니다':traders_wrong_items[0].join(','))+'\n```'},
            {name:t2.displayName, value:'```\n'+(traders_wrong_items[1].length===0?'해당 사항이 없습니다':traders_wrong_items[1].join(','))+'\n```'}
          )
        await trade_message.edit({embeds:[embed],components:[]})
        await interaction.deferUpdate()
      }

      //승인
      else{
        //아이템 제거
        const delete_item = db.prepare('UPDATE inventory SET count = count-? WHERE user_id=? AND server=? AND item=?')
        for(const item of Object.keys(your_data)){
          delete_item.run(your_data[item],your_id,server,item)
        }
        for(const item of Object.keys(target_data)){
          delete_item.run(target_data[item],target_trade_data.user_id,server,item)
        }
        db.prepare('DELETE FROM inventory WHERE count=?')
          .run(0)

        //아이템 추가
        const add_new_item = db.prepare('INSERT INTO inventory (user_id,server,item,count) VALUES (?,?,?,?)')
        const add_item = db.prepare('UPDATE inventory SET count = count + ? WHERE user_id=? AND server=? AND item=?')
        const find_item = db.prepare('SELECT * FROM inventory WHERE user_id=? AND server=? AND item=?')
        for(const item of Object.keys(target_data)){
          if(!find_item.get(your_id,server,item)){
            add_new_item.run(your_id,server,item,target_data[item])
          }else{
            add_item.run(target_data[item],your_id,server,item)
          }
        }
        for(const item of Object.keys(your_data)){
          if(!find_item.get(target_trade_data.user_id,server,item)){
            add_new_item.run(target_trade_data.user_id,server,item,your_data[item])
          }else{
            add_item.run(your_data[item],target_trade_data.id,server,item)
          }
        }

        //거래 데이터 삭제
        db.prepare('DELETE FROM trade WHERE id=?').run(your_trade_data.id)
        db.close()
        //거래 완료 임베드
        const t1 = await interaction.guild.members.fetch(traders_id[0])
        const t2 = await interaction.guild.members.fetch(traders_id[1])
        const embed = new EmbedBuilder()
          .setColor('Blurple')
          .setTitle('💰 거래 완료!')
          .setDescription('거래가 완료되었습니다. 거래내역을 확인하세요!\n')
          .addFields(
            {name:t1.displayName,value:'```\n'+
              Object.keys(traders_data[0]).map(e=>`- ${e} x ${traders_data[0][e]}`).join('\n')+
              Object.keys(traders_data[1]).map(e=>`+ ${e} x ${traders_data[1][e]}`).join('\n')
              +'\n```'},
            {name:t2.displayName, value:'```\n'+
              Object.keys(traders_data[1]).map(e=>`- ${e} x ${traders_data[1][e]}`).join('\n')+
              Object.keys(traders_data[0]).map(e=>`+ ${e} x ${traders_data[0][e]}`).join('\n')
              +'\n```'}
          )
        const trade_channel = await client.channels.fetch(your_trade_data.channel)
        const trade_message = await trade_channel.messages.fetch(your_trade_data.id)
        await trade_message.edit({embeds:[embed],components:[]})
        await interaction.deferUpdate()
      }

    }
  }
}