

// LLM Personality


let llmPersonalityDOM = document.getElementById("llmPersonality");
let systemPrompt = generateSystemPrompt(llmPersonalityDOM.value);
const systemPromptIMG = generateSystemPrompt("imgPrompt");

console.log("System Prompt set to: " + llmPersonalityDOM.value);

llmPersonalityDOM.addEventListener("change", (event) => {
    systemPrompt = generateSystemPrompt(event.target.value);
    console.log("LLM Personality set to: " + event.target.value);
});

setTimeout(() => {
    llmPersonalityDOM.value = "Playful";
    systemPrompt = generateSystemPrompt(llmPersonalityDOM.value);
    console.log("LLM Personality set to: " + llmPersonalityDOM.value);
}, 5000);


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


// Open AI Settings

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
