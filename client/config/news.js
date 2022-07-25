const news = [
    "Alpha v0.4 - Chat Log & New Room!\n\nChanges:\n- New Theatre Room where you can watch Poke's stream with other frogs!\n- Finally implemented a Chat Log so you can see recent messages from other frogs within each room.\n- New ambient sounds for the forest and volume control in the Options menu.\n- A welcome message now shows up the first time you access the site.\n- New site icon matching the newer frog design.\n- The character creator can be accessed at any time by the button on the toolbar.\n- New Donation button on the site. Any donation helps a lot, as I am developing this alone with any time I have!\n\nFixes:\n- Several UI bugs fixed.\n- Movement-based client crash fixed.",
    "Alpha v0.3 - News, Dark Mode, & Backend Overhaul\n\nChanges:\n- New Dark Mode option on the site. It will take your OS's settings by default, but you can change it and the option you pick persists even if you leave the site.\n- SFX Volume option in the settings.\n- News Board that shows all these changes every update.\n- Loading screen when joining the game and in between scenes.\n- 1 Million Followers Banner. FeelsStrongMan Clap\n\nFixes:\n- Player direction, location, collision, and messages has been fixed so that they\'re synchronized across clients better.",
    "Alpha v0.2.3 - New Font, Interactable Object Outlines, My Player Indication\n\nChanges:\n- The entire site now has its own font.\n- Interactable objects/NPCs will now show a white outline when being hovered over.\n- Your player will now have a nametag distinguishable from other players. It will be white with a black outline, while other players will not have any outline and just a black nametag.",
    "Alpha v0.2.2 - Character Creator, Button SFX\n\nChanges:\n- There is now a Character Creator menu. Players will access it when they first log in. (You can also access it at any time by pressing the 'C' key on your keyboard)\n- UI Buttons now have a sound effect.\n- Backend changes like setting up individual rooms and a menu scene that determines if you go to the game, character creation screen, or whatever rooms we add in the future.",
    "Alpha v0.2.1 - Bug Fixes\n\nFixes:\n- You can no longer open the option menu if you already have it open.\n- Clicking on NPCs now try to check the navigational map before allowing the player to move.",
    "Alpha v0.2 - New World & Character Design, Options Menu with Music Volume Slider\n\nChanges:\n- The Character and World design has been overhauled, replacing the pixel art look.\n- New Options menu accessed by the Options button next to the chat bar. It can be dragged around the screen. It has a volume slider to change the volume of the game music. This setting persists across sessions as long as you do not clear the cookies for this site.\n- Totally new navigational map that handles where players can move.\n- Player and World depth handle what renders on top of what. You can walk around certain trees on the map but will always render behind UI/Foreground. Depending on how far up you are, you can render behind or in front of other players/npcs as well.",
    "Alpha v0.1 - Database Integration, Discord Link, Auth Fix\n\nChanges:\n- Database is now integrated. You will now see that the color you change to (Use the 'C' key) will persist between sessions.\n- A new Discord icon shows up next to the Trello and Github icons on the site, and it is probably how you got here.\n- The bug where you would get kicked out of the game \"randomly\" / would log in as a different user is now fixed... I think. I heavily tweaked the auth system to be more reliable."
]