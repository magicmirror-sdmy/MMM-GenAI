const NodeHelper = require("node_helper");
const { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } = require("@google/generative-ai");
const moment = require("moment");
const fs = require("fs");
const path = require("path");

const MODEL_NAME = "gemini-1.5-flash";

module.exports = NodeHelper.create({
  start() {
    console.log("Starting MMM-GenAI helper...");

    // Ensure Node.js version is >= 18
    const majorVersion = parseInt(process.version.substring(1), 10);
    if (majorVersion < 18) {
      console.error("Node.js version must be >= 18");
      process.exit(1);
    }

    // Other initialization steps can be placed here if needed
  },

  getOrdinalSuffix(day) {
    const suffixes = ['th', 'st', 'nd', 'rd'];
    const relevantDigits = (day < 30) ? day % 20 : day % 30;
    const suffix = (relevantDigits <= 3) ? suffixes[relevantDigits] : suffixes[0];
    return suffix;
  },

  formatCurrentTime() {
    const now = moment();
    const day = now.date();
    const dayWithSuffix = day + this.getOrdinalSuffix(day);
    const formattedTime = now.format(`DD MMMM dddd hh:mm A`).replace(now.format('DD'), dayWithSuffix);
    return formattedTime;
  },

  async generateContent(time) {
    console.log("Generating content with time:", time);
    try {
      const apiKey = this.config.apiKey;
      if (!apiKey) {
        throw new Error("API key is not set in the configuration");
      }

      // Read the external JSON file
      const filePath = path.resolve(__dirname, this.config.filename);
      if (!fs.existsSync(filePath)) {
        throw new Error(`File not found: ${filePath}`);
      }

      const fileContent = fs.readFileSync(filePath, "utf8");
      const parts = JSON.parse(fileContent);

      // Integrate the provided time into the input
      parts.push({ text: `input: ${time}` });

      // Initialize GoogleGenerativeAI instance
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: MODEL_NAME });

      const generationConfig = {
        temperature: this.config.temperature || 0.95,
        topK: 64,
        topP: 0.95,
        maxOutputTokens: 8192,
      };

      const safetySettings = [
        {
          category: HarmCategory.HARM_CATEGORY_HARASSMENT,
          threshold: HarmBlockThreshold.BLOCK_NONE,
        },
        {
          category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
          threshold: HarmBlockThreshold.BLOCK_NONE,
        },
        {
          category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
          threshold: HarmBlockThreshold.BLOCK_NONE,
        },
        {
          category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
          threshold: HarmBlockThreshold.BLOCK_NONE,
        },
      ];

      const result = await model.generateContent({
        contents: [{ role: "user", parts }],
        generationConfig,
        safetySettings,
      });

      const response = result.response;
      const generatedText = response.text();

      console.log("Generated Content:", generatedText); // Log the generated content
      this.sendSocketNotification("GENERATED_CONTENT", generatedText);
      console.log("Sent socket notification: GENERATED_CONTENT with payload", generatedText);
    } catch (error) {
      console.error("Error generating content:", error);
      this.sendSocketNotification("GENERATED_CONTENT_ERROR", error.message);
    }
  },

  socketNotificationReceived(notification, payload) {
    console.log("Received socket notification:", notification, "with payload:", payload);
    if (notification === "CONFIG") {
      this.config = payload;
      console.log("Received configuration:", this.config);
    } else if (notification === "GENERATE_CONTENT") {
      if (!this.config || !this.config.apiKey) {
        console.error("Configuration is missing or API key is not set");
        this.sendSocketNotification("GENERATED_CONTENT_ERROR", "Configuration is missing or API key is not set");
      } else {
        this.generateContent(payload); // Directly passing the time string
      }
    } else if (notification === "GET_CURRENT_TIME") {
      const currentTime = this.formatCurrentTime();
      this.sendSocketNotification("CURRENT_TIME_RESPONSE", currentTime);
      console.log("Sent socket notification: CURRENT_TIME_RESPONSE with payload", currentTime);
    }
  }
});
