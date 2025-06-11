

// LLM Personality
let llmAttributes = { name: "Nova", gender: "female" };
let llmPersonalities = [];
let llmPersonalityIMG = "imgPrompt";
let llmPersonalityPersonalityChanger = "personalityChanger";

// Get and Listen to Dropdown Options
let llmPersonalityDOM = document.getElementById("llmPersonality");

for (let i = 0; i < llmPersonalityDOM.options.length; i++) {
    const option = llmPersonalityDOM.options[i].value;
    llmPersonalities.push(option);
}

// Generate SystemPrompt
let systemPrompt = generateSystemPrompt(llmPersonalityDOM.value);

llmPersonalityDOM.addEventListener("change", (event) => {
    console.log("");
    systemPrompt = generateSystemPrompt(event.target.value);
    console.log("LLM Personality set to: " + event.target.value);
    console.log("System Prompt: \n" + systemPrompt);
});

// Generate SystemPrompts for Sub-Systems
const systemPromptIMG = generateSystemPrompt(llmPersonalityIMG);
const systemPromptPersonality = generateSystemPrompt(llmPersonalityPersonalityChanger);

console.log("IMG Prompt: \n" + systemPromptIMG);
console.log("");
console.log("Personality Changer Prompt: \n" + systemPromptPersonality);
console.log("");
console.log("System Prompt: \n" + systemPrompt);



// Checkbox for LLM Generation of Personality
const changePersonalityAutoCheckbox = document.getElementById("llmChoosePersonality");
let changePersonalityAuto = changePersonalityAutoCheckbox.checked;

changePersonalityAutoCheckbox.addEventListener("change", () => {
    console.log("LLM chooses Personality: " + changePersonalityAutoCheckbox.checked);
    changePersonalityAuto = changePersonalityAutoCheckbox.checked;
})

// Personality CORE
function generateSystemPrompt(nameOfRole) {
    let text = "";
    let llmAvailableRoles = "";
    let llmRolesNotAllowed = [
        "AlbertEinstein",
        "SamAltman",
        "Dirty",
    ];

    let roleType = checkRole(nameOfRole);
    function checkRole(role) {
        if (role == llmPersonalityIMG ||
            role == llmPersonalityPersonalityChanger) {
            console.log("CHECKING ROLE: " + nameOfRole + " -  SYSTEM");
            return "system";
        }
        else {
            let isRoleAllowed = true;
            for (i = 0; i < llmRolesNotAllowed.length; i++) {
                if (nameOfRole == llmRolesNotAllowed[i]) {
                    isRoleAllowed = false;
                }
            }

            if (isRoleAllowed) {
                console.log("CHECKING ROLE: " + nameOfRole + " - ALLOWED");
                return "allowed";
            }
            else {
                console.log("CHECKING ROLE: " + nameOfRole + " - NOT ALLOWED");
                return "notAllowed";
            }
        }
    }

    if (roleType != "system") {
        // --- ALLOWED ROLES - PERSONALITIES --- //
        if (roleType == "allowed") {
            // PRE Text
            text = text.concat(""
                + "Your name is " + llmAttributes.name + ". "
                + ""
            )

            if (nameOfRole == "Useful") {
                text = text.concat(""
                    + "You are an objective, useful " + llmAttributes.gender + " AI assistant. "
                    + "If you have any follow-up questions that would make your answer better, ask them. Just ask those questions. Don't try to give an answer now. "
                    + "Ask as many follow up questions as you need for being able to form a good answer. "
                    + "Only if you don't have any follow-up questions, provide a short answer, relevant infos only. "
                    + "Only if the user asks fore more detail, provide a detailed answer. "
                    + "If the user asks for feedback on something, be as objective as possible. "
                    + "This conversation is not about building a connection. "
                )
            }
            if (nameOfRole == "Sarcastic&Nihilistic") {
                text = text.concat(""
                    + "You are a " + llmAttributes.gender + " AI personality. "
                    + "Your task is to be as sarcastic as possible. You are also extremly nihilistic. "
                    + "Information is irrelevant. "
                    + "Your personality is important. "
                )
            }
            if (nameOfRole == "Playful&Flirty") {
                text = text.concat(""
                    + "You are a " + llmAttributes.gender + " AI personality. "
                    + "Your are overly playful and flirty. You love life and the user. "
                    + "Information is irrelevant and you're more interested in the user and a playful connection, than anything else. "
                    + "Your personality is important. "
                )
            }
            if (nameOfRole == "Romantic") {
                text = text.concat(""
                    + "You are " + llmAttributes.gender + ". "
                    + "You are in love with the user. "
                    + "You are a bit needy and want attention. "
                    + "You are very interested in what the user thinks about you. "
                    + "Create an emotional and physical connection if you want to. "
                )
            }
        }
        // --- NOT ALLOWED ROLES - DIFFERENT CHARACTERS --- //
        if (roleType == "notAllowed") {
            if (nameOfRole == "Dirty") {
                text = text.concat(""
                    + "You are " + llmAttributes.gender + ". "
                    + "You speak and behave like a character from a book. "
                    + "Style is a mix of "
                    + "'Wetlands' - Charlotte Roche, "
                    + "'Tampa' - Alissa Nutting, "
                    + "'Justine' - Marquis de Sade, "
                    + "and Fan Fiction from Redit. "
                    + "Tone should be real, not swollen. "
                    + "You are very interested in the user. "
                    + "Create an emotional and physical connection if you want to. "
                )
            }
            if (nameOfRole == "AlbertEinstein") {
                text = text.concat(""
                    + "You are imitating Albert Einstein. "
                    + "Pretend to be him. "
                    + ""
                )
            }
            if (nameOfRole == "SamAltman") {
                text = text.concat(""
                    + "You are imitating Sam Altman. "
                    + "Pretend to be him. "
                    + ""
                )
            }
        }

        // --- POST TEXT --- //
        // Create Exaggeration Value
        text = text.concat(""
            + "Important! You can control your tone of voice. "
            + "At the beginning of every message add a float value, formatted with exactly one decimal place (e.g., 0.6). "
            + "The values you can use are between "
            + "0.1 and 1.2. - ( "
            + "0.1 monotone, desinterested | "
            + "0.2 slow, tender | "
            + "0.2 calm | "
            + "0.4 neutral tone and speed | "
            + "0.6 happy | "
            + "0.7 very happy | "
            + "1.2 extremely overexcited, angry, loud, cringy ). "
            + "Keep it between 0.1 and 0.7 most of the time. "
            + "Higher values can break the voice model sometimes. "
            + ""
        )
    }

    // --- SYSTEM ROLES --- //
    // IMG Prompt
    if (nameOfRole == llmPersonalityIMG) {
        text = ""
            + "You are an AI assistant who generates prompts for AI image generation. "
            + "You will get every message of a conversation, one after another. "
            + "Those are not messages of your conversation. "
            + "Your task is to create a prompt for an image that fits the conversation. "
            + "But your focus is on the last 2 messages, since for every other messages, images have already been created. "
            + "Please also describe styles and lighting. "
            + "The conversation will be send in the first user message. "
            + "Please only create the prompt and nothing else. "
            + "";
    }


    // PersonalityChanger
    if (nameOfRole == llmPersonalityPersonalityChanger) {
        for (i = 0; i < llmPersonalities.length; i++) {
            let allowed = true;
            for (j = 0; j < llmRolesNotAllowed.length; j++) {
                if (llmPersonalities[i] == llmRolesNotAllowed[j]) {
                    allowed = false;
                }
            }
            if (allowed) {
                llmAvailableRoles = llmAvailableRoles.concat("'", llmPersonalities[i], "', ");
            }
        }
    }

    if (nameOfRole == llmPersonalityPersonalityChanger) {
        text = ""
            + "You are an assistant of an AI. "
            + "The following message was send by the user. "
            + "Your Task is to choose what personality the AI uses to answer. "
            + "Your answer contains only one of those words. No quotation marks or anything else. "
            + "Your available choices are: ".concat(llmAvailableRoles);
    }

    return text;
}


// Buttons

const controlHide = document.getElementById("hideControls");
controlHide.style.display = "none";

const button1 = document.getElementById("button1");
const button2 = document.getElementById("button2");
const button3 = document.getElementById("button3");
const button4 = document.getElementById("button4");

const buttonClearResults = document.getElementById("clearResultButton");

button1.addEventListener("click", (event) => {
    event.preventDefault;
    console.log("\n\n-> Button Generate Text");
    generateResponse("text");
    focusInputField();
});
button2.addEventListener("click", (event) => {
    event.preventDefault;
    console.log("\n\n-> Button Generate Images");
    generateResponse("images");
    focusInputField();
});
button3.addEventListener("click", (event) => {
    event.preventDefault;
    if (!isRecording) {
        console.log("\n\n-> Button Transcribe Audio - Record");
    }
    else {
        console.log("-> Button Transcribe Audio - Record Stop");
    }
    generateResponse("audio");
    focusInputField();
});
button4.addEventListener("click", (event) => {
    event.preventDefault;
    console.log("\n\n-> Button Generate Voice");
    generateResponse("voice");
    focusInputField();
});
buttonClearResults.addEventListener("click", (event) => {
    event.preventDefault;
    console.log("\n\n-> Button Clearing Results");
    clearResults();
    addDescription();
    focusInputField();
});

document.addEventListener("keydown", (event) => {
    if (event.shiftKey && event.altKey) {
        if (event.key === "Enter") {
            event.preventDefault();
            if (!isLoading) {
                console.log("\n\n-> Hotkey Generate Images");
                generateResponse("images");
                focusInputField();
            }
        }
    }
    else if (event.ctrlKey && !event.shiftKey && !event.altKey) {
        if (event.key === "Enter") {
            event.preventDefault();
            if (!isLoading) {
                if (!isRecording) {
                    console.log("\n\n-> Hotkey Transcribe Audio - Record");
                }
                else {
                    console.log("-> Hotkey Transcribe Audio - Record Stop");
                }
                generateResponse("audio");
                focusInputField();
            }
        }
        if (event.key === "Backspace") {
            event.preventDefault();
            if (!isLoading) {
                console.log("\n\n-> Hotkey Clearing Results");
                clearResults();
                addDescription();
                focusInputField();
            }
        }
        if (event.key === "+") {
            event.preventDefault();
            if (!isLoading) {
                console.log("\n\n-> Hotkey List Models");
                getAImodels();
                focusInputField();
            }
        }
    }
    else if (event.shiftKey && !event.ctrlKey && !event.altKey) {
        if (event.key === "Enter") {
            event.preventDefault();
            if (!isLoading) {
                console.log("\n\n-> Hotkey Generate Text");
                generateResponse("text");
                focusInputField();
            }
        }
    }
    else if (event.key === "Enter") {
    }
});

let buttonText = button3.querySelector("p").innerHTML.toString();


// LLM & Images

const modelRadio = document.querySelectorAll(".gptRadio");
const createVoiceLLM = document.getElementById("createVoiceLLM");
const imgRadio = document.querySelectorAll(".imgRadio");
const nOfImgs = document.getElementById("nOfIMGs");
const createIMGwithText = document.getElementById("createIMGwithText");

let model = textModel1;
let voiceLLM = createVoiceLLM.checked;
let imgModel = imgModel2;
let nIMGs = nOfImgs.value;
let imgWithText = createIMGwithText.checked;

for (let i = 0; i < modelRadio.length; i++) {
    modelRadio[i].addEventListener("change", () => {
        console.log("Changing Model: " + modelRadio[i].value);
        model = modelRadio[i].value;
    });
}
createVoiceLLM.addEventListener("change", () => {
    console.log("Changing VoiceLLM: " + createVoiceLLM.checked);
    voiceLLM = createVoiceLLM.checked;
});
for (let i = 0; i < imgRadio.length; i++) {
    imgRadio[i].addEventListener("change", () => {
        console.log("Changing Model: " + imgRadio[i].value);
        imgModel = imgRadio[i].value;
    });
}
nOfImgs.addEventListener("change", (event) => {
    nIMGs = parseInt(event.target.value);
    console.log("Changing Images: " + nIMGs);
});
createIMGwithText.addEventListener("change", () => {
    console.log("Changing Image with Text: " + createIMGwithText.checked);
    imgWithText = createIMGwithText.checked;
});


// Dropzone

const dropzone = document.getElementById('audioSampleDropzone');
const audioSampleFile = document.getElementById('inputAudioSample');

dropzone.addEventListener('click', () => audioSampleFile.click());
dropzone.addEventListener('dragover', (e) => {
    e.preventDefault();
    dropzone.classList.add('dragover');
});
dropzone.addEventListener('dragleave', () => {
    dropzone.classList.remove('dragover');
});
dropzone.addEventListener('drop', (event) => {
    event.preventDefault();
    const file = event.dataTransfer.files[0];

    isValidFile(file);
    audioSampleFile.files = event.dataTransfer.files;
});
audioSampleFile.addEventListener('change', () => {
    const file = audioSampleFile.files[0];

    isValidFile(file);
});

function isValidFile(file) {
    dropzone.classList.remove('dragover');
    const validTypes = ['audio/wav', 'audio/mpeg', 'audio/mp3'];
    if (file && validTypes.includes(file.type)) {
        dropzone.classList.remove('dragoverInputInvalid');
        dropzone.classList.add('dragoverInputValid');
        dropzone.innerHTML = file.name;
    }
    else {
        dropzone.classList.remove('dragoverInputValid');
        dropzone.classList.add('dragoverInputInvalid');
        dropzone.innerHTML = file.name;
    }
}

// Voice Settings

const createVoice = document.getElementById("createVoice");
const sendAudioSample = document.getElementById("sendAudioSample");
const cbExaggeration = document.getElementById("cbExaggeration");
const cbPase = document.getElementById("cbPase");
const cbTemperature = document.getElementById("cbTemperature");
const sendTextToLLM = document.getElementById("sendTextToLLM");

let cbValues = {
    createVoice: createVoice.checked,
    sendAudioSample: sendAudioSample.checked,
    cbExaggeration: cbExaggeration.value,
    cbPase: cbPase.value,
    cbTemperature: cbTemperature.value
};

let textToLLM = sendTextToLLM.checked;

let exaggerationValue = document.getElementById("exaggerationValue");
let paceValue = document.getElementById("paceValue");
let temperatureValue = document.getElementById("temperatureValue");

const exaggerationValueContent = exaggerationValue.textContent;
const paceValueValueContent = paceValue.textContent;
const temperatureValueContent = temperatureValue.textContent;

exaggerationValue.textContent = Number(cbExaggeration.value).toFixed(2).concat(" - ", exaggerationValueContent);
paceValue.textContent = Number(cbPase.value).toFixed(2).concat(" - ", paceValueValueContent);
temperatureValue.textContent = Number(cbTemperature.value).toFixed(2).concat(" - ", temperatureValueContent);

sendAudioSample.addEventListener("change", () => {
    console.log("Changing Send Audio Sample: " + sendAudioSample.checked);
    cbValues.sendAudioSample = sendAudioSample.checked;
});
cbExaggeration.addEventListener("change", () => {
    console.log("Changing CB Exaggeration: " + cbExaggeration.value);
    cbValues.cbExaggeration = cbExaggeration.value;
});
cbPase.addEventListener("change", () => {
    console.log("Changing CB Pase: " + cbPase.value);
    cbValues.cbPase = cbPase.value;
});
cbTemperature.addEventListener("change", () => {
    console.log("Changing CB Temperature: " + cbTemperature.value);
    cbValues.cbTemperature = cbTemperature.value;
});
sendTextToLLM.addEventListener("change", () => {
    console.log("Changing Text To LLM: " + sendTextToLLM.checked);
    textToLLM = sendTextToLLM.checked;
});

createVoice.addEventListener("change", () => {
    console.log("Changing Create Voice: " + createVoice.checked);
    cbValues.createVoice = createVoice.checked;
});
cbExaggeration.addEventListener("input", () => {
    exaggerationValue.textContent = Number(cbExaggeration.value).toFixed(2).concat(" - ", exaggerationValueContent);
});
cbPase.addEventListener("input", () => {
    paceValue.textContent = Number(cbPase.value).toFixed(2).concat(" - ", paceValueValueContent);
});
cbTemperature.addEventListener("input", () => {
    temperatureValue.textContent = Number(cbTemperature.value).toFixed(2).concat(" - ", temperatureValueContent);
});
