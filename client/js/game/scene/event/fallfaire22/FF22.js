// Fall Faire 2022 Event Handler

class FF22 {
    preload(scene) {
        //UI
        scene.load.image('ticket_icon', 'assets/event/ff22/ui/ticket_icon.png');
    }

    create(scene) {
        //ticket icon
        var ticketIcon = scene.add
            .sprite(1220, 40, 'ticket_icon')
            .setDepth(scene.depthUI)
            .setOrigin(0.5, 0.5)
            .setInteractive();
        globalUI.setOutlineOnHover(scene, ticketIcon);
    }
}
