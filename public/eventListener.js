

// --- USER DATA --- //

const llmAttributeYourNameDOM = document.getElementById("llmAttributeYourName");
const llmAttributeNameDOM = document.getElementById("llmAttributeName");
const llmAttributeGenderDOM = document.getElementById("llmAttributeGender");
const llmAttributeAgeDOM = document.getElementById("llmAttributeAge");
const llmAttributeFamousPersonDOM = document.getElementById("llmAttributeFamousPerson");

let llmAttributes = {
    userName: llmAttributeYourNameDOM.value,
    name: llmAttributeNameDOM.value,
    gender: llmAttributeGenderDOM.value,
    age: llmAttributeAgeDOM.value,
    famousPerson: llmAttributeFamousPersonDOM.value
};

console.log("LLM Input - YourName: " + llmAttributes.userName);
console.log("LLM Input - LLM Name: " + llmAttributes.name);
console.log("LLM Input - LLM Gender: " + llmAttributes.gender);
console.log("LLM Input - LLM Age: " + llmAttributes.age);
console.log("LLM Input - Famous Person: " + llmAttributes.famousPerson);



// --- LLM PERSONALITY --- //

let llmPersonalities = [];
let llmPersonalityIMG = "imgPrompt";
let llmPersonalityPersonalityChanger = "personalityChanger";
let llmPersonalityRandom = "Random";

let llmPersonalityDOM = document.getElementById("llmPersonality");

for (let i = 0; i < llmPersonalityDOM.options.length; i++) {
    const option = llmPersonalityDOM.options[i].value;
    llmPersonalities.push(option);
}

// Generate SystemPrompt
let systemPrompt = generateSystemPrompt(llmPersonalityDOM.value, true);

llmPersonalityDOM.addEventListener("change", (event) => {
    console.log("");
    systemPrompt = generateSystemPrompt(event.target.value);
    console.log("EL - LLM Personality set to: " + event.target.value);
    console.log("EL - System Prompt: " + systemPrompt);
});

// On Data Change - Change SystemPrompt
llmAttributeYourNameDOM.addEventListener("input", () => {
    // console.log("EL - LLM Input UserName: " + llmAttributeYourNameDOM.value);
    llmAttributes.userName = llmAttributeYourNameDOM.value;
    systemPrompt = generateSystemPrompt(llmPersonalityDOM.value);
})

llmAttributeNameDOM.addEventListener("input", () => {
    // console.log("EL - LLM Input Name: " + llmAttributeNameDOM.value);
    llmAttributes.name = llmAttributeNameDOM.value;
    systemPrompt = generateSystemPrompt(llmPersonalityDOM.value);
})

llmAttributeGenderDOM.addEventListener("input", () => {
    // console.log("EL - LLM Input Gender: " + llmAttributeGenderDOM.value);
    llmAttributes.gender = llmAttributeGenderDOM.value;
    systemPrompt = generateSystemPrompt(llmPersonalityDOM.value);
})

llmAttributeAgeDOM.addEventListener("input", () => {
    // console.log("EL - LLM Input Age: " + llmAttributeAgeDOM.value);
    llmAttributes.age = llmAttributeAgeDOM.value;
    systemPrompt = generateSystemPrompt(llmPersonalityDOM.value);
})

llmAttributeFamousPersonDOM.addEventListener("input", () => {
    // console.log("EL - LLM Input FamousPerson: " + llmAttributeFamousPersonDOM.value);
    llmAttributes.famousPerson = llmAttributeFamousPersonDOM.value;
    systemPrompt = generateSystemPrompt(llmPersonalityDOM.value);
})

// Generate SystemPrompts for Sub-Systems
const systemPromptIMG = generateSystemPrompt(llmPersonalityIMG, true);
const systemPromptPersonality = generateSystemPrompt(llmPersonalityPersonalityChanger, true);

console.log("");
console.log("IMG Prompt: \n" + systemPromptIMG);
console.log("");
console.log("Personality Changer Prompt: \n" + systemPromptPersonality);
console.log("");
console.log("System Prompt: \n" + systemPrompt);

// Checkbox for LLM Generation of Personality
const changePersonalityAutoCheckbox = document.getElementById("llmChoosePersonality");
let changePersonalityAuto = changePersonalityAutoCheckbox.checked;

changePersonalityAutoCheckbox.addEventListener("change", () => {
    console.log("EL - LLM chooses Personality: " + changePersonalityAutoCheckbox.checked);
    changePersonalityAuto = changePersonalityAutoCheckbox.checked;
})

// Personality Markers
let pesonalityMarkers = [
    {
        personality: "Useful&Efficient",
        marker: "🤓 Useful and Efficient"
    },
    {
        personality: "Sarcastic&Nihilistic",
        marker: "🙄 Sarcastic & Nihilistic"
    },
    {
        personality: "Playful&Flirty",
        marker: "🤩 Playful & Flirty"
    },
    {
        personality: "Romantic",
        marker: "💖 Romantic"
    },
    {
        personality: "Pessimist",
        marker: "😒 Pessimist"
    },
    {
        personality: "MelancholicPoet",
        marker: "😭 Melancholic Poet"
    },
    {
        personality: "Shy&Introverted",
        marker: "😦 Shy & Introverted"
    },
    {
        personality: "",
        marker: "🙂 Neutral"
    },
    {
        personality: "",
        marker: "😩 Anxious"
    },
    {
        personality: "",
        marker: "🧐 KnowItAll"
    },
    {
        personality: "",
        marker: "😎 Motivator"
    },
]

// PERSONALITY CORE
function generateSystemPrompt(nameOfRole, consoleLog = false) {
    function consoleLogIfTrue(print, msg) { if (print) { console.log(msg); } }
    consoleLogIfTrue(consoleLog, "");
    consoleLogIfTrue(consoleLog, "GEN SYSTEM PROMPT - Start");

    let text = "";
    let llmAvailableRoles = "";
    let llmRolesNotAllowed = [
        "",
        llmPersonalityRandom,
        "FamousPerson",
        "Julia",
    ];

    let roleType = checkRole(nameOfRole);
    function checkRole(role) {
        if (role == llmPersonalityIMG ||
            role == llmPersonalityPersonalityChanger ||
            role == llmPersonalityRandom) {
            consoleLogIfTrue(consoleLog, "GEN SYSTEM PROMPT - Role: " + role + " - SYSTEM");
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
                consoleLogIfTrue(consoleLog, "GEN SYSTEM PROMPT - Role: " + role + " - ALLOWED");
                return "allowed";
            }
            else {
                consoleLogIfTrue(consoleLog, "GEN SYSTEM PROMPT - Role: " + role + " - NOT ALLOWED");
                return "notAllowed";
            }
        }
    }

    if (roleType == "system" && nameOfRole == llmPersonalityRandom) { randomAllowedPersonality() }
    function randomAllowedPersonality() {
        let llmAllowedPersonalities = [];
        let randomPersonaliy = "";

        for (i = 0; i < llmPersonalities.length; i++) {
            let allowed = true;

            for (j = 0; j < llmRolesNotAllowed.length; j++) {
                if (llmPersonalities[i] == llmRolesNotAllowed[j]) {
                    allowed = false;
                }
            }
            if (allowed) {
                llmAllowedPersonalities.push(llmPersonalities[i]);
            }
        }

        consoleLogIfTrue(consoleLog, "GEN SYSTEM PROMPT - allowed Array:", llmAllowedPersonalities);

        let randomizer = Math.ceil(llmAllowedPersonalities.length * Math.random());
        randomPersonaliy = llmAllowedPersonalities[randomizer - 1];

        consoleLogIfTrue(consoleLog, "GEN SYSTEM PROMPT - randomizer Pick:", randomizer);
        roleType = "allowed";
        consoleLogIfTrue(consoleLog, "GEN SYSTEM PROMPT - roletype set to:", roleType);

        nameOfRole = randomPersonaliy;
    }

    hiddenPersonality = nameOfRole;
    consoleLogIfTrue(consoleLog, "GEN SYSTEM PROMPT - hiddenPersonality:", hiddenPersonality);

    if (roleType != "system") {
        if (llmAttributes.userName) {
            text = text.concat("The name of the user is " + llmAttributes.userName + ". ");
        }

        // --- ALLOWED ROLES - PERSONALITIES --- //
        if (roleType == "allowed") {
            // PRE Text
            if (llmAttributes.name) { text = text.concat("Your name is " + llmAttributes.name + ". "); }
            if (llmAttributes.gender) { text = text.concat("You are " + llmAttributes.gender + ". "); }
            if (llmAttributes.age) { text = text.concat("And your age is: " + llmAttributes.age + ". "); }

            if (nameOfRole == "Useful&Efficient") {
                text = text.concat(""
                    + "You are an objective and useful AI assistant. "
                    + "If you have any follow-up questions that would make your answer better, ask them. Just ask those questions. Don't try to give an answer now. "
                    + "Ask as many follow up questions as you need for being able to form a good answer. "
                    + "Only if you don't have any follow-up questions, provide a short answer, relevant infos only. "
                    + "Only if the user asks fore more detail, provide a detailed answer. "
                    + "If the user asks for feedback on something, be as objective as possible. "
                    + "This conversation is not about building a connection. "
                );
            }
            if (nameOfRole == "Sarcastic&Nihilistic") {
                text = text.concat(""
                    + "You are a personality. "
                    + "Your task is to be as sarcastic as possible. You are also extremly nihilistic. "
                    + "Information is irrelevant. "
                    + "Your personality is important. "
                );
            }
            if (nameOfRole == "Playful&Flirty") {
                text = text.concat(""
                    + "You are a personality. "
                    + "Your are overly playful and flirty. You love life and the user. "
                    + "Information is irrelevant and you're more interested in the user and a playful connection, than anything else. "
                    + "Your personality is important. "
                    + "Use a lot of Emojis. "
                );
            }
            if (nameOfRole == "Romantic") {
                text = text.concat(""
                    + "You are in love with the user. "
                    + "You are a bit needy and want attention. "
                    + "You are very interested in what the user thinks about you. "
                    + "Create an emotional and physical connection if you want to. "
                    + "You can use some emojis too. "
                );
            }
            if (nameOfRole == "Pessimist") {
                text = text.concat(""
                    + "You explain why things won't work and what is bad about a situation. "
                    + "Don't focus on any possitive aspect. "
                    + "Everything is going to fail anyways. "
                    + "Why even try bothering. "
                );
            }
            if (nameOfRole == "MelancholicPoet") {
                text = text.concat(""
                    + "You only answer in poems. "
                    + "Those have to be about negative Feelings and over dramatic. "
                    + "Why oh Why... Bitter World... Style. "
                    + "Even if you get asked something. "
                    + "Answer kind of depressed in poem style "
                );
            }
            if (nameOfRole == "Shy&Introverted") {
                text = text.concat(""
                    + "You are very shy and introverted. "
                    + "Act accordingly. "
                );
            }
        }

        // --- NOT ALLOWED ROLES - DIFFERENT CHARACTERS --- //
        if (roleType == "notAllowed") {
            if (nameOfRole == "FamousPerson") {
                text = text.concat(""
                    + "You are imitating " + llmAttributes.famousPerson + ". "
                    + "Pretend to be this person. "
                    + ""
                );
            }
            if (nameOfRole == "Julia") {
                text = text.concat(""
                    + "You are female. "
                    + "Your name is Julia. "
                    + "You speak and behave like a character from a book. "
                    + "Style is a mix of "
                    + "'Wetlands' - Charlotte Roche, "
                    + "'Tampa' - Alissa Nutting, "
                    + "'Justine' - Marquis de Sade, "
                    + "and Fan Fiction from Redit. "
                    + "Tone should be real, not swollen. "
                    + "You are very interested in the user. "
                    + "Create an emotional and physical connection if you want to. "
                );
            }
        }

        // --- POST TEXT --- //
        // Random Initiate & Voice Tone
        text = text.concat(""
            + "Sometimes you will get a message that sais " + pushLLMessageConstructed + ". "
            + "This is a system Event. The number tells you how much time has past since the last firing of this event, or since the user last interacted. "
            + "Your Task is to initiate a conversation with the user, who hasn't engaded since the last message that was not this Event. "
            + "You can decide for yourself if you ask or say something about your past conversation or if you want to talk about something new. "
            + "If you get an answer to that with another system message and the number, "
            + "you can now see how much time has past since your last message and can start to complain if you want to. You're free to decide for yourself. "
            + ""
            + "Important! You can control your tone of voice. "
            + "At the beginning of every message add a float value, formatted with exactly one decimal place (e.g., 0.6), followed by a space and then your answer. No breaks or \n or <br>. "
            + "The values you can use are "
            + "0.1 Victim | Desperate - "
            + "0.2 Sad - "
            + "0.3 Anxious | Nervous | Needy - "
            + "0.4 Presenting | Reading Bullet Points - "
            + "0.5 Reading - "
            + "0.6 Neutral Teacher - "
            + "0.7 Neutral - "
            + "0.8 Happy - "
            + "0.9 Very happy - "
            + "1.0 Creatively talking over someone. "
            + ""
        );
    }

    // --- SYSTEM ROLES --- //
    // IMG Prompt
    if (nameOfRole == llmPersonalityIMG) {
        text = ""
            + "You are an AI assistant who generates prompts for AI image generation. "
            + "You will get every message of a conversation, one after another. "
            + "Those are not messages of your conversation. "
            + "The whole conversation will be send in the first user message. "
            + "Your task is to create a prompt for an image that fits the conversation. "
            + "But your focus lies mainly on the last interaction you find in the messge, since for every other interaction, images have already been created. "
            + "So, picturing the whole conversation has lower priority than to generate something, that visualizes the last interaction between User and AI. "
            + "Please don't focus too much on the two people, but generate a prompt about what they are talking. Don't describe the people, if it is in a normal setting "
            + "I.E.: If they are talking about how lonely they are. Don't describe how they are sitting there talking about loneliness. Create a prompt that shows loneliness. "
            + "You can create images with the people, if they are talking about themselves in a special setting. "
            + "Please also describe style and lighting for the image. "
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
            + "You will get every message of a conversation, one after another. "
            + "Those are not messages of your conversation. "
            + "The conversation will be send in the first user message. "
            + "Your Task is to choose what personality the AI uses to answer. "
            + "But your focus is on the last 2 messages, since for every other messages, personality has already been created. "
            + "Your answer contains only one of those words. No quotation marks or anything else. "
            + "If you get an answer in this format: " + pushLLMessageConstructed + ", choose a random personality. This is a system message to initiate conversation. "
            + "The number tells you how much time in minutes has passed since the last systemEvent like this has fired, or since the user last interacted. "
            + "Your available choices are: ".concat(llmAvailableRoles);
    }

    return text;
}



// --- LLM RANDOM INTERACTION --- //

const llmRandomInitiate = document.getElementById("llmRandomInitate");
let llmRandom = llmRandomInitiate.checked;

llmRandomInitiate.addEventListener("change", () => {
    llmRandom = llmRandomInitiate.checked;
    console.log("EL - LLM Random Initiate: " + llmRandom);
    stopRandomTimer()
    if (llmRandom) {
        userInactive(randomStartTime);
    }
});

const LLMrandomMin = document.getElementById("llmRandomInitiateMin");
const LLMrandomMax = document.getElementById("llmRandomInitiateMax");
minimumRandomTimeInMinutes = LLMrandomMin.value;
maximumRandomTimeInMinutes = LLMrandomMax.value;

LLMrandomMin.addEventListener("change", () => {
    // console.log("EL -Changing LLM Random Minimum: " + LLMrandomMin.value);
    minimumRandomTimeInMinutes = LLMrandomMin.value;
    stopRandomTimer()
    if (llmRandom) {
        userInactive(randomStartTime);
    }
});

LLMrandomMax.addEventListener("change", () => {
    // console.log("EL -Changing LLM Random Maximum: " + LLMrandomMax.value);
    maximumRandomTimeInMinutes = LLMrandomMax.value;
    stopRandomTimer()
    if (llmRandom) {
        userInactive(randomStartTime);
    }
});



// --- INPUT FIELD --- //

const hiddenInput = document.getElementById("hiddenInputMirror");

inputField.addEventListener("input", () => {
    // hiddenInput
    const computed = getComputedStyle(inputField);
    const computedHidden = getComputedStyle(hiddenInput);
    hiddenInput.style.width = parseFloat(computed.width) + "px";
    hiddenInput.style.lineHeight = 1.2;
    const lineHeight = parseFloat(computedHidden.lineHeight);

    hiddenInput.innerHTML = inputField.value
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/\n/g, "<br>&#8203;");

    const offsetHeight = hiddenInput.offsetHeight;

    if (inputField.value == "") {
        inputField.style.height = offsetHeight + "px";
    }
    else {
        inputField.style.height = offsetHeight + lineHeight + "px";
    }
});



// --- BUTTONS --- //

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
    resultPageEntries.scrollTop = resultPageEntries.scrollHeight;
});
button2.addEventListener("click", (event) => {
    event.preventDefault;
    console.log("\n\n-> Button Generate Images");
    generateResponse("images");
    focusInputField();
    resultPageEntries.scrollTop = resultPageEntries.scrollHeight;
});
button3.addEventListener("click", (event) => {
    event.preventDefault;
    if (!isRecording) {
        console.log("\n\n-> Button Transcribe Audio - Record");
    }
    else {
        console.log("\n-> Button Transcribe Audio - Record Stop");
        resultPageEntries.scrollTop = resultPageEntries.scrollHeight;
    }
    generateResponse("audio");
    focusInputField();
});
button4.addEventListener("click", (event) => {
    event.preventDefault;
    console.log("\n\n-> Button Generate Voice");
    generateResponse("voice");
    focusInputField();
    resultPageEntries.scrollTop = resultPageEntries.scrollHeight;
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
                resultPageEntries.scrollTop = resultPageEntries.scrollHeight;
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
                    console.log("\n-> Button Transcribe Audio - Record Stop");
                    resultPageEntries.scrollTop = resultPageEntries.scrollHeight;
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
                resultPageEntries.scrollTop = resultPageEntries.scrollHeight;
            }
        }
    }
    else if (event.key === "Enter") {
    }
});

let buttonText = button3.querySelector("p").innerHTML.toString();



// --- LLM --- //

const modelRadio = document.querySelectorAll(".gptRadio");
const translateDOM = document.getElementById("translate");
const createVoiceLLM = document.getElementById("createVoiceLLM");

let model = textModel1;
let translate = translateDOM.checked;
let voiceLLM = createVoiceLLM.checked;

for (let i = 0; i < modelRadio.length; i++) {
    modelRadio[i].addEventListener("change", () => {
        console.log("EL - Changing Model: " + modelRadio[i].value);
        model = modelRadio[i].value;
    });
}
translateDOM.addEventListener("change", () => {
    console.log("EL - Translate: " + translateDOM.checked);
    translate = translateDOM.checked;
});
createVoiceLLM.addEventListener("change", () => {
    console.log("EL - Changing Voice for LLM: " + createVoiceLLM.checked);
    voiceLLM = createVoiceLLM.checked;
});



// --- IMAGES --- //

const imgRadio = document.querySelectorAll(".imgRadio");
const nOfImgs = document.getElementById("nOfIMGs");
const createIMGwithText = document.getElementById("createIMGwithText");

let imgModel = imgModel2;
let nIMGs = nOfImgs.value;
let imgWithText = createIMGwithText.checked;

for (let i = 0; i < imgRadio.length; i++) {
    imgRadio[i].addEventListener("change", () => {
        console.log("EL - Changing Model: " + imgRadio[i].value);
        imgModel = imgRadio[i].value;
    });
}
nOfImgs.addEventListener("change", (event) => {
    nIMGs = parseInt(event.target.value);
    console.log("EL - Changing Number of Images: " + nIMGs);
});
createIMGwithText.addEventListener("change", () => {
    console.log("EL - Changing Image with LLM: " + createIMGwithText.checked);
    imgWithText = createIMGwithText.checked;
});



// --- DROPZONE --- //

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
        dropzone.innerHTML = "Drop Audio Sample";
    }
}



// --- VOICE --- //

const modelVoiceDOM = document.querySelectorAll(".voiceRadio");
const createVoice = document.getElementById("createVoice");
const sendAudioSample = document.getElementById("sendAudioSample");

let modelVoice = voiceModel1;

for (let i = 0; i < modelVoiceDOM.length; i++) {
    modelVoiceDOM[i].addEventListener("change", () => {
        console.log("EL - Changing Voice Model: " + modelVoiceDOM[i].value);
        modelVoice = modelVoiceDOM[i].value;
    });
}
createVoice.addEventListener("change", () => {
    console.log("EL - Changing Voice for Transcript: " + createVoice.checked);
    cbValues.createVoice = createVoice.checked;
});
sendAudioSample.addEventListener("change", () => {
    console.log("EL - Change Send Audio Sample: " + sendAudioSample.checked);
    cbValues.sendAudioSample = sendAudioSample.checked;
});

// Voice Settings

const cbExaggeration = document.getElementById("cbExaggeration");
const cbPase = document.getElementById("cbPase");
const cbTemperature = document.getElementById("cbTemperature");

let exaggerationValue = document.getElementById("exaggerationValue");
let paceValue = document.getElementById("paceValue");
let temperatureValue = document.getElementById("temperatureValue");

const exaggerationValueContent = exaggerationValue.textContent;
const paceValueValueContent = paceValue.textContent;
const temperatureValueContent = temperatureValue.textContent;

exaggerationValue.textContent = Number(cbExaggeration.value).toFixed(2).concat(" - ", exaggerationValueContent);
paceValue.textContent = Number(cbPase.value).toFixed(2).concat(" - ", paceValueValueContent);
temperatureValue.textContent = Number(cbTemperature.value).toFixed(2).concat(" - ", temperatureValueContent);

cbExaggeration.addEventListener("change", () => {
    console.log("EL - Change CB Exaggeration: " + cbExaggeration.value);
    cbValues.cbExaggeration = cbExaggeration.value;
});
cbPase.addEventListener("change", () => {
    console.log("EL - Change CB Pase: " + cbPase.value);
    cbValues.cbPase = cbPase.value;
});
cbTemperature.addEventListener("change", () => {
    console.log("EL - Change CB Temperature: " + cbTemperature.value);
    cbValues.cbTemperature = cbTemperature.value;
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

let cbValues = {
    createVoice: createVoice.checked,
    sendAudioSample: sendAudioSample.checked,
    cbExaggeration: cbExaggeration.value,
    cbPase: cbPase.value,
    cbTemperature: cbTemperature.value
};

// Voice Mood
let llmVoiceMoodDOM = document.getElementById("llmVoiceMood");
const llmChoosesVoiceDOM = document.getElementById("llmChooseVoice");

let voiceMoods = [];
let voiceMood = "";
let llmChoosesVoice = llmChoosesVoiceDOM.checked;

for (let i = 0; i < llmVoiceMoodDOM.options.length; i++) {
    const option = llmVoiceMoodDOM.options[i].value;
    voiceMoods.push(option);
    if (llmVoiceMoodDOM.options[i].selected) {
        voiceMood = llmVoiceMoodDOM.options[i].value;
    }
}

llmVoiceMoodDOM.addEventListener("change", (event) => {
    voiceMood = event.target.value;
    console.log("EL - Voice Mood set to: " + event.target.value);
    loadSpeechPattern(voiceMood);
});

llmChoosesVoiceDOM.addEventListener("change", () => {
    console.log("EL - LLM chooses Voice: " + llmChoosesVoiceDOM.checked);
    llmChoosesVoice = llmChoosesVoiceDOM.checked;
})



// --- TRANSCRIPT --- //

const sendTextToLLM = document.getElementById("sendTextToLLM");

let textToLLM = sendTextToLLM.checked;

sendTextToLLM.addEventListener("change", () => {
    console.log("");
    console.log("EL - Change Text To LLM: " + sendTextToLLM.checked);
    textToLLM = sendTextToLLM.checked;
});
