// Fall Faire 2022 Event Handler

class FF22 {
    init() {
        delete this.ticketIcon;
        delete this.ticketText;
    }

    preload(scene) {
        //init
        this.init();

        //UI
        scene.load.image('ticket_icon', 'assets/event/ff22/ui/ticket_icon.png');
    }

    async create(scene) {
        //get current ticket count
        scene.ticketCount = await client.FF22getTicketCount();

        //ticket icon
        this.ticketIcon = scene.add
            .sprite(1220, 40, 'ticket_icon')
            .setDepth(scene.depthUI)
            .setOrigin(0.5, 0.5)
            .setInteractive();
        globalUI.setOutlineOnHover(scene, this.ticketIcon);

        //ticket amount
        this.ticketText = scene.add
            .text(1220, 40, '', {
                fontFamily: 'Burbin',
                fontSize: '16px',
                align: 'center',
                color: utility.hexIntegerToString(ColorScheme.Black),
            })
            .setDepth(scene.depthUI)
            .setOrigin(0.5, 0.5)
            .setFixedSize(60, 20);

        //update ticket display
        this.updateTicketDisplay(scene);
    }

    changeTickets(scene, delta) {
        //update amount
        scene.ticketCount = scene.ticketCount + delta;

        //update ticket display
        this.updateTicketDisplay(scene);
    }

    async updateTickets(scene) {
        //get current ticket count
        scene.ticketCount = await client.FF22getTicketCount();

        //update ticket display
        this.updateTicketDisplay(scene);
    }

    updateTicketDisplay(scene) {
        this.ticketText.setText(scene.ticketCount);
    }
}
