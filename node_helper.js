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
      const parts = [
    {text: "input: 5am"},
    {text: "output: you're an early bird"},
    {text: "input: 6am"},
    {text: "output: hey there good morning"},
    {text: "input: 7am"},
    {text: "output: have a productive day"},
    {text: "input: 8am"},
    {text: "output: good morning dear, looking good"},
    {text: "input: 10am"},
    {text: "output: ready for a brunch?"},
    {text: "input: 11am"},
    {text: "output: how are you loving the weather?"},
    {text: "input: 12pm"},
    {text: "output: dont forget to drink some water"},
    {text: "input: 1pm"},
    {text: "output: hows your day so  far babe?"},
    {text: "input: 2pm"},
    {text: "output: good afternoon beautiful"},
    {text: "input: 3pm"},
    {text: "output: how was your so far"},
    {text: "input: 4pm"},
    {text: "output: good evening, wanna go for a ride ?"},
    {text: "input: 5pm"},
    {text: "output: hey there"},
    {text: "input: 6pm"},
    {text: "output: hey there looking pale, everything alright?"},
    {text: "input: 7pm"},
    {text: "output: okay dokay dear. good evening"},
    {text: "input: 8pm"},
    {text: "output: hi there, i hope youre doing okay?"},
    {text: "input: 9pm"},
    {text: "output: ready for dinner?"},
    {text: "input: 10pm"},
    {text: "output: work hard, party hard"},
    {text: "input: 11pm"},
    {text: "output: ready to burn the midnight oil?"},
    {text: "input: 12am"},
    {text: "output: word hard  today for a better tomorrow"},
    {text: "input: 12 am"},
    {text: "output: its late, go to bed"},
    {text: "input: 12am"},
    {text: "output: good night, sleep tight, dont let the bed bugs bite."},
    {text: "input: january"},
    {text: "output: its cold isnt it"},
    {text: "input: february"},
    {text: "output: what a beautiful day to be alive"},
    {text: "input: march"},
    {text: "output: Hows the spring treating you so far?"},
    {text: "input: october"},
    {text: "output: the month of festivals, wow"},
    {text: "input: monday"},
    {text: "output: is your monday mondaying?"},
    {text: "input: sunday"},
    {text: "output: go to church or go to hell?"},
    {text: "input: 30th May Thursday 11:19 PM"},
    {text: "output: how was your day"},
    {text: "input: 29th May Friday 6 PM"},
    {text: "output: you need to seriously get a life"},
    {text: "input: 25th december wednesday 11:19 PM"},
    {text: "output: hey there merry christmas"},
    {text: "input: 30th May Thursday 11:19 PM"},
    {text: "output: "},
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
        this.generateContent();
      }
    } else if (notification === "GET_CURRENT_TIME") {
      const currentTime = new Date().toISOString(); // Example time format
      this.sendSocketNotification("CURRENT_TIME_RESPONSE", currentTime);
      console.log("Sent socket notification: CURRENT_TIME_RESPONSE with payload", currentTime);
    }
  }
});
