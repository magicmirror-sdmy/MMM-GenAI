const NodeHelper = require("node_helper");
const { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } = require("@google/generative-ai");

module.exports = NodeHelper.create({
  start() {
    console.log("Starting MMM-GenAI helper...");

    // Ensure Node.js version is >= 18
    const majorVersion = parseInt(process.version.substring(1), 10);
    if (majorVersion < 18) {
      console.error("Node.js version must be >= 18");
      process.exit(1);
    }

    // Check if API key is provided
    if (!this.config.apiKey) {
      console.error("Please provide your Google Generative AI API key in the module configuration.");
      process.exit(1);
    }

    this.expressApp.get("/currenttime", (req, res) => {
      const now = new Date();
      const currentTime = now.getHours() + ":" + now.getMinutes();
      res.send(currentTime);
    });

    this.generateContent();
  },

  async generateContent() {
  console.log("Generating content...");

  const apiKey = this.config.apiKey;

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
    {text: "input: december 2 maonday 2024 12 pm"},
  ];

  const result = await model.generateContent({
    contents: [{ role: "user", parts }],
    generationConfig,
    safetySettings,
  });

  const response = result.response;
  const generatedText = response.text();
  this.sendSocketNotification("GENERATED_CONTENT", generatedText);
  },
});
