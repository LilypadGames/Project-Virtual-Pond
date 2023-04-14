// rooms
import Pond from "../room/Pond.ts";
import Theatre from "../room/Theatre.ts";

// setup room data
export default {
    "pond": {
        "class": Pond,
        "spawnpoint": {
            "minX": 100,
            "maxX": 1200,
            "minY": 440,
            "maxY": 560
        },
        "adjacentRooms": [
            "theatre"
        ]
    },
    "theatre": {
        "class": Theatre,
        "spawnpoint": {
            "minX": 172,
            "maxX": 1078,
            "minY": 566,
            "maxY": 649
        },
        "adjacentRooms": [
            "forest"
        ]
    }
}