const {clientId} = require('../../config.json')

module.exports= {
  name:'서버수갱신',
  async execute(interaction){
    const servers = interaction.client.guilds.cache
    const url = `https://koreanbots.dev/api/v2/bots/${clientId}/stats`
    
    await interaction.deferReply({ephemeral:true})
    
    const res = await fetch(url,{
      method:'POST',
      headers:{
        "Authorization":'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjEyODU1ODEwNTA3MzA1MTI0NDUiLCJpYXQiOjE3MjY2Mjk3NDB9.IcFWA20xlx7LyT6o4L39wzc7a5-y9unhO1FIrkJOKScWRCXaDDD4b5XsIwZ7bb4srdzvMaNUP6RXYL3Pw1W7FsGiQd0dfWphk8Nco7dqHq32rv2Y5H1aJF9idO2l2cjsi3MFn1CC3hLeK_hsGBdsFUcyHKv93B58Va7zkbw2uYo',
        'Content-Type': "application/json"
      },
      body: JSON.stringify({
        "servers":servers.size,
        "shards":1
      })
    })

    

    if(res.status===200){
      await interaction.followUp({content:'✅ 성공적으로 업데이트 되었습니다!',ephemeral:true})
    }else if(res.status===429){
      await interaction.followUp({content:'⛔ 업데이트할 수 없습니다. 잠시 후 다시 시도해주세요.',ephemeral:true})
    }
  }
}