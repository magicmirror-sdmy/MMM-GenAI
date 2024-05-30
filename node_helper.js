const NodeHelper = require("node_helper");
const { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } = require("@google/generative-ai");
const moment = require("moment");

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

  async generateContent() {
    console.log("Generating content...");
    try {
      const apiKey = this.config.apiKey;
      if (!apiKey) {
        throw new Error("API key is not set in the configuration");
      }

      // Initialize GoogleGenerativeAI instance
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

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

      // Get the formatted current time
      const formattedTime = this.formatCurrentTime();

      // Use the formatted time as part of the input to generate content
      prompt_parts = [
  "input: 5am",
  "output: you're an early bird",
  "input: 6am",
  "output: hey there good morning",
  "input: 7am",
  "output: have a productive day",
  "input: 8am",
  "output: good morning dear, looking good",
  "input: 10am",
  "output: ready for a brunch?",
  "input: 11am",
  "output: how are you loving the weather?",
  "input: 12pm",
  "output: dont forget to drink some water",
  "input: 1pm",
  "output: hows your day so  far babe?",
  "input: 2pm",
  "output: good afternoon beautiful",
  "input: 3pm",
  "output: how was your so far",
  "input: 4pm",
  "output: good evening, wanna go for a ride ?",
  "input: 5pm",
  "output: hey there",
  "input: 6pm",
  "output: hey there looking pale, everything alright?",
  "input: 7pm",
  "output: okay dokay dear. good evening",
  "input: 8pm",
  "output: hi there, i hope youre doing okay?",
  "input: 9pm",
  "output: ready for dinner?",
  "input: 10pm",
  "output: work hard, party hard",
  "input: 11pm",
  "output: ready to burn the midnight oil?",
  "input: 12am",
  "output: word hard  today for a better tomorrow",
  "input: 12 am",
  "output: its late, go to bed",
  "input: 12am",
  "output: good night, sleep tight, dont let the bed bugs bite.",
  "input: january",
  "output: its cold isnt it",
  "input: february",
  "output: what a beautiful day to be alive",
  "input: march",
  "output: Hows the spring treating you so far?",
  "input: october",
  "output: the month of festivals, wow",
  "input: monday",
  "output: is your monday mondaying?",
  "input: sunday",
  "output: go to church or go to hell?",
  "input: 30th May Thursday 11:19 PM",
  "output: how was your day",
  "input: 29th May Friday 6 PM",
  "output: you need to seriously get a life",
  "input: 25th december wednesday 11:19 PM",
  "output: hey there merry christmas",
  
]

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
        this.generateContent();
      }
    } else if (notification === "GET_CURRENT_TIME") {
      const currentTime = new Date().toISOString(); // Example time format
      this.sendSocketNotification("CURRENT_TIME_RESPONSE", currentTime);
      console.log("Sent socket notification: CURRENT_TIME_RESPONSE with payload", currentTime);
    }
  }
});
