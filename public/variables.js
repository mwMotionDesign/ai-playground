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

const nOfTokens = 600;
const nOfTokensIMG = 300;
const nOfTokensPersonality = 10;

const voiceSliceCharackters = 550;
const voiceSliceCharacktersOverlap = 50;

let pushLLMmessage = "CREATE CONVERSATION";

const textModel1 = "gpt-4.1-mini-2025-04-14";
const textModel2 = "gpt-4.1-2025-04-14";

const imgModel1 = "DALL-E";
const imgModel2 = "IMAGEN";


// Variable - Don't change

let randomStartTimeValue = 1000;
let randomStartTime = randomStartTimeValue;
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