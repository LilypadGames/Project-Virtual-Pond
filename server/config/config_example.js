// Back-end Configuration

const config = {
  server: {
    port: 8000 // Define the Server Port
  }
};

module.exports = config;

const firebaseConfig = { // Place Firebase Realtime Database Config Here
};

firebase.initializeApp(firebaseConfig);