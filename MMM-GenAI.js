Module.register("MMM-GenAI", {
  // Default module config.
  defaults: {
    apiKey: "", // Default empty, to be set in config.js
    temperature: 0.95, // Default temperature value
  },

  start() {
    console.log("MMM-GenAI started");
    this.sendSocketNotification("GET_CURRENT_TIME");
    console.log("Sent socket notification: GET_CURRENT_TIME");
  },

  notificationReceived(notification, payload, sender) {
    console.log("Received notification:", notification);
    if (notification === "USERS_LOGIN") {
      console.log("Received USERS_LOGIN notification");
      this.sendSocketNotification("GENERATE_CONTENT");
      console.log("Sent socket notification: GENERATE_CONTENT");
    }
    if (notification === "DOM_OBJECTS_CREATED") {
      console.log("DOM objects created");
      this.sendSocketNotification("CONFIG", this.config);
      console.log("Sent socket notification: CONFIG with payload", this.config);
    }
  },

  socketNotificationReceived(notification, payload) {
    console.log("Received socket notification:", notification);
    if (notification === "GENERATED_CONTENT") {
      console.log("Generated content received:", payload);
      this.sendNotification("SHOW_ALERT", { type: "notification", message: payload });
      console.log("Sent notification: SHOW_ALERT with payload", payload);
    }
  }
});
