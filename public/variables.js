console.clear();
// console.log = function () { }

// Prompts

const promptPre = ""
    + "";

let promptIMGpre = "";
promptIMGpre = "";

let promptIMGpost = ", Concept Art, Golden Hour, Wide Shot, Amazing Style";
promptIMGpost = "";


// Global Variables - Change

let llmAttributes = {
    name: "Nova",
    gender: "female"
};

const nOfTokens = 600;
const nOfTokensIMG = 300;
const nOfTokensPersonality = 10;

const voiceSliceCharackters = 200;
const voiceSliceCharacktersOverlap = 50;

let pushLLMmessage = "CREATE CONVERSATION";

const textModel1 = "gpt-4.1-mini-2025-04-14";
const textModel2 = "gpt-4.1-2025-04-14";

const imgModel1 = "DALL-E";
const imgModel2 = "IMAGEN";

const voiceModel1 = "Zonos";
const voiceModel2 = "Chatterbox";

// 0.1 and 1.2
// 0.1 monotone, desinterested
// 0.2 slow, tender
// 0.2 calm
// 0.4 neutral tone and speed
// 0.6 happy
// 0.7 very happy
// 1.2 extremely overexcited, angry, loud, cringy

let zonosOptions = {
    text: "",
    modelChoice: "Zyphra/Zonos-v0.1-transformer",       // Zyphra/Zonos-v0.1-transformer | Zyphra/Zonos-v0.1-hybrid
    language: "de",                                  // en-us | de
    speakerAudioPath: null,                             // String or Null
    prefixAudioPath: null,                              // String or Null
    // Settings
    fmax: 24000,                                        // 0 - 24000 | Sample Rate?
    pitchStd: 45,                                       // 0 - 300 | Pitch
    speakingRate: 15,                                   // 5 - 30 | Speed? Breaks?
    cfgScale: 2.0,                                      // 1 - 5 | Stay on Text - Improvise
    // Randomness
    linear: 0.5,        // -2 - 2 | Linear (0 to disable) - High values make the output less random.
    confidence: 0.4,    // -2 - 2 | Confidence - Low values make random outputs more random.
    quadratic: 0.0,     // -2 - 2 | Quadratic - High values make low probablities much lower.
    // Emotions
    e1: 0.05,       // Happiness
    e2: 0.05,       // Sadness
    e3: 0.05,       // Disgust
    e4: 0.05,       // Fear
    e5: 0.05,       // Surprise
    e6: 0.05,       // Anger
    e7: 0.10,       // Other
    e8: 0.20,       // Neutral
    // unconditionalKeysArray: ['speaker', 'emotion', 'fmax', 'pitch_std', 'speaking_rate'],
    // unconditionalKeysArray: ['fmax', 'pitch_std', 'speaking_rate'],
    unconditionalKeysArray: [],
    seed: 1,                                            // Seed
    randomizeSeed: false,                               // Randomize Seed
    // Not in use
    topP: 0,              // 0 - 1    | Legacy | Only when linear = 0
    topK: 0,              // 0 - 1024 | Legacy | Only when linear = 0
    minP: 0,              // 0 - 1    | Legacy | Only when linear = 0
    // ???
    vqSingle: false,        // ???
    dnsmosOvl: false,       // ???
    speakerNoised: false    // ???
};

zonosOptions.modelChoice = "Zyphra/Zonos-v0.1-transformer"; // Zyphra/Zonos-v0.1-transformer | Zyphra/Zonos-v0.1-hybrid
// Settings
zonosOptions.pitchStd = 10;       // 0 - 300 | Pitch
zonosOptions.speakingRate = 14;    // 5 - 30 | Speed? Breaks?
zonosOptions.randomizeSeed = true; // Randomize Seed

const zonosOptionsStandard = zonosOptions;


// Variable - Don't change

let randomStartTimeValue = 1000;
let randomStartTime = randomStartTimeValue;
let hiddenPersonality = "";
let firstAction = true;
let isLoading = false;
let isRecording = false;

let conversationHistory = [];

let minimumRandomTimeInMinutes;
let maximumRandomTimeInMinutes;

let randomTimeInMinutes = 30.13;
let pushLLMessageConstructed = "[" + pushLLMmessage + " | " + randomTimeInMinutes + "m]"

const logoIMG = document.getElementById("logoContainer");
const loadingIMG = document.getElementById("loadingContainer");

const inputField = document.getElementById("inputFieldSearch");
inputField.value = "";

const result = document.getElementById("result");
const returnDiv = document.getElementById("returnDiv");