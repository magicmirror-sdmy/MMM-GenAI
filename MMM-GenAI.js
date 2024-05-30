Module.register("MMM-GenAI", {
  // Default module config.
  defaults: {
    apiKey: "", // Default empty, to be set in config.js
    temperature: 0.95, // Default temperature value
  },

  start() {
    console.log("MMM-GenAI started");
    this.sendSocketNotification("CONFIG", this.config); // Move this line to notificationReceived
    this.sendSocketNotification("GET_CURRENT_TIME");
  },

  notificationReceived(notification, payload, sender) {
    if (notification === "USERS_LOGIN") {
      console.log("Received USERS_LOGIN notification");
      this.sendSocketNotification("GENERATE_CONTENT");
    }
    if (notification === "DOM_OBJECTS_CREATED") {
      console.log("DOM objects created");
      this.sendSocketNotification("CONFIG", this.config); // Move the config notification here
    }
  },
});
