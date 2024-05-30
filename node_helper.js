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

    // Check if time argument is provided
    if (process.argv.length < 3) {
      console.error("Please provide the current time as an argument in the format: '30 may 2024, 10:45pm'");
      process.exit(1);
    }

    // Get the time argument
    const inputTime = process.argv[2];
    this.generateContent(inputTime);
  },

  async generateContent(inputTime) {
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
      { text: `input: ${inputTime}` },
      { text: "output: " }, // Output for the provided time input
    ];

    const result = await model.generateContent({
      contents: [{ role: "user", parts }],
      generationConfig,
      safetySettings,
    });

    const response = result.response;
    console.log(response.text());
  },
});
