// rooms
import Pond from "../room/Pond.ts";
import Theatre from "../room/Theatre.ts";

// setup room data
export default {
    "pond": {
        "class": Pond,
        "spawnpoint": {
            "minX": 281,
            "maxX": 975,
            "minY": 560,
            "maxY": 731
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