

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
        { url: "./images/startImage1.png" },
        { url: "./images/startImage2.png" },
        { url: "./images/startImage3.png" },
        { url: "./images/startImage4.png" }
    ], "Prompt used to generate images");
    outputText("noLink", "<span class='tBold'>Tipp:</span> Click on any picture to view fullscreen.");
}

function outputText(type, text) {
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
        let newText = document.createElement("p");
        newText.classList.add("resultIMGprompt");
        newText.innerHTML = "Prompt: ".concat(text);

        result.appendChild(newText);
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
            newIMG.src = imgArray[i].url;

            let newIMGdiv = document.createElement("div");
            newIMGdiv.classList.add("resultIMGs");

            newIMGdiv.appendChild(newIMG);
            newA.appendChild(newIMGdiv);
            newIMGsContainer.appendChild(newA);


            let newAXL = document.createElement("a");
            newAXL.classList.add("resultIMGlinkXL");

            let newIMGXL = document.createElement("img");
            newIMGXL.classList.add("resultIMGXL");
            newIMGXL.src = imgArray[i].url;

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

function outputAudio(path, autoplay) {
    let newAudio = document.createElement("audio");
    newAudio.classList.add("resultAudio");
    newAudio.src = path;
    if (autoplay) {
        newAudio.autoplay = true;
    }
    newAudio.controls = true;
    newAudio.volume = 0.75;

    result.appendChild(newAudio);
    resultPage.scrollTop = resultPage.scrollHeight;
}

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
    logoIMG.style.display = "none";
    loadingIMG.style.display = "inherit";
}

function endLoading() {
    loadingIMG.style.display = "none";
    logoIMG.style.display = "inherit";
}

function addInitialLog(text, firstLine) {
    if (firstLine) {
        addReturnText("", "&nbsp;");
    }
    addReturnText("", "AI request send for: " + text + " ...");
}

function focusInputField() {
    if (isMobile()) {
        // console.log("\n   ... Mobile Device detected: No Focus\n\n");
        inputField.blur();
    }
    else {
        // console.log("\n   ... Desktop Device detected: Focus\n\n");
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
        // text = text.replace(/[.,!?:;]/g, "");
        // text = text.replace(/\n/g, "");
        // text = text.replace(/../g, ".");
        // text = text.replace(/1/g, "1.");

        text = text.replace(/\n/g, "<br>");

        console.log("Formatted AI Text: " + text);

        return text;
    } catch (error) {
        console.log(text);
        console.error(error);
    }
}

function formatToText(inputText) {
    let text = inputText;

    try {
        text = text.replace(/<br>/g, " ")
            // .replace(/[.,!?:;]/g, "")
            // .replace(/\n/g, "")
            // .replace(/../g, ".")
            // .replace(/1/g, "1.")
            // .replace(/<br>/g, "\n")
            .replace(/\<[^>]*\>/g, "")
            .replace(/ä/g, "&auml;")
            .replace(/ö/g, "&ouml;")
            .replace(/ü/g, "&uuml;")
            .replace(/Ä/g, "&Auml;")
            .replace(/Ö/g, "&Ouml;")
            .replace(/Ü/g, "&Uuml;")
            .replace(/ß/g, "&szlig;");

        console.log("Formatted Text: " + text);

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

        console.log("AI Models:");
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