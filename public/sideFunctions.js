

let firstInitiateRandomMessage = true;
let randomTimerID = null;
let randomTimerRunning = false;

function userInactive(time = 0) {
    if (llmRandom && !randomTimerRunning) {
        if (firstInitiateRandomMessage) {
            randomTimer(randomStartTime);
        }
        else {
            console.log("... Starting RandomTimer with " + (time / 1000).toFixed(2) + "s");
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
            console.log("ID-" + randomTimerID + " ... Random Timer initialised");
            firstInitiateRandomMessage = false;
        }
        else {
            console.log("ID-" + randomTimerID + " ... Initiating Conversation - Message: " + pushLLMessageConstructed);
            console.log("ID-" + randomTimerID + " ... Generating TEXT");
            console.log("");
            generateResponse("text", pushLLMessageConstructed);
        }

        console.log("ID-" + randomTimerID + " ... Wait Timr for next Call set to: " + randomTimeInMinutes + "m (" + (randomNumber / 1000).toFixed(2) + "s)");
        console.log("ID-" + randomTimerID + " --- DONE");

        userInactive(randomNumber);
    }, randomNumber);
    console.log("");
    console.log("ID-" + randomTimerID + " --- START RANDOM FUNCTION --- planned for in " + (randomNumber / 1000).toFixed(2) + "s");
}

function stopRandomTimer() {
    if (randomTimerID != null) {
        firstInitiateRandomMessage = true;
        randomStartTime = randomStartTimeValue;
        randomTimerRunning = false;
        clearTimeout(randomTimerID);

        console.log("ID-" + randomTimerID + " ... Random Timer Cleared / RandomStartTimer set to: " + randomStartTime + " / LLM Random: " + llmRandom);

        randomTimerID = null;
    }
}

const resultPage = document.getElementById("resultContainer");

function addDescription() {
    addReturnText("", "Description loaded!");

    outputText("header", "Description:");
    outputText("noLink", "<span class='tBold'>Shortcuts:</span><br>"
        + "- <span class='tInBold'>Shift + Enter:</span> Generate Text from Input<br>"
        + "- <span class='tInBold'>Ctrl + Enter:</span> Transcribe Audio<br>"
        + "- <span class='tInBold'>Shift + Alt + Enter:</span> Generate Images<br>"
        + "- <span class='tInBold'>Strg + Backspace:</span> Clear Results<br>"
        + "- <span class='tInBold'>Strg + Plus:</span> Console log GPT Models");
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
    outputText("header", "Assistant Examples:");
    outputText("noLink", "<span class='tBold'>Useful</span>");
    outputAudio("./audio/Useful.wav");
    outputText("noLink", "<span class='tBold'>Sarcastic & Nihilistic</span>");
    outputAudio("./audio/SarcasticAndNihilistic.wav");
    outputText("noLink", "<span class='tBold'>Playful & Positive</span>");
    outputAudio("./audio/PlayfulAndPositive.wav");
    outputText("noLink", "<span class='tBold'>Romantic</span>");
    outputAudio("./audio/Romantic.wav");
    outputText("noLink", "<span class='tBold'>Getting Real</span>");
    outputAudio("./audio/GettingReal.wav");
    outputText("noLink", "<span class='tBold'>Albert Einstein</span>");
    outputAudio("./audio/AlbertEinstein.wav");
    outputText("noLink", "<span class='tBold'>Sam Altman</span>");
    outputAudio("./audio/SamAltman.wav");
    resultPage.scrollTop = "0px";
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
            Tip("<div class='tooltip'>In Eingabefeld kopieren</div>", BORDERWIDTH, 0, BGCOLOR, "rgba(0,0,0,0)", ABOVE, true, CENTERMOUSE, true, DELAY, 1000, OFFSETX, 85, OFFSETY, 5);
        });

        newA.addEventListener("mouseout", (event) => {
            event.preventDefault;
            UnTip();
        });

        function copyToInput(text) {
            inputField.value = formatToText(text);
        }
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

    resultPage.scrollTop = resultPage.scrollHeight;
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
        resultPage.scrollTop = resultPage.scrollHeight;
    }
}

let audioItteration = -1;
let autoplayQueues = [];

function outputAudio(path, { autoplay = false, autoplayQueue = false, addToQueue = false } = {}) {
    let newAudioDiv = document.createElement("div");
    newAudioDiv.classList.add("resultAudioDiv");

    let newAudio = document.createElement("audio");
    newAudio.classList.add("resultAudio");
    newAudio.src = path;
    if (autoplay) {
        newAudio.autoplay = true;
    }
    if (autoplayQueue || addToQueue) {
        if (autoplayQueue) {
            audioItteration++;
            console.log("");
            console.log("Audio Itterater: " + audioItteration++);
            newAudio.autoplay = true;
        }
        if (!autoplayQueues[audioItteration]) {
            autoplayQueues[audioItteration] = [];
        }
        autoplayQueues[audioItteration].push(newAudio);

        newAudio.addEventListener('ended', () => {
            playAduioQueue(newAudio, audioItteration);
        });
    }
    newAudio.controls = true;
    newAudio.volume = 0.75;

    newAudioDiv.appendChild(newAudio);
    result.appendChild(newAudioDiv);
    resultPage.scrollTop = resultPage.scrollHeight;
}

let audioSearchItteration = 0;

function playAduioQueue(currentAudio, placeInQueue) {
    for (let i = 0; i < autoplayQueues[placeInQueue].length; i++) {
        if (autoplayQueues[placeInQueue][i] == currentAudio) {
            if (autoplayQueues[placeInQueue][i + 1]) {
                console.log("Audio Found on Place: " + (i + 1) + " - Queue Place: " + placeInQueue);
                autoplayQueues[placeInQueue][i + 1].currentTime = 0;
                autoplayQueues[placeInQueue][i + 1].play();
                audioSearchItteration = 0;
                break;
            } else {
                console.log("Place: " + (i) + " - Queue Place: " + placeInQueue + "\nEnd reached - Waiting for next Audio");
                audioSearchItteration++
                if (audioSearchItteration < 20) {
                    setTimeout(() => { playAduioQueue(currentAudio, placeInQueue); }, 1000);
                }
                else {
                    audioSearchItteration = 0;
                }
            }
            // autoplayQueues[placeInQueue][i].currentTime = 0;
            // autoplayQueues[placeInQueue][i].play();
            // break;
        }
    }
}

// “The Clockmaker’s Bird” In a quiet town nestled between fog-wrapped hills, an old clockmaker lived in solitude. His shop smelled of oil and old wood, ticking filled the air like whispers of time itself. People rarely visited anymore. The town had grown fond of digital silence. One rainy morning, the clockmaker found a broken music box on his doorstep. It was shaped like a birdcage, delicate brass twisted into vines and feathers. Inside sat a silent mechanical bird - its eyes dulled, its wings frozen in rust. He took it in with the reverence of a priest holding a forgotten relic. For days, he worked with trembling hands and magnifying glasses, polishing gears, rewinding springs, breathing old songs into the quiet metal. At last, one evening, the bird moved. It fluttered once, then sang - just once - a clear, aching note. The sound echoed like something remembered from a dream. The next day, the clockmaker was gone. His shop stood open, the birdcage on the counter, ticking faintly, softly glowing from within. Some say he left to find the place the song had come from. Others believe the bird was never a machine at all - but a key. A door. And the old man, tired of fixing time, had finally slipped between its cracks.


function outputDivider() {
    let newText = document.createElement("div");
    newText.classList.add("resultDivider");

    result.appendChild(newText);
}

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

function startLoading() {
    controlHide.style.display = "inherit";
    isLoading = true;
    logoIMG.style.display = "none";
    loadingIMG.style.display = "inherit";
}

function endLoading() {
    stopRandomTimer();
    userInactive(randomStartTime);
    controlHide.style.display = "none";
    isLoading = false;
    loadingIMG.style.display = "none";
    logoIMG.style.display = "inherit";
}

function addInitialLog(text, firstLine) {
    if (firstLine) {
        addReturnText("", "&nbsp;");
    }
    addReturnText("", "<span class='tBold'>AI request send for: " + text + " ...</span>");
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

function clearResults() {
    result.innerHTML = "";
    firstAction = true;
    addReturnText("", "&nbsp;");
    addReturnText("", "--- CLEAR ---");
}


// Third Functions

function formatAIanswer(inputText) {
    let text = inputText;

    try {
        text = text.replace(/\n/g, "<br>")
            .replace(/—/g, " - ")
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

function isMobile() {
    return /Android|iPhone/i.test(navigator.userAgent)
}

async function getAImodels() {
    try {
        const responseAI = await fetch("/getAImodels");
        const jsonAI = await responseAI.json();
        const aiObject = jsonAI.responseObject;

        console.log("\n\nAI Models:");
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