// Back-end Configuration

//web server
const config = {
  server: {
    port: 80 // Define the Server Port
  }
};

//database
const firebaseConfig = { // Place Firebase Realtime Database Config Here
  apiKey: "",
  authDomain: "",
  databaseURL: "",
  projectId: "",
  storageBucket: "",
  messagingSenderId: "",
  appId: ""
};

firebase.initializeApp(firebaseConfig);

//export
module.exports = config;