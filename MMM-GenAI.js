Module.register("MMM-GenAI", {
  // Default module config.
  defaults: {
    apiKey: "", // Default empty, to be set in config.js
    temperature: 0.95, // Default temperature value
  },

  start() {
    console.log("MMM-GenAI started");
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
      const { generatedText, formattedTime } = payload;
      console.log("Generated content received:", generatedText);
      console.log("Current time received:", formattedTime);
      this.sendNotification("SHOW_ALERT", {
        type: "notification",
        message: `Generated Content: ${generatedText}\nCurrent Time: ${formattedTime}`
      });
      console.log("Sent notification: SHOW_ALERT with payload", {
        generatedText,
        formattedTime
      });
    }
  }
});
