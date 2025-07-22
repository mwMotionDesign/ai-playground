

// --- RANDOM INITIATE --- //

let firstInitiateRandomMessage = true;
let randomTimerID = null;
let randomTimerRunning = false;

function userInactive(time = 0) {
    if (llmRandom && !randomTimerRunning) {
        console.log("");
        console.log("RANDOM TIMER - Start");

        if (firstInitiateRandomMessage) {
            randomTimer(randomStartTime);
        }
        else {
            console.log("RANDOM TIMER - Starting Timer with " + (time / 1000).toFixed(2) + "s");
            randomTimer(time);
            randomTimerRunning = true;
        }
    }
};

function randomTimer(randomNumber) {
    randomTimerID = setTimeout(() => {
        pushLLMessageConstructed = "[" + pushLLMmessage + " | " + randomTimeInMinutes + "m]";

        randomNumber = (Math.random() * 60000 * (maximumRandomTimeInMinutes - minimumRandomTimeInMinutes)) + (60000 * minimumRandomTimeInMinutes);
        randomStartTime = Math.ceil(randomNumber);;
        randomTimeInMinutes = (randomNumber / 60000).toFixed(2);

        if (firstInitiateRandomMessage) {
            console.log("RANDOM TIMER - ID-" + randomTimerID + " ... Random Timer initialised");
            firstInitiateRandomMessage = false;
        }
        else {
            console.log("RANDOM TIMER - ID-" + randomTimerID + " ... Initiating Conversation - Message: " + pushLLMessageConstructed);
            console.log("RANDOM TIMER - ID-" + randomTimerID + " ... Generating TEXT");
            generateResponse("text", pushLLMessageConstructed);
        }

        console.log("RANDOM TIMER - ID-" + randomTimerID + " ... Wait Timr for next Call set to: " + randomTimeInMinutes + "m (" + (randomNumber / 1000).toFixed(2) + "s)");
        console.log("RANDOM TIMER - ID-" + randomTimerID + " --- DONE");

        userInactive(randomNumber);
    }, randomNumber);
    console.log("");
    console.log("RANDOM TIMER - ID-" + randomTimerID + " --- START RANDOM FUNCTION --- planned for in " + (randomNumber / 1000).toFixed(2) + "s");
}

function stopRandomTimer() {
    if (randomTimerID != null) {
        firstInitiateRandomMessage = true;
        randomStartTime = randomStartTimeValue;
        randomTimerRunning = false;
        clearTimeout(randomTimerID);

        console.log("RANDOM TIMER - ID-" + randomTimerID + " ... Random Timer Cleared / RandomStartTimer set to: " + randomStartTime + " / LLM Random: " + llmRandom);

        randomTimerID = null;
    }
}

const resultPage = document.getElementById("resultContainer");
const resultPageEntries = document.getElementById("result");



// --- OUTPUT RESULTS --- //

function addDescription() {
    addReturnText("", "Description loaded!");

    outputText("header", "Description:");
    outputText("noLink", "<span class='tBold'>Shortcuts:</span><br>"
        + "- <span class='tInBold'>Shift + Enter:</span> Generate Text from Input<br>"
        + "- <span class='tInBold'>Ctrl + Enter:</span> Transcribe Audio<br>"
        + "- <span class='tInBold'>Shift + Alt + Enter:</span> Generate Images<br>"
        + "- <span class='tInBold'>Ctrl + Backspace:</span> Clear Results<br>"
        + "- <span class='tInBold'>Ctrl + Plus:</span> Console log GPT Models");
    outputDivider();

    outputText("header", "Example Format:");
    outputText("link", "<span class='tInBold'>Bold:</span> Link Text.<br>"
        + "- Click me to send to Input");
    outputText("noLink", "Here are the generated images:");
    outputIMGs([
        "./images/startImage1.png",
        "./images/startImage2.png",
        "./images/startImage3.png",
        "./images/startImage4.png"
    ], "Prompt used to generate images");
    outputText("noLink", "<span class='tBold'>Tipp:</span> Click on any picture to view fullscreen.");
    outputDivider();
    resultPageEntries.scrollTop = "0px";
}

function outputText(type, text) {
    formatAIanswer(text);

    if (type == "link") {
        let newA = document.createElement("a");
        newA.classList.add("resultLink");

        let newText = document.createElement("p");
        newText.classList.add("resultTextLink");
        newText.innerHTML = text;

        newA.appendChild(newText);
        result.appendChild(newA);

        newA.addEventListener("click", (event) => {
            event.preventDefault;
            copyToInput(text);
            UnTip();
            // generateAIresponse("ideas");
        });

        newA.addEventListener("mouseover", (event) => {
            event.preventDefault;
            Tip("<div class='tooltip'>Copy to Input</div>", BORDERWIDTH, 0, BGCOLOR, "rgba(0,0,0,0)", ABOVE, true, CENTERMOUSE, true, DELAY, 0, OFFSETX, 75, OFFSETY, 10);
        });

        newA.addEventListener("mouseout", (event) => {
            event.preventDefault;
            UnTip();
        });
    }
    else if (type == "header") {
        let newText = document.createElement("p");
        newText.classList.add("resultTextHeader");
        newText.innerHTML = text;

        result.appendChild(newText);
    }
    else if (type == "noLink") {
        let newText = document.createElement("p");
        newText.classList.add("resultTextNoLink");
        newText.innerHTML = text;

        result.appendChild(newText);
    }
    else if (type == "imgPrompt") {
        let newDetails = document.createElement("details");
        newDetails.classList.add("resultIMGprompt");

        let newSummary = document.createElement("summary");
        newSummary.classList.add("resultIMGpromptSummary");
        newSummary.innerHTML = "Show Prompt";

        let newText = document.createElement("p");
        newText.classList.add("resultIMGpromptText");
        newText.innerHTML = text;

        newDetails.appendChild(newSummary);
        newDetails.appendChild(newText);
        result.appendChild(newDetails);
    }

    resultPageEntries.scrollTop = resultPageEntries.scrollHeight;
}

function outputIMGs(imgArray, imgPrompt) {
    if (imgArray.length > 0) {
        let newIMGsContainer = document.createElement("div");
        newIMGsContainer.classList.add("resultIMGsContainer");

        for (let i = 0; i < imgArray.length; i++) {
            let newA = document.createElement("a");
            newA.classList.add("resultIMGlink");

            let newIMG = document.createElement("img");
            newIMG.classList.add("resultIMG");
            newIMG.src = "../".concat(imgArray[i]);

            let newIMGdiv = document.createElement("div");
            newIMGdiv.classList.add("resultIMGs");

            newIMGdiv.appendChild(newIMG);
            newA.appendChild(newIMGdiv);
            newIMGsContainer.appendChild(newA);


            let newAXL = document.createElement("a");
            newAXL.classList.add("resultIMGlinkXL");

            let newIMGXL = document.createElement("img");
            newIMGXL.classList.add("resultIMGXL");
            newIMGXL.src = imgArray[i];

            let newIMGdivXL = document.createElement("div");
            newIMGdivXL.classList.add("resultIMGsXL");

            newIMGdivXL.appendChild(newIMGXL);
            newAXL.appendChild(newIMGdivXL);
            result.appendChild(newAXL);


            newA.addEventListener("click", (event) => {
                event.preventDefault;
                newAXL.style.display = "inherit";
            });

            newAXL.addEventListener("click", (event) => {
                event.preventDefault;
                newAXL.style.display = "none";
            });
        }

        result.appendChild(newIMGsContainer);

        outputText("imgPrompt", imgPrompt);
        resultPageEntries.scrollTop = resultPageEntries.scrollHeight;
    }
}

let queueItterator = -1;
let autoplayQueues = [];

function outputAudio(path, { autoplay = false, autoplayQueue = false, addToQueue = false } = {}) {
    let newAudioDiv = document.createElement("div");
    newAudioDiv.classList.add("resultAudioDiv");

    let newAudio = document.createElement("audio");
    newAudio.classList.add("resultAudio");
    newAudio.src = path;

    let queueID;

    if (autoplay) {
        newAudio.autoplay = true;
    }
    if (autoplayQueue || addToQueue) {
        if (autoplayQueue) {
            queueItterator++;
            console.log("");
            // console.log("Queue Itterater: " + queueItterator);
            newAudio.autoplay = true;
        }
        queueID = queueItterator;
        // console.log("QueueID: " + queueID);

        if (!autoplayQueues[queueItterator]) {
            autoplayQueues[queueItterator] = [];
        }
        autoplayQueues[queueItterator].push(newAudio);

        newAudio.addEventListener('ended', () => {
            playAduioQueue(newAudio, queueID);
        });
    }
    newAudio.controls = true;
    newAudio.volume = 0.75;

    newAudioDiv.appendChild(newAudio);
    result.appendChild(newAudioDiv);
    resultPageEntries.scrollTop = resultPageEntries.scrollHeight;
}

let audioSearchItteration = 0;

function playAduioQueue(audioFilePath, queueID) {
    for (let i = 0; i < autoplayQueues[queueID].length; i++) {
        if (autoplayQueues[queueID][i] == audioFilePath) {
            if (autoplayQueues[queueID][i + 1]) {
                console.log("AUDIO QUEUE - Audio Found on Queue: " + queueID + " - Place: " + (i + 1));
                autoplayQueues[queueID][i + 1].currentTime = 0;
                autoplayQueues[queueID][i + 1].play();
                audioSearchItteration = 0;
                break;
            } else {
                console.log("AUDIO QUEUE - Audio Found on Queue: " + queueID + " - Place: " + (i + 1) + " - End reached - Waiting for next Audio");
                audioSearchItteration++
                if (audioSearchItteration < audioQueueItterations) {
                    setTimeout(() => { playAduioQueue(audioFilePath, queueID); }, 1000);
                }
                else {
                    audioSearchItteration = 0;
                }
            }
        }
    }
}

function outputDivider() {
    let newText = document.createElement("div");
    newText.classList.add("resultDivider");

    result.appendChild(newText);
}

function clearResults() {
    result.innerHTML = "";
    firstAction = true;
    addReturnText("", "&nbsp;");
    addReturnText("", "--- CLEAR ---");
}



// --- RETURN --- //

function addReturnText(html, text) {
    let newDiv = document.createElement("div");
    newDiv.classList.add("returnTextContainer");

    let newText = document.createElement("p");
    newText.classList.add("returnText");
    newText.innerHTML = text;

    newDiv.innerHTML = html;
    newDiv.appendChild(newText);
    returnDiv.appendChild(newDiv);
}



// --- PROCESS --- //

function startLoading() {
    controlHide.style.display = "inherit";
    isLoading = true;
    logoIMG.style.display = "none";
    loadingIMG.style.display = "inherit";
}

function addInitialLog(text, firstLine) {
    if (firstLine) {
        addReturnText("", "&nbsp;");
    }
    addReturnText("", "<span class='tBold'>AI request send for: " + text + " ...</span>");
}

function endLoading() {
    stopRandomTimer();
    userInactive(randomStartTime);
    controlHide.style.display = "none";
    isLoading = false;
    loadingIMG.style.display = "none";
    logoIMG.style.display = "inherit";
}

function focusInputField() {
    if (isMobile()) {
        inputField.blur();
    }
    else {
        inputField.focus();
        inputField.select();
    }
}

function copyToInput(text) {
    inputField.value = removePersonalityMarkers(formatToText(text));
    inputField.dispatchEvent(new Event("input"));
}

function formatAIanswer(inputText) {
    let text = inputText;

    try {
        text = text.replace(/\n/g, "<br>")
            .replace(/—/g, " - ")
            .replace(/–/g, " - ")
            // .replace(/[.,!?:;]/g, "")
            // .replace(/\n/g, "")
            // .replace(/../g, ".")
            // .replace(/1/g, "1.")
            .trim()
            ;

        return text;
    } catch (error) {
        console.log(text);
        console.error(error);
    }
}

function formatToText(inputText) {
    let text = inputText;

    try {
        text = text
            .replace(/<br>/g, " ")
            // .replace(/<br>/g, "\n")
            .replace(/\<[^>]*\>/g, "")
            .replace(/—/g, " - ")
            .replace(/–/g, " - ")
            .replace(/&auml;/g, "ä")
            .replace(/&ouml;/g, "ö")
            .replace(/&uuml;/g, "ü")
            .replace(/&Auml;/g, "Ä")
            .replace(/&Ouml;/g, "Ö")
            .replace(/&Uuml;/g, "Ü")
            .replace(/&szlig;/g, "ß")
            .replace(/\s+/g, ' ')
            // .replace(/ä/g, "&auml;")
            // .replace(/ö/g, "&ouml;")
            // .replace(/ü/g, "&uuml;")
            // .replace(/Ä/g, "&Auml;")
            // .replace(/Ö/g, "&Ouml;")
            // .replace(/Ü/g, "&Uuml;")
            // .replace(/ß/g, "&szlig;")
            // .replace(/[.,!?:;]/g, "")
            // .replace(/../g, ".")
            // .replace(/1/g, "1.")
            .trim()
            ;

        return text;
    } catch (error) {
        console.log(text);
        console.error(error);
    }
}

function formatForSpeech(inputText) {
    let text = inputText;
    console.log("BEFORE:", text);

    try {
        text = text
            .replace(/\p{Extended_Pictographic}/gu, "")                         // alle Emojis rauswerfen
            // .replace(/\p{Emoji_Modifier_Base}|\p{Emoji_Component}/gu, "")       // optional: Variation Selectors entfernen (z.B. VS16)
            .replace(/\<[^>]*\>/g, "")
            .replace(/—/g, " - ")
            .replace(/–/g, " - ")
            .replace(/&auml;/g, "ä")
            .replace(/&ouml;/g, "ö")
            .replace(/&uuml;/g, "ü")
            .replace(/&Auml;/g, "Ä")
            .replace(/&Ouml;/g, "Ö")
            .replace(/&Uuml;/g, "Ü")
            .replace(/&szlig;/g, "ß")
            .replace(/\s+/g, ' ')
            .trim()
            ;

        console.log("AFTER:", text);
        return text;
    } catch (error) {
        console.log(text);
        console.error(error);
    }
}

function removePersonalityMarkers(inputText) {
    console.log("");
    console.log("REMOVE MARKER - Started");
    let slicedText = "";

    for (i = 0; i < pesonalityMarkers.length; i++) {
        // console.log("REMOVE MARKER - pM: " + pesonalityMarkers[i].marker);
        // console.log("REMOVE MARKER - pMLength: " + pesonalityMarkers[i].marker.length);
        slicedText = inputText.slice(0, pesonalityMarkers[i].marker.length);
        // console.log("REMOVE MARKER - slicedText: " + slicedText);
        if (slicedText == pesonalityMarkers[i].marker) {
            console.log("REMOVE MARKER - Found: " + slicedText);
            inputText = inputText.slice(pesonalityMarkers[i].marker.length + 1);
            console.log("REMOVE MARKER - New Text: " + inputText);
            return inputText;
        }
    }

    console.log("REMOVE MARKER - Done");
    return inputText;
}

let mood = 0;

loadSpeechPattern(voiceMood, false);

function loadSpeechPattern(keyMood, log = true) {
    if (log) { console.log("Changing Voice Mood to: " + keyMood); }

    if (keyMood == "VictimDesperate") {
        mood = 0.9;
        zonosOptions = zonosOptionsStandard;
        zonosOptions.e6 = 1.00;       // Victim / Desperate
    }
    else if (keyMood == "Sad") {
        mood = 0.1;
        zonosOptions = zonosOptionsStandard;
        zonosOptions.e2 = 1.00;       // Sadness
    }
    else if (keyMood == "AnxiousNervousNeedy") {
        mood = 0.7;
        zonosOptions = zonosOptionsStandard;
        zonosOptions.e4 = 1.00;       // Anxious / Nervours / Needy
    }
    else if (keyMood == "PresentingBulltePoints") {
        mood = 0.3;
        zonosOptions = zonosOptionsStandard;
        zonosOptions.e5 = 1.00;       // Presenting / BulletPoints
    }
    else if (keyMood == "Reading") {
        mood = 0.4;
        zonosOptions = zonosOptionsStandard;
        zonosOptions.e8 = 1.00;       // Reading
    }
    else if (keyMood == "NeutralTeacher") {
        mood = 0.3;
        zonosOptions = zonosOptionsStandard;
        zonosOptions.e3 = 1.00;       // Neutral / Teacher
    }
    else if (keyMood == "Neutral") {
        mood = 0.4;
        zonosOptions = zonosOptionsStandard;
        zonosOptions.e1 = 0.30;       // Happiness
    }
    else if (keyMood == "Happy") {
        mood = 0.5;
        zonosOptions = zonosOptionsStandard;
        zonosOptions.e1 = 0.60;       // Happiness
    }
    else if (keyMood == "VeryHappy") {
        mood = 0.6;
        zonosOptions = zonosOptionsStandard;
        zonosOptions.e1 = 1.00;       // Happiness
    }
    else if (keyMood == "CreativeTalkOver") {
        mood = 1.0;
        zonosOptions = zonosOptionsStandard;
        zonosOptions.e7 = 1.00;       // Creative / Talking over
    }

    llmVoiceMoodDOM.value = keyMood;
}


// Third Functions

function isMobile() {
    return /Android|iPhone/i.test(navigator.userAgent)
}

async function getAImodels() {
    console.log("");
    console.log("GET AI MODELS");
    try {
        const responseAI = await fetch("/getAImodels");
        const jsonAI = await responseAI.json();
        const aiObject = jsonAI.responseObject;

        let tempString = "";

        for (let i = 0; i < aiObject.length; i++) {
            tempString = tempString.concat("- ", aiObject[i].model, "\n");
        }

        console.log(tempString);
        console.log("");
    } catch (error) {
        console.log("AI RESPONSE ERROR:");
        console.error(error);
    }
}