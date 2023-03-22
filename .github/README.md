<p align="center">
  <a align="center" href='https://pond.danmizu.dev/'/>
    <img src="resources/logo.svg" width="65%" alt="Logo" />
  </a>
</p>

<p align="center">
    <b>A Social Virtual World for Twitch.</b>
</p>

<p align="center">
    Written in TypeScript, using Phaser 3, Vite, Firebase, & Colyseus.
</p>

<p align="center">
    <a href="https://github.com/Dan-Mizu/Project-Virtual-Pond/issues" target="_blank">
        <img src="https://img.shields.io/github/issues/Dan-Mizu/Project-Virtual-Pond?color=red&style=for-the-badge" alt="Issues"/>
    </a>
    <a href="https://github.com/Dan-Mizu/Project-Virtual-Pond/commits" target="_blank">
        <img src="https://img.shields.io/github/last-commit/Dan-Mizu/Project-Virtual-Pond?color=darkgreen&style=for-the-badge" alt="Last Commit"/>
    </a>
</p>

<p align="center">
    <a href="https://pond.danmizu.dev/" target="_blank">
        <img src="https://img.shields.io/static/v1?label=Game&message=Production&color=green&style=for-the-badge" alt="Production"/>
    </a>
    <a href="https://pte.danmizu.dev/" target="_blank">
        <img src="https://img.shields.io/static/v1?label=Game&message=PTE&color=green&style=for-the-badge" alt="Public Test Environment"/>
    </a>
</p>

<p align="center">
    <a href="https://discord.gg/2aVq8qmcSr" target="_blank">
        <img src="https://img.shields.io/discord/975772011970306148?color=purple&label=Discord%20&logo=discord&logoColor=white&style=for-the-badge" alt="Discord">
    </a>
    <a href="https://trello.com/b/2EppX5wM/project-virtual-pond" target="_blank">
        <img src="https://img.shields.io/badge/-Trello-blue?logo=trello&style=for-the-badge" alt="Trello">
    </a>
</a>

---

<div class="row" align="center" style="text-align: center; padding-bottom: 2%;">
    <h3>Player Movement</h3>
    <img title="Player Movement" alt="Player Movement" src="resources/PlayerMovement.gif" width="50%"/>
</div>

<div class="row" align="center" style="text-align: center; padding-bottom: 2%;">
    <h3>Character Creator</h3>
    <img title="Character Creator" alt="Character Creator" src="resources/CharacterCreator.gif" width="50%"/>
</div>

<div class="row" align="center" style="text-align: center; padding-bottom: 2%;">
    <h3>Chatting</h3>
    <img title="Chatting" alt="Chatting" src="resources/Chatting.gif" width="50%"/>
</div>

<div class="row" align="center" style="text-align: center; padding-bottom: 2%;">
    <h3>NPCs</h3>
    <img title="NPCs" alt="NPCs" src="resources/NPCs.gif" width="50%"/>
</div>

---

## Longterm Goals:

-   [ ] Several Minigames both Singleplayer and Multiplayer
-   [ ] Complete Character Customization
-   [ ] Extensive Chat Features including Twitch Emotes
-   [ ] Player Housing
-   [ ] Character Progression

---

## Contribute:

There are two ways to contribute.

### Donations

I am currently working alone on this project- creating both the assets and the code. I do not have a job and am attending university, so any donations would help a ton. I could use the money to hire artists, since art is not my strong suite and I want this game to be the best it could be.

<p align="center" style="display: flex; justify-content: center; align-items: center;">
    <a href="https://www.paypal.com/paypalme/DanMizu" target="_blank" style="padding: 1%">
        <img height="60rem" src="resources/paypal-donate-button.webp" alt="Donations"/>
    </a>
</p>

### Developing

Javascript/Typescript is a relatively simple language and is very easy to develop with. This project uses the Phaser game framework which makes it really easy to use JS knowledge to make a game for the web.

1. **Install Node.js, and Visual Studio Code**

You can install Node.JS from <https://nodejs.org/en/>

The LTS is fine. It should also install npm (a package manager) as well.

Visual Studio Code is a great editor for web development and is obtained at <https://code.visualstudio.com/>

1. **Fork this Repo**

Theres a button for this at the top of this repo.

2. **Clone the forked Repo**

I personally use the Github Desktop app to clone repos attached to my profile easily.

3. **Open the Repo in Visual Studio Code and install Dependencies**

You can open the repo directly from Github Desktop into VSCode after its been cloned. You can install dependencies either by running `npm install` in the terminal embedded in VSCode or by running the Install Dependencies task.

4. **Develop**

-   server/src: Server Files
-   client/src: Game Client Files
-   client/public/assets: Game Assets
-   client/src/page/index.html: Main Page
-   client/src/index.ts: Inits the Phaser 3 Game
-   client/src/scene/Game.ts: Main Game World Scene

I recommend skimming through it all to understand how it works.

5. **Submit Changes For Review and Merging**

When you're finished implementing a new feature/mechanic, push your changes to your repo and then submit them for review. This process is detailed here: <https://github.com/firstcontributions/first-contributions>.
