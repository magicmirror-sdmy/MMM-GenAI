const NodeHelper = require("node_helper");
const { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } = require("@google/generative-ai");
const moment = require("moment");

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

      // Use the time as part of the input to generate content
      const parts = [
    {text: "input: Thursday 5am"},
    {text: "output: you're an early bird, its cold aint it?"},
    {text: "input: friday 6am"},
    {text: "output: hey there good morning , hows the new year party going on"},
    {text: "input: saturday 7am"},
    {text: "output: please tell me you got a date today"},
    {text: "input: thursday 8am"},
    {text: "output: good morning dear, looking good"},
    {text: "input: tuesday 10:30am"},
    {text: "output: ready for a brunch?"},
    {text: "input: wednesday 3:45pm"},
    {text: "output: how are you loving the weather?"},
    {text: "input: monday 12pm"},
    {text: "output: dont forget to drink some water"},
    {text: "input: thursday 5pm"},
    {text: "output: hows your day so  far babe?"},
    {text: "input: friday  1:33pm"},
    {text: "output: good afternoon beautiful"},
    {text: "input: saturday 5:55pm"},
    {text: "output: how was your day so far"},
    {text: "input: sunday 4:43 pm"},
    {text: "output: good evening, wanna go for a ride ?"},
    {text: "input: monday 7pm"},
    {text: "output: hey there"},
    {text: "input: friday 6pm"},
    {text: "output: hey there looking pale, everything alright? its okay tomorrow is the weekend"},
    {text: "input: saturday 9am"},
    {text: "output: may the forth be with you, live long and prosper"},
    {text: "input: Friday 6 PM"},
    {text: "output: hi there, i hope youre doing okay?"},
    {text: "input: monday 7:23 PM"},
    {text: "output: ready for dinner?"},
    {text: "input: Friday 11 PM"},
    {text: "output: work hard, party hard"},
    {text: "input: wednesday 11 PM"},
    {text: "output: ready to burn the midnight oil?"},
    {text: "input: Friday 6 PM"},
    {text: "output: word hard  today for a better tomorrow"},
    {text: "input: Friday 1:55 AM"},
    {text: "output: its late, go to bed"},
    {text: "input: Friday 1:00 AM"},
    {text: "output: good night, sleep tight, dont let the bed bugs bite."},
    {text: "input: Friday 6 PM"},
    {text: "output: its cold isnt it"},
    {text: "input: Friday 6 PM"},
    {text: "output: what a beautiful day to be alive"},
    {text: "input: Friday 10am"},
    {text: "output: Hows the spring treating you so far?"},
    {text: "input: monday 6am"},
    {text: "output: the month of festivals, wow"},
    {text: "input: monday 2pm"},
    {text: "output: is your monday mondaying?"},
    {text: "input: Friday 6 PM"},
    {text: "output: go to church or go to hell?"},
    {text: "input: Thursday 11:19 PM"},
    {text: "output: how was your day"},
    {text: "input: Friday 6 PM"},
    {text: "output: you need to seriously get a life"},
    {text: "input: wednesday 11:19 PM"},
    {text: "output: hey there merry christmas"},
    {text: "input: 21st january saturday 6am"},
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
        this.generateContent(payload.time);
      }
    } else if (notification === "GET_CURRENT_TIME") {
      const currentTime = this.formatCurrentTime();
      this.sendSocketNotification("CURRENT_TIME_RESPONSE", currentTime);
      console.log("Sent socket notification: CURRENT_TIME_RESPONSE with payload", currentTime);
    }
  }
});
