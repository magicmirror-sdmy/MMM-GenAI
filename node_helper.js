const NodeHelper = require("node_helper");
const { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } = require("@google/generative-ai");
const moment = require("moment");
const fs = require("fs");
const path = require("path");

const MODEL_NAME = "gemini-2.0-flash-exp";

module.exports = NodeHelper.create({
  start() {
    console.log("Starting MMM-GenAI helper...");

    const majorVersion = parseInt(process.version.substring(1), 10);
    if (majorVersion < 18) {
      console.error("Node.js version must be >= 18");
      process.exit(1);
    }
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
    return now.format(`DD MMMM dddd hh:mm A`).replace(now.format('DD'), dayWithSuffix);
  },

  async generateContent(time) {
    console.log("Generating content with time:", time);
    try {
      const apiKey = this.config.apiKey;
      if (!apiKey) {
        throw new Error("API key is not set in the configuration");
      }

      const filePath = path.resolve(__dirname, this.config.filename);
      if (!fs.existsSync(filePath)) {
        throw new Error(`File not found: ${filePath}`);
      }

      const fileContent = fs.readFileSync(filePath, "utf8");
      const parts = JSON.parse(fileContent);
      parts.push({ text: `input: ${time}` });

      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: MODEL_NAME });

      const generationConfig = {
        temperature: this.config.temperature || 0.95,
        topK: 64,
        topP: 0.95,
        maxOutputTokens: 8192,
      };

      const safetySettings = [
        { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_NONE },
        { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_NONE },
        { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_NONE },
        { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_NONE },
      ];

      let retries = 0;
      const maxRetries = 2;
      let finalOutput = null;

      while (!finalOutput && retries < maxRetries) {
        console.log(`Attempt ${retries + 1} to generate content...`);
        retries += 1;

        const result = await model.generateContent({
          contents: [{ role: "user", parts }],
          generationConfig,
          safetySettings,
        });

        console.log("Full Response Object:", JSON.stringify(result.response, null, 2));
        const rawGeneratedText = result.response.candidates[0].content.parts[0].text;

        // Try to extract "output:" line or fall back to raw text
        let cleanedGeneratedText = rawGeneratedText.split("\n").find(line => line.trim().startsWith("output:"));
        if (cleanedGeneratedText) {
          cleanedGeneratedText = cleanedGeneratedText.replace(/^output:\s*/, "").trim();
        } else {
          cleanedGeneratedText = rawGeneratedText.trim();
        }

        finalOutput = cleanedGeneratedText || null;
        console.log("Raw Generated Content:", rawGeneratedText);
        console.log("Final Output:", finalOutput || "No output found");
      }

      if (!finalOutput) {
        throw new Error("Content generation failed after maximum retries.");
      }

      this.sendSocketNotification("GENERATED_CONTENT", finalOutput);
      console.log("Sent socket notification: GENERATED_CONTENT with payload", finalOutput);
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
        this.generateContent(payload);
      }
    } else if (notification === "GET_CURRENT_TIME") {
      const currentTime = this.formatCurrentTime();
      this.sendSocketNotification("CURRENT_TIME_RESPONSE", currentTime);
      console.log("Sent socket notification: CURRENT_TIME_RESPONSE with payload", currentTime);
    }
  }
});
