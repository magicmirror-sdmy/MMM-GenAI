Module.register("MMM-GenAI", {
  // Default module config.
  defaults: {
    apiKey: "", // Default empty, to be set in config.js
    temperature: 0.95, // Default temperature value
  },

  start() {
    console.log("MMM-GenAI started");
    this.sendSocketNotification("CONFIG", this.config);
  },

  notificationReceived(notification, payload, sender) {
    if (notification === "USERS_LOGIN") {
      console.log("Received USERS_LOGIN notification");
      this.sendSocketNotification("USERS_LOGIN", payload);
    }
  },
});
