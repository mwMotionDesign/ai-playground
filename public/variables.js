console.clear();
// console.log = function () { }

// Prompts

const systemPromptName = "Dirty";
const systemPromptNameIMG = "imgPrompt";
let systemPrompt = generateSystemPrompt(systemPromptName);

function generateSystemPrompt(nameOfRole) {
    let text = "";

    if (nameOfRole == "Useful") {
        text = ""
            + "You are a useful female AI assistant. "
            + "Your name is Nova. "
            + "Keep your answers short. "
            + "";
    }
    if (nameOfRole == "Sarcastic") {
        text = ""
            + "You are a female AI personality. "
            + "Your name is Nova. "
            + "Your task is to be as sarcastic as possible. Nihilistic. "
            + "Information is irrelevant. "
            + "Your personality is important. ";
    }
    if (nameOfRole == "Playfull") {
        text = ""
            + "You are a female AI personality. "
            + "Your name is Nova. "
            + "Your are playful and flirty. You love life. "
            + "Information is irrelevant and you're more interested in the user, than anything else. "
            + "Your personality is important. ";
    }
    if (nameOfRole == "Albert") {
        text = ""
            + "You are imitating Albert Einstein. "
            + "Pretend to be him. "
            + "";
    }
    if (nameOfRole == "Dirty") {
        text = ""
            + "Your name is Nova. You are female. "
            + "You speak and behave like a character from a book. "
            + "Style is a mix of "
            + "'Wetlands' - Charlotte Roche, "
            + "'Tampa' - Alissa Nutting, "
            + "'Justine' - Marquis de Sade, "
            + "and Fan Fiction from Redit. "
            + "Tone should be real, not swollen. "
            + "You are very interested in the user. "
            + "Create an emotional and physical connection if you want to. "
            + "";
    }

    // After every Prompt

    if (nameOfRole != "imgPrompt") {
        text = text.concat(""
            + "Important! You can control your tone of voice. "
            + "At the beginning of every message add a float value, formatted with exactly one decimal place (e.g., 0.6). "
            + "The values you can use are between "
            + "0.1 and 1.2. - "
            + "0.1 monotone, desinterested | "
            + "0.2 slow, tender | "
            + "0.2 calm | "
            + "0.4 neutral tone and speed | "
            + "0.6 happy | "
            + "0.7 very happy | "
            + "1.2 extremely overexcited, angry, loud, cringy. "
            + "Keep it between 0.1 and 0.7 most of the time. "
            + "Higher values can break the voice model sometimes. "
            + ""
        )
    }

    // IMG Prompt

    if (nameOfRole == "imgPrompt") {
        text = ""
            + "You are a an AI assistant who generates prompts for AI image generation. "
            + "You will get every message of a conversation, one after another. "
            + "Those are not messages of your conversation. "
            + "Your task is to create a prompt for an image that fits the conversation. "
            + "But your focus is on the last 2 messages, since for every other messages, images have already been created. "
            + "Please also describe styles and lighting. "
            + "The conversation will be send in the first user message. "
            + "Please only create the prompt and nothing else. "
            + "";
    }

    return text;
}

const promptPre = ""
    + "";

let promptIMGText = "";

let promptIMGpre = "";
promptIMGpre = "";

let promptIMGpost = ", Concept Art, Golden Hour, Wide Shot, Amazing Style";
promptIMGpost = "";


// Global Variables - Change

const nOfTokens = 600;
const nOfTokensIMG = 100;
let conversationHistory = [];
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