// Game Config

class GameConfig {
    //version of the welcome message. resends to all players on join when changed.
    static welcomeMessageVersion = 3;

    //current news
    static news = [
        "Alpha v0.5.3 - Winter Wonderland\n\nChanges:\n- Snow is falling!\n- Max player limit of 100 players is now in effect.\n- Sponsors  (those who donated $4.20 or more) and VIPs (such as streamers) now have some perks like a colored name and bypassing the player limit.\n- A developer API has been implemented letting third party interface developers access information like the current player count, current players online, as well as some limited player information like what a Frog is wearing or what they own. Please reach out on Discord if you'd like to learn more!\n- MP3 files have been converted to OGG to save on bandwidth.\n\nFixes:\n- Audio now loops correctly instead of ending after the second playback.\n- Authentication errors should no longer halt the server.",
        // 'Alpha v0.5.1 - Happy Halloween!\n\nChanges:\n - Halloween Event! Get a free Carved Pumpkin Hat in the forest while the event lasts.\n - New profanity filter being tested.\n - UI changes to match rest of the games art style.\n\nFixes:\n- A ton of background changes to the server and client! Check the Trello for more information.',
        // "Alpha v0.5 - Happy Birthday Poke!\n\nChanges:\n - Birthday Event! Get a free Birthday Hat in the forest while the event lasts.\n - Simple accessories mechanic implemented. Frogs can now wear things.\n - New eye types! Now you can be a sad or happy frog.\n - A lot of stats are now collected about your frog. like when you first joined, when the last time you played was, your overall playtime etc. This will eventually be shown on your profile (when that's implemented.)\n - There is now a log-out button in the options menu. finally?\n - Character creator got a visual update.\n - There is now a prompt on mobile to rotate your device when you play- also mobile touch input is now recognized!\n - Fullscreen mode button.\n - A TON of backend stuff that's too boring and long to talk about here.\n\nFixes:\n- Chat messages no longer persist when changing rooms.\n- Fixed a server crash issue. I'm sure a new one will pop up though.\n- Some other small things here and there.",
        // "Alpha v0.4 - Chat Log & New Room!\n\nChanges:\n- New Theatre Room where you can watch Poke's stream with other frogs!\n- Finally implemented a Chat Log so you can see recent messages from other frogs within each room.\n- New ambient sounds for the forest and volume control in the Options menu.\n- A welcome message now shows up the first time you access the site.\n- New site icon matching the newer frog design.\n- The character creator can be accessed at any time by the button on the toolbar.\n- New Donation button on the site. Any donation helps a lot, as I am developing this alone with any time I have!\n\nFixes:\n- Several UI bugs fixed.\n- Movement-based client crash fixed.",
        // "Alpha v0.3 - News, Dark Mode, & Backend Overhaul\n\nChanges:\n- New Dark Mode option on the site. It will take your OS's settings by default, but you can change it and the option you pick persists even if you leave the site.\n- SFX Volume option in the settings.\n- News Board that shows all these changes every update.\n- Loading screen when joining the game and in between scenes.\n- 1 Million Followers Banner. FeelsStrongMan Clap\n\nFixes:\n- Player direction, location, collision, and messages has been fixed so that they\'re synchronized across clients better.",
        // "Alpha v0.2.3 - New Font, Interactable Object Outlines, My Player Indication\n\nChanges:\n- The entire site now has its own font.\n- Interactable objects/NPCs will now show a white outline when being hovered over.\n- Your player will now have a nametag distinguishable from other players. It will be white with a black outline, while other players will not have any outline and just a black nametag.",
        // "Alpha v0.2.2 - Character Creator, Button SFX\n\nChanges:\n- There is now a Character Creator menu. Players will access it when they first log in. (You can also access it at any time by pressing the 'C' key on your keyboard)\n- UI Buttons now have a sound effect.\n- Backend changes like setting up individual rooms and a menu scene that determines if you go to the game, character creation screen, or whatever rooms we add in the future.",
        // "Alpha v0.2.1 - Bug Fixes\n\nFixes:\n- You can no longer open the option menu if you already have it open.\n- Clicking on NPCs now try to check the navigational map before allowing the player to move.",
        // "Alpha v0.2 - New World & Character Design, Options Menu with Music Volume Slider\n\nChanges:\n- The Character and World design has been overhauled, replacing the pixel art look.\n- New Options menu accessed by the Options button next to the chat bar. It can be dragged around the screen. It has a volume slider to change the volume of the game music. This setting persists across sessions as long as you do not clear the cookies for this site.\n- Totally new navigational map that handles where players can move.\n- Player and World depth handle what renders on top of what. You can walk around certain trees on the map but will always render behind UI/Foreground. Depending on how far up you are, you can render behind or in front of other players/npcs as well.",
        // "Alpha v0.1 - Database Integration, Discord Link, Auth Fix\n\nChanges:\n- Database is now integrated. You will now see that the color you change to (Use the 'C' key) will persist between sessions.\n- A new Discord icon shows up next to the Trello and Github icons on the site, and it is probably how you got here.\n- The bug where you would get kicked out of the game \"randomly\" / would log in as a different user is now fixed... I think. I heavily tweaked the auth system to be more reliable."
    ];

    //location of donation site
    static donationSite = 'https://streamelements.com/danmizu-2547/tip';

    //preload room data
    static preloadRoom(game, room, event) {
        //get current events
        let currentEvents = globalData.currentEvents;

        //Forest Room
        if (room === 'forest') {
            //textures
            event.texture
                .add('Forest_Background', 'room/forest/layers/Background.png')
                .in(game);
            event.texture
                .add('Forest_Ground', 'room/forest/layers/Ground.png')
                .in(game);
            event.texture
                .add('Theatre_Sign', 'room/forest/layers/Theatre_Sign.png')
                .in(game);
            event.texture
                .add('Forest_Tree_3', 'room/forest/layers/Tree_3.png')
                .in(game);
            event.texture
                .add('Forest_Tree_2', 'room/forest/layers/Tree_2.png')
                .in(game);
            event.texture
                .add('Forest_Rock_1', 'room/forest/layers/Rock_1.png')
                .in(game);
            event.texture
                .add('Forest_Stump_1', 'room/forest/layers/Stump_1.png')
                .in(game);
            event.texture
                .add('Forest_Tree_1', 'room/forest/layers/Tree_1.png')
                .in(game);
            event.texture
                .add('Forest_Foreground', 'room/forest/layers/Foreground.png')
                .in(game);
            event.texture
                .add('Radio', 'room/forest/objects/Radio.png')
                .in(game);

            //audio
            event.audio
                .add(
                    'radio_click',
                    'room/forest/audio/sfx/object/radio_click.ogg'
                )
                .in(game);
            event.audio
                .add(
                    'frog_caves_chill_kopie',
                    'room/forest/audio/music/frog_caves_chill_kopie.ogg'
                )
                .in(game);
            event.audio.add('mask', 'room/forest/audio/music/mask.ogg');
            event.audio
                .add(
                    'forest_ambience',
                    'room/forest/audio/ambience/forest_ambience.ogg'
                )
                .in(game);

            //overrides
            if (currentEvents.includes('FF22')) {
                //layers
                event.texture
                    .add(
                        'Daily_Spin_Tent',
                        'event/ff22/room/forest/layers/Daily_Spin_Tent.png'
                    )
                    .in(game);
                event.texture
                    .add(
                        'Daily_Spin_Tent_Background',
                        'event/ff22/room/forest/layers/Daily_Spin_Tent_Background.png'
                    )
                    .in(game);
                event.texture
                    .add(
                        'Daily_Spin_Wheel',
                        'event/ff22/room/forest/objects/Daily_Spin_Wheel.png'
                    )
                    .in(game);
                event.texture
                    .add(
                        'Emote_Match_Sign',
                        'event/ff22/room/forest/layers/Emote_Match_Sign.png'
                    )
                    .in(game);
                event.texture
                    .add(
                        'Emote_Match_Table',
                        'event/ff22/room/forest/objects/Emote_Match_Table.png'
                    )
                    .in(game);
                event.texture
                    .add(
                        'Frog_Shuffle_Tent',
                        'event/ff22/room/forest/layers/Frog_Shuffle_Tent.png'
                    )
                    .in(game);
                event.texture
                    .add(
                        'Frog_Shuffle_Tent_Background',
                        'event/ff22/room/forest/layers/Frog_Shuffle_Tent_Background.png'
                    )
                    .in(game);
                event.texture
                    .add(
                        'Frog_Shuffle_Table',
                        'event/ff22/room/forest/objects/Frog_Shuffle_Table.png'
                    )
                    .in(game);

                //audio
                event.audio
                    .add(
                        'frog_caves_fair',
                        'event/ff22/audio/music/frog_caves_fair.ogg'
                    )
                    .in(game);
            } else if (currentEvents.includes('FF22Dev')) {
                event.texture
                    .add(
                        'Daily_Spin_Tent',
                        'event/ff22/room/forest/layers/Daily_Spin_Tent_Dev.png'
                    )
                    .in(game);
                event.texture
                    .add(
                        'Daily_Spin_Tent_Background',
                        'event/ff22/room/forest/layers/Daily_Spin_Tent_Background_Dev.png'
                    )
                    .in(game);
                event.texture
                    .add(
                        'Frog_Shuffle_Tent',
                        'event/ff22/room/forest/layers/Frog_Shuffle_Tent_Dev.png'
                    )
                    .in(game);
                event.texture
                    .add(
                        'Frog_Shuffle_Tent_Background',
                        'event/ff22/room/forest/layers/Frog_Shuffle_Tent_Background_Dev.png'
                    )
                    .in(game);
            }
            if (currentEvents.includes('Birthday_Party')) {
                event.texture
                    .add(
                        'Birthday_Cake',
                        'event/birthday_party/room/forest/layers/Birthday_Cake.png'
                    )
                    .in(game);
                event.texture
                    .add(
                        'Free_Birthday_Hats_Crate',
                        'event/birthday_party/room/forest/objects/Free_Birthday_Hats_Crate.png'
                    )
                    .in(game);
            }
            if (currentEvents.includes('Night')) {
                //winter background
                if (currentEvents.includes('Holiday')) {
                    event.texture
                        .add(
                            'Holiday_Forest_Background_Night',
                            'event/holiday/room/forest/layers/Holiday_Background_Night.png'
                        )
                        .in(game);
                }
                //normal forest background
                else {
                    event.texture
                        .add(
                            'Forest_Background_Night',
                            'room/forest/layers/Background_Night.png'
                        )
                        .in(game);
                }

                //night shader
                event.texture
                    .add('Shader_Night', 'room/forest/shaders/Night.png')
                    .in(game);
            }
            if (currentEvents.includes('Halloween')) {
                //audio
                event.audio
                    .add(
                        'Play_With_Me_Myuu',
                        'event/halloween/room/forest/audio/music/play_with_me_myuu.ogg'
                    )
                    .in(game);

                //layers
                event.texture
                    .add(
                        'Forest_JackOLantern',
                        'event/halloween/room/forest/layers/JackOLantern.png'
                    )
                    .in(game);
                event.texture
                    .add(
                        'Forest_Ghosts',
                        'event/halloween/room/forest/layers/Ghosts.png'
                    )
                    .in(game);

                //objects
                event.texture
                    .add(
                        'Free_Carved_Pumpkin_Hat_Crate',
                        'event/halloween/room/forest/objects/Free_Carved_Pumpkin_Hat_Crate.png'
                    )
                    .in(game);

                //shaders
                event.texture
                    .add(
                        'Shader_JackOLantern_Eyes',
                        'event/halloween/room/forest/shaders/JackOLantern_Eyes.png'
                    )
                    .in(game);
            }
            if (currentEvents.includes('Winter')) {
                //audio
                event.audio
                    .add(
                        'frog_caves_winter',
                        'event/winter/audio/music/frog_caves_winter.ogg'
                    )
                    .in(game);

                //layers
                event.texture
                    .add(
                        'Winter_Forest_Background',
                        'event/winter/room/forest/layers/Background.png'
                    )
                    .in(game);
                event.texture
                    .add(
                        'Forest_Ground_Winter',
                        'event/winter/room/forest/layers/Ground.png'
                    )
                    .in(game);
                event.texture
                    .add(
                        'Forest_Tree_3_Winter',
                        'event/winter/room/forest/layers/Tree_3.png'
                    )
                    .in(game);

                //particles
                event.texture
                    .add(
                        'Snowflake_0',
                        'event/winter/particles/snowflake_0.png'
                    )
                    .in(game);
                event.texture
                    .add(
                        'Snowflake_1',
                        'event/winter/particles/snowflake_1.png'
                    )
                    .in(game);
                event.texture
                    .add(
                        'Snowflake_2',
                        'event/winter/particles/snowflake_2.png'
                    )
                    .in(game);
            }
            if (currentEvents.includes('Holiday')) {
                //layers
                event.texture
                    .add(
                        'Holiday_Tree',
                        'event/holiday/room/forest/layers/Holiday_Tree.png'
                    )
                    .in(game);
                event.texture
                    .add(
                        'Holiday_Tree_Stump',
                        'event/holiday/room/forest/layers/Holiday_Tree_Stump.png'
                    )
                    .in(game);
                event.texture
                    .add(
                        'Holiday_Shadows',
                        'event/holiday/room/forest/layers/Holiday_Shadows.png'
                    )
                    .in(game);

                //objects
                event.texture
                    .add(
                        'Free_Santa_Hat_Crate',
                        'event/holiday/room/forest/objects/Free_Santa_Hat_Crate.png'
                    )
                    .in(game);
                event.texture
                    .add(
                        'Holiday_Present',
                        'event/holiday/room/forest/objects/Holiday_Present.png'
                    )
                    .in(game);

                //shaders
                event.texture
                    .add(
                        'Shader_Holiday_Lights',
                        'event/holiday/room/forest/shaders/Holiday_Lights.png'
                    )
                    .in(game);
            }
        }

        //Theatre Room
        else if (room === 'theatre') {
            //textures
            event.texture
                .add('Theatre_Background', 'room/theatre/layers/Background.png')
                .in(game);
            event.texture
                .add('Theatre_Stage', 'room/theatre/layers/Stage.png')
                .in(game);
            event.texture
                .add('Theatre_Curtains', 'room/theatre/layers/Curtains.png')
                .in(game);
            event.texture
                .add('Theatre_Foreground', 'room/theatre/layers/Foreground.png')
                .in(game);
            event.texture
                .add('Forest_Sign', 'room/theatre/layers/Forest_Sign.png')
                .in(game);
        }
    }

    //build the room
    static buildRoom(game, room, event) {
        //get current events
        let currentEvents = globalData.currentEvents;

        //Forest Room
        if (room === 'forest') {
            //options
            event.option.chatLogSize.set(250).in(game);
            if (currentEvents.includes('FF22'))
                event.option.music.set('frog_caves_fair').in(game);
            else if (currentEvents.includes('Halloween'))
                event.option.music.set('Play_With_Me_Myuu').in(game);
            else if (currentEvents.includes('Winter'))
                event.option.music.set('frog_caves_winter').in(game);
            else event.option.music.set('frog_caves_chill_kopie').in(game);
            event.option.ambience.set('forest_ambience').in(game);

            //layers
            if (currentEvents.includes('Night')) {
                //holiday night background
                if (currentEvents.includes('Holiday')) {
                    event.layer
                        .add('Holiday_Forest_Background_Night', 'background')
                        .in(game);
                }
                //normal forest night background
                else {
                    event.layer
                        .add('Forest_Background_Night', 'background')
                        .in(game);
                }
            }
            //winter forest background
            else if (currentEvents.includes('Winter')) {
                event.layer
                    .add('Winter_Forest_Background', 'background')
                    .in(game);
            }
            //default forest background
            else {
                event.layer.add('Forest_Background', 'background').in(game);
            }
            if (currentEvents.includes('Winter')) {
                event.layer.add('Forest_Ground_Winter', 'ground').in(game);
            } else {
                event.layer.add('Forest_Ground', 'ground').in(game);
            }
            event.layer.add('Theatre_Sign', 600).in(game);
            if (currentEvents.includes('Winter')) {
                event.layer.add('Forest_Tree_3_Winter', 610).in(game);
            } else {
                event.layer.add('Forest_Tree_3', 610).in(game);
            }
            // event.layer.add('Forest_Stump_1', 649).in(game);
            if (!currentEvents.includes('Winter')) {
                event.layer.add('Forest_Foreground', 'foreground').in(game);
                event.layer.add('Forest_Rock_1', 629).in(game);
            }

            //     //npcs
            //     event.npc
            //         .add('Poke')
            //         .location(363, 629, 'right')
            //         .lines([
            //             "*cough* i'm sick",
            //             'yo',
            //             "i'll be on lacari later",
            //             'one sec gunna take a water break',
            //             'u ever have a hemorrhoid?',
            //         ]);
            //     event.npc
            //         .add('Gigi')
            //         .location(250, 540, 'right')
            //         .lines([
            //             '*thinking of something weird to say*',
            //             "i'm not 40",
            //             'GEORGIEEEEEE!',
            //             '*hic*'
            //         ]);
            //     event.npc
            //         .add('Jesse')
            //         .location(1032, 666, 'left')
            //         .lines([
            //             'have you heard about the hangry hippos NFT?',
            //             "fuck all the bitches I know I don't give a fuck about flow",
            //             'a ha ha...',
            //             'i could be playing among us rn',
            //         ]);
            //     event.npc.add('Snic').location(1238, 554, 'left').lines(['IDGAF']);

            //teleports
            event.teleport
                .room('theatre')
                .location(80, 682)
                .size(160, 250)
                .in(game);

            // //objects
            // event.object.interactable
            //     .name('Radio')
            //     .location(294, 625)
            //     .depth(649)
            //     .onInteraction(() => {
            //         //play music
            //         if (game.audioMusic.key === 'mask') {
            //             game.addRoomMusic(room);
            //         } else {
            //             // game.playMusic('mask');
            //         }

            //         //click sfx
            //         game.sfxRadioClick.play();
            //     })
            //     .in(game);

            //overrides
            if (currentEvents.includes('FF22')) {
                //layers
                event.layer.add('Daily_Spin_Tent_Background', 560).in(game);
                event.layer.add('Daily_Spin_Tent', 610).in(game);
                event.layer.add('Frog_Shuffle_Tent_Background', 555).in(game);
                event.layer.add('Frog_Shuffle_Tent', 605).in(game);
                event.layer.add('Emote_Match_Sign', 735).in(game);

                //objects
                event.object.interactable
                    .name('Daily_Spin_Wheel')
                    .location(318, 532.3)
                    .depth(570)
                    .onInteraction(() => {
                        //start daily spin scene
                        game.end();
                        game.scene.start('FF22DailySpin');
                    })
                    .in(game);
                event.object.interactable
                    .name('Emote_Match_Table')
                    .location(899.6, 720.8)
                    .depth(745)
                    .onInteraction(() => {
                        //start emote match scene
                        game.end();
                        game.scene.start('FF22EmoteMatch');
                    })
                    .in(game);
                event.object.interactable
                    .name('Frog_Shuffle_Table')
                    .location(1111, 567.6)
                    .depth(590)
                    .onInteraction(() => {
                        //start frog shuffle scene
                        game.end();
                        game.scene.start('FF22FrogShuffle');
                    })
                    .in(game);
            } else if (currentEvents.includes('FF22Dev')) {
                //layers
                event.layer.add('Daily_Spin_Tent_Background', 560).in(game);
                event.layer.add('Daily_Spin_Tent', 610).in(game);
                event.layer.add('Frog_Shuffle_Tent_Background', 555).in(game);
                event.layer.add('Frog_Shuffle_Tent', 605).in(game);
            }
            if (currentEvents.includes('Birthday_Party')) {
                //layers
                event.layer.add('Birthday_Cake', 580).in(game);

                //objects
                event.object.interactable
                    .name('Free_Birthday_Hats_Crate')
                    .location(886, 578.7)
                    .depth(615)
                    .onInteraction(() => {
                        //get free birthday hat
                        client.requestItemPurchase('birthday_hat');
                    })
                    .in(game);
            }
            if (currentEvents.includes('Night')) {
                //shader
                event.layer.add('Shader_Night', 'shader').in(game);
            }
            if (currentEvents.includes('Halloween')) {
                //layers
                event.layer.add('Forest_JackOLantern', 550).in(game);
                event.layer.add('Forest_Ghosts', 'foreground').in(game);

                //objects
                event.object.interactable
                    .name('Free_Carved_Pumpkin_Hat_Crate')
                    .location(850, 535.7)
                    .depth(580)
                    .onInteraction(() => {
                        //get free carved pumpkin hat
                        client.requestItemPurchase('carved_pumpkin_hat');
                    })
                    .in(game);

                //shader
                event.layer.add('Shader_JackOLantern_Eyes', 'shader').in(game);
            }
            if (currentEvents.includes('Winter')) {
                //particles
                if (!currentEvents.includes('Holiday')) {
                    event.particle
                        .add(['Snowflake_0', 'Snowflake_1', 'Snowflake_2'])
                        .in(game);
                }
            }
            if (currentEvents.includes('Holiday')) {
                //layers
                event.layer.add('Holiday_Tree', 600).in(game);
                event.layer.add('Holiday_Tree_Stump', 588).in(game);
                event.layer.add('Holiday_Tree_Shadows', 2).in(game);

                //objects
                event.object.interactable
                    .name('Free_Santa_Hat_Crate')
                    .location(938.8, 568)
                    .depth(605)
                    .onInteraction(() => {
                        //get free santa hat
                        client.requestItemPurchase('santa_hat');
                    })
                    .in(game);
                event.object.interactable
                    .name('Holiday_Present')
                    .location(543.5, 590.8)
                    .depth(615)
                    .onInteraction(() => {
                        //secret holiday hat
                        client.requestItemPurchase('reindeer_antlers');
                    })
                    .in(game);

                //particles
                event.particle
                    .add(['Snowflake_0', 'Snowflake_1', 'Snowflake_2'])
                    .setFrequency(35)
                    .in(game);

                //shader
                event.layer.add('Shader_Holiday_Lights', 'shader').in(game);
            }

            //Theatre Room
        } else if (room === 'theatre') {
            //options
            event.option.chatLogSize.set(195).in(game);

            //layers
            event.layer.add('Theatre_Background', 'background').in(game);
            event.layer.add('Theatre_Stage', 'ground').in(game);
            event.layer.add('Theatre_Curtains', 610).in(game);
            event.layer.add('Forest_Sign', 700).in(game);
            event.layer.add('Theatre_Foreground', 'foreground').in(game);

            //teleports
            event.teleport
                .room('forest')
                .location(1502, 601)
                .size(100, 300)
                .in(game);
        }
    }
}
