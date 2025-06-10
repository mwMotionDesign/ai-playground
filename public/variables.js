// Prompts

const promptPre = ""
    + "";

let promptIMGpre = "";
promptIMGpre = "";

let promptIMGpost = ", Concept Art, Golden Hour, Wide Shot, Amazing Style";
promptIMGpost = "";


// Global Variables - Change

const nOfTokens = 600;
const voiceSliceCharackters = 600;

const textModel1 = "gpt-4.1-mini-2025-04-14";
const textModel2 = "gpt-4.1-2025-04-14";

const imgModel1 = "DALL-E";
const imgModel2 = "IMAGEN";


// Variable - Don't change

let isRecording = false;
let firstAction = true;

const logoIMG = document.getElementById("logoContainer");
const loadingIMG = document.getElementById("loadingContainer");

const inputField = document.getElementById("inputFieldSearch");
inputField.value = "";

const result = document.getElementById("result");
const returnDiv = document.getElementById("returnDiv");