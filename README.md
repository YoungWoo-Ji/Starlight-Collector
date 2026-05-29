# 🌟 별빛 수집가

> 미니게임과 서버 활성화를 동시에! 채팅을 치며 다양한 보석을 모아보세요.

---

## 주요 기능 
* **보석 수집 게임**: 지루한 채팅 레벨 대신 채팅 횟수로 보석을 수집하는 신개념 채팅 게임.
* **부스트 채널 지정**: 활성화를 원하는 특정 채널에 게임 부스트 설정 가능.
* **최신 Discord.js v14 사용**: Slash Commands 및 다수의 인터랙션 지원.
---

## 시작하기

### 요구 사항
* [Node.js](https://nodejs.org/) v16.11.0 이상
* [Discord Developer Portal](https://discord.com/developers/applications)에서 발급받은 봇 토큰
* [한국 디스코드 리스트](https://koreanbots.dev)에서 발급받은 봇 토큰 (선택)

### 설치 방법

1. **저장소 복제**
   ```bash
   git clone https://github.com/YoungWoo-Ji/Starlight-Collector.git
   ```
2. **패키지 설치**
   ```bash
   npm install
   ```
3. **환경 변수 설정**
  <br>**config-example.json**을 **config.json**으로 파일명을 변경해주시고, 파일의 내용을 채워주세요.
  <br><sub>i) **서버 아이디**는 관리자 명령어를 사용할 서버의 아이디를 입력해주세요. 일부 명령어는 관리자 서버에서 관리자 권한을 가지고 있는 유저만 사용 가능합니다. (/재시작, /동기화, /서버 등)</sub>
  <br><sub>ii) **한국 디스코드 리스트 토큰**은 입력하지 않아도 됩니다. 다만, 한국 디스코드 리스트 api를 사용하는 일부 기능을 사용하지 못할 수 있습니다. (/하트보상, /서버)

4. **DB 설정**
  <br>**DB/user-example.db**를 **DB/user.db**로 파일명을 변경해주세요.

5. **커맨드 등록**
   ```bash
   node deploy-commands.js
   ```
6. **봇 실행**
   ```bash
   pm2 start index.js --name bot
   ```
