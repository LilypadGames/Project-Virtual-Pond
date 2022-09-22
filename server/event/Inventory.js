// Inventory Events

//dependencies: file parsing
const path = require('path');
const jsonPath = require('jsonpath');

//get config values
// const config = require(path.join(__dirname, '../config/config.json'));
const itemData = require(path.join(__dirname, '../config/itemsData.json'));

class Inventory {
    constructor(io, socket, playerData) {
        //save socket and socket.io instance
        this.socket = socket;
        this.io = io;

        //save PlayerData instance
        this.PlayerData = playerData;
    }

    async init() {
        //register events
        await this.register();
    }

    async register() {
        //triggers when client requests to purchase an item
        this.socket.on('requestItemPurchase', async (itemID, cb) => {
            cb(await this.purchaseItem(itemID));
        });

        // //triggers when client requests to equip an item
        // this.socket.on('requestItemEquip', async (itemID, cb) => {
        //     cb(await this.equipItem(itemID));
        // });
    }

    //triggers when a player attempts to purchase an item
    async purchaseItem(itemID) {
        //init item
        let item;

        //item doesn't exist
        if (!(itemID in itemData)) {
            return { status: false, reason: "Item doesn't exist." };
        }

        //get item type if it exists
        else {
            item = jsonPath.query(itemData, '$..' + itemID)[0];
            console.log(item);
        }

        //player already has item
        if (
            (await this.PlayerData.getSpecificClientPlayerData(
                '/inventory/' + item.type + '/' + itemID
            )) !== null
        ) {
            return { status: false, reason: 'You already have this item.' };
        }

        //item has a cost
        if (item.cost) {
            //check if player can afford cost
            if (item.cost.tickets) {
                //player cant afford ticket cost
                if (this.socket.player.currency.tickets < item.cost.tickets) {
                    return {
                        status: false,
                        reason: 'You cannot afford this item.',
                    };
                }
            }

            //charge player
            if (item.cost.tickets) {
                //player can afford it. deduct cost from players currency.
                his.socket.player.currency.tickets - item.cost.tickets;
            }
        }

        //give item
        this.PlayerData.setSpecificClientPlayerData(
            '/inventory/' + item.type + '/' + itemID,
            true
        );

        //fetch inventory
        this.socket.player.inventory =
            await this.PlayerData.getSpecificClientPlayerData('/inventory');

        //return status of transaction
        return { status: true, reason: 'You now own the ' + item.name + '.' };
    }

    async equipItem() {}
}

module.exports = Inventory;
