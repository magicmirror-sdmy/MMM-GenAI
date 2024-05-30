Module.register("MMM-GenAI", {
  // Default module config.
  defaults: {
    apiKey: "", // Default empty, to be set in config.js
    temperature: 0.95, // Default temperature value
  },

  start() {
    console.log("MMM-GenAI started");
    const formattedTime = this.getFormattedCurrentTime();
    this.sendSocketNotification("GET_CURRENT_TIME", formattedTime);
    console.log("Sent socket notification: GET_CURRENT_TIME with payload", formattedTime);
  },

  getFormattedCurrentTime() {
    const now = new Date();
    const day = now.getDate();
    const month = now.toLocaleString('default', { month: 'long' });
    const dayOfWeek = now.toLocaleString('default', { weekday: 'long' });
    const year = now.getFullYear();
    const hours = now.getHours();
    const minutes = now.getMinutes();
    const ampm = hours >= 12 ? 'pm' : 'am';
    const formattedHours = hours % 12 || 12; // Convert to 12-hour format
    const formattedMinutes = minutes < 10 ? '0' + minutes : minutes;
    
    return `${day} ${month} ${dayOfWeek} ${year} ${formattedHours}:${formattedMinutes}${ampm}`;
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
