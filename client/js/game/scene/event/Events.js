// Events Handler

class Events {
    preload(scene) {
        //Fall Faire 2022
        if (globalData.currentEvents.includes('FF22')) {
            ff22.preload(scene);
        }
    }

    async create(scene) {
        //Fall Faire 2022
        if (globalData.currentEvents.includes('FF22')) {
            await ff22.create(scene);
        }
    }
}
