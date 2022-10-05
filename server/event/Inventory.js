// Inventory Events

//dependencies: file parsing
const path = require('path');
const jsonPath = require('jsonpath');

//get config values
const itemData = require(path.join(__dirname, '../data/itemData.json'));

//modules
const globalData = require(path.join(__dirname, '../module/GlobalData.js'));

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
    }

    //triggers when a player attempts to purchase an item
    async purchaseItem(itemID) {
        //easter egg 4 jessesmfi lol
        let cantAffordDialog = () => {
            return {
                title:
                    this.socket.player.id === 46483820 ? 'Jesse...' : 'Oops!',
                message:
                    this.socket.player.id === 46483820
                        ? "You KNOW you can't afford this..."
                        : 'You cannot afford this item.',
            };
        };

        //init item
        let item;

        //item doesn't exist
        if (!(itemID in itemData)) {
            return { status: false, reason: "Item doesn't exist." };
        }

        //get item type if it exists
        else {
            item = jsonPath.query(itemData, '$..' + itemID)[0];
        }

        //check if item is obtainable
        if (item.purchasable) {
            if (item.purchasable === false)
                return { status: false, reason: 'Item is not obtainable.' };
        }

        //player already has item
        if (
            (await this.PlayerData.getSpecificClientPlayerData(
                '/inventory/' + item.type + '/' + itemID
            )) !== null
        ) {
            return { status: false, reason: 'You already have this item.' };
        }

        //check conditions
        if (item.conditions) {
            //event conditions
            if (item.conditions.event) {
                //check if event is one of the current events
                if (
                    !globalData
                        .getObject('currentEvents')
                        .includes(item.conditions.event)
                )
                    return {
                        status: false,
                        reason: 'Item is not obtainable at this time.',
                    };
            }
        }

        //item has a cost
        if (item.cost) {
            //check if player can afford cost
            if (item.cost.tickets) {
                //player cant afford ticket cost
                if (this.socket.player.currency.tickets < item.cost.tickets) {
                    let dialog = cantAffordDialog;
                    return {
                        status: false,
                        title: dialog.title,
                        reason: dialog.message,
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
}

module.exports = Inventory;
