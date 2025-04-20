const { SlashCommandBuilder, EmbedBuilder,AttachmentBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, embedLength } = require("discord.js");
const Database = require('better-sqlite3')
const ItemData = require('../../GameData/items.json')
const client = require('../../client')

module.exports = {
	data: new SlashCommandBuilder()
    .setDMPermission(false)
		.setName('거래')
		.setDescription('거래 관련 명령어')
    .addSubcommand(sub =>
      sub
      .setName('도움말')
      .setDescription('거래 시스템과 관련된 도움말을 제공합니다.')
    )
    .addSubcommand(sub =>
      sub
      .setName('요청')
      .setDescription('유저에게 거래를 요청합니다.')
      .addUserOption(option=>
        option
          .setName('유저')
          .setDescription('거래를 할 유저')
          .setRequired(true)
      )
    )
    .addSubcommand(sub =>
      sub
      .setName('아이템추가')
      .setDescription('거래 품목을 추가합니다.')
      .addStringOption(option=>
        option
          .setName('아이템')
          .setDescription('추가할 아이템 이름')
          .setRequired(true)
      )
      .addIntegerOption(option=>
        option
          .setName('수량')
          .setDescription('추가할 아이템 수량')
          .setRequired(true)
          .setMinValue(1)
      )
    )
    .addSubcommand(sub =>
      sub
      .setName('아이템제거')
      .setDescription('거래 품목을 제거합니다.')
      .addStringOption(option=>
        option
          .setName('아이템')
          .setDescription('제거할 아이템 이름')
          .setRequired(true)
      )
      .addIntegerOption(option=>
        option
          .setName('수량')
          .setDescription('제거할 아이템 수량')
          .setRequired(true)
          .setMinValue(1)
      )
    ),
  async execute(interaction){
    //서브 명령어
    const sub = interaction.options.getSubcommand()
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

    //요청
    if(sub==='요청'){
      const target = interaction.options.getUser('유저')
      const target_id = target.id
      

      // 자신이 거래 중인지 확인
      const are_you_trading = db.prepare("SELECT * FROM trade WHERE user_id=? AND server=?")
        .get(your_id,server)
      if(are_you_trading){
        db.close()
        const last_min = Math.ceil((are_you_trading.end - Date.now())/60_000)
        await interaction.reply({ephemeral:true, content:`⚠️ 당신은 이미 거래중입니다! (자동 종료까지: ${last_min}분 남음)`})
        return
      }

      // 자신에게 거래 중인지 확인
      if(your_id === target_id){
        db.close()
        await interaction.reply({ephemeral:true, content:'⚠️ 자기 자신에게 거래를 신청할 수 없습니다!'})
        return
      }

      // 대상자가 거래 중인지 확인
      const is_target_trading = db.prepare("SELECT * FROM trade WHERE user_id=? AND server=?")
        .get(target_id,server)
      if(is_target_trading){
        db.close()
        const last_min = Math.ceil((is_target_trading.end - Date.now())/60_000)
        await interaction.reply({ephemeral:true, content:`⚠️ 거래 대상이 이미 거래중입니다! (자동 종료까지: ${last_min}분 남음)`})
        return
      }

      // 대상자가 회원인지 확인
      const is_target_a_member = db.prepare("SELECT * FROM user WHERE user_id=? AND server=?")
        .get(target_id,server)
      if(!is_target_a_member){
        db.close()
        await interaction.reply({ephemeral:true, content:'⚠️ 거래 대상이 해당 서버에서 수집가로 등록되지 않았습니다.'})
        return
      }
      db.close()

      // 거래 요청
      const embed = new EmbedBuilder()
        .setTitle('💰 거래요청')
        .setColor('Blurple')
        .setTimestamp()
        .setDescription(`<@${your_id}> 님이 <@${target_id}> 님에게 거래를 요청했습니다\n수락하시려면 아래 버튼을 클릭해주세요.`)
      const row = new ActionRowBuilder()
        .addComponents(
          new ButtonBuilder()
            .setCustomId(`accept-${target_id}-${your_id}`)
            .setLabel('수락하기')
            .setEmoji('✅')
            .setStyle(ButtonStyle.Secondary)
        )
      
      await interaction.reply({embeds:[embed],components:[row]})
    }

    //아이템추가
    else if(sub==='아이템추가'){
      const item = interaction.options.getString('아이템')
      const count = interaction.options.getInteger('수량')

      //거래 여부 확인
      const is_trading = db.prepare('SELECT * FROM trade WHERE user_id=? AND server=?')
        .get(your_id,server)
      if(!is_trading){
        db.close()
        await interaction.reply({ephemeral:true, content:'⚠️ 현재 거래하고 있지 않습니다.'})
        return
      }
      
      //준비 중인지 확인
      const your_trade_data = is_trading
      if(your_trade_data.ready){
        db.close()
        await interaction.reply({ephemeral:true, content:'⚠️ 이미 거래 품목을 확정하셨습니다.'})
        return
      }

      //해당 아이템 소유 확인
      const your_item = db.prepare('SELECT * FROM inventory WHERE user_id=? AND server=? AND item=? AND count>=?')
        .get(your_id,server,item,count)
      if(!your_item){
        db.close()
        await interaction.reply({ephemeral:true, content:'⚠️ 해당 품목을 소지하고 있지 않습니다.'})
        return
      } 

      
      const your_data = JSON.parse(your_trade_data.data)

      if(item in your_data){
        your_data[item]+=count
      }else{
        your_data[item]=count
      }

      //업데이트
      db.prepare("UPDATE trade SET data=? WHERE user_id=? AND server=?")
        .run(JSON.stringify(your_data),your_id,server)
      
      //상대 데이터 불러오기
      const target_trade_data = db.prepare('SELECT * FROM trade WHERE id=? AND user_id!=?')
        .get(your_trade_data.id,your_id)

      db.close()
      
      const traders_id = [0,0]
      const traders_data = [0,0]
      const traders_ready = [0,0]

      traders_id[your_trade_data.seq] = your_id
      traders_id[target_trade_data.seq] = target_trade_data.user_id

      traders_data[your_trade_data.seq] = your_data
      traders_data[target_trade_data.seq] = JSON.parse(target_trade_data.data)

      traders_ready[your_trade_data.seq] = your_trade_data.ready
      traders_ready[target_trade_data.seq] = target_trade_data.ready

      const embed = await trade_ui(...traders_id,...traders_data,...traders_ready,your_trade_data.end)
      const trade_channel = await client.channels.fetch(your_trade_data.channel)
      const trade_message = await trade_channel.messages.fetch(your_trade_data.id)

      await trade_message.edit({ embeds:[embed] })
      await interaction.reply({ephemeral:true,content:`➕ ${item} ${count}개가 추가되었습니다.`})
    }

    //아이템제거
    else if(sub==='아이템제거'){
      const item = interaction.options.getString('아이템')
      const count = interaction.options.getInteger('수량')

      //거래 여부 확인
      const is_trading = db.prepare('SELECT * FROM trade WHERE user_id=? AND server=?')
        .get(your_id,server)
      if(!is_trading){
        db.close()
        await interaction.reply({ephemeral:true, content:'⚠️ 현재 거래하고 있지 않습니다.'})
        return
      }

      //준비 중인지 확인
      const your_trade_data = is_trading
      if(your_trade_data.ready){
        db.close()
        await interaction.reply({ephemeral:true, content:'⚠️ 이미 거래 품목을 확정하셨습니다.'})
        return
      }
      
      const your_data = JSON.parse(your_trade_data.data)

      //거래품목에 존재여부 확인
      if(!(item in your_data)){
        db.close()
        await interaction.reply({ephemeral:true, content:'⚠️ 해당 아이템은 거래품목에 포함되어 있지 않습니다.'})
        return
      }

      //아이템 제거
      your_data[item]-=count
      if(your_data[item]<=0) delete your_data[item]

      //업데이트
      db.prepare("UPDATE trade SET data=? WHERE user_id=? AND server=?")
        .run(JSON.stringify(your_data),your_id,server)
      
      //상대 데이터 불러오기
      const target_trade_data = db.prepare('SELECT * FROM trade WHERE id=? AND user_id!=?')
        .get(your_trade_data.id,your_id)
        
      db.close()
      
      const traders_id = [0,0]
      const traders_data = [0,0]
      const traders_ready = [0,0]

      traders_id[your_trade_data.seq] = your_id
      traders_id[target_trade_data.seq] = target_trade_data.user_id

      traders_data[your_trade_data.seq] = your_data
      traders_data[target_trade_data.seq] = JSON.parse(target_trade_data.data)

      traders_ready[your_trade_data.seq] = your_trade_data.ready
      traders_ready[target_trade_data.seq] = target_trade_data.ready

      const embed = await trade_ui(...traders_id,...traders_data,...traders_ready,your_trade_data.end)
      const trade_channel = await client.channels.fetch(your_trade_data.channel)
      const trade_message = await trade_channel.messages.fetch(your_trade_data.id)

      await trade_message.edit({ embeds:[embed] })
      await interaction.reply({ephemeral:true,content:`➖ ${item} ${count}개가 제거되었습니다.`})
    }

    //도움말
    else if(sub==='도움말'){
      const embed = new EmbedBuilder()
        .setTitle('💰 거래 도움말')
        .setDescription('거래 진행 방식에 대한 도움말입니다.')
        .setColor('Blurple')
        .addFields(
          {name:'1단계',value:'`/거래 요청` 명령어를 통해 상태방에게 거래를 요청합니다.'},
          {name:'2단계',value:'`/거래 아이템추가` 또는 `/거래 아이템제거` 명령어를 통해 거래 품목을 정합니다.'},
          {name:'3단계',value:'거래 품목 결정이 완료되면 준비 버튼을 눌러, 거래 품목을 확정합니다.'},
          {name:'4단계',value:'상대방의 거래품목을 확인하고, 승인 버튼을 눌러 거래 품목을 교환합니다.'}
        )
      await interaction.reply({embeds:[embed]})
    }
    
  }
}