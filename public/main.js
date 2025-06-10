

focusInputField();
addDescription();

let keyRequest = true;
let costSum = 0;

async function generateResponse(type) {
    keyRequest = true;
    responseCost = 0;

    if (firstAction) {
        clearResults();
        firstAction = false;
    }


    // TEXT & IMAGES
    if ((type == "text" || type == "images") && inputField.value != "") {
        startLoading();
        if (type == "text") {
            await buildText();
        }

        if (type == "images") {
            await buildImages();
        }
        ending();
    }

    // TRANSCRIPT
    if (type == "audio") {
        if (!isRecording) {
            console.log("--- with !isRcording");
            await buildTranscript();
            ending();
        }
        else if (isRecording) {
            console.log("--- with isRcording");
            startLoading();
            console.log("--- TEST");
            buildTranscript();
        }
    }

    // VOICE
    if (type == "voice") {
        startLoading();
        await buildVocie();
        ending();
    }


    function ending() {
        isRecording = false;
        costSum = costSum + responseCost;
        addReturnText("", "Cost sum: " + (responseCost).toFixed(2) + " / " + (costSum).toFixed(2) + " Cents");
        endLoading();
        outputDivider();
    }
}

async function buildText(text = "", isForwarded = false) {
    let message = {};
    let textResult = "";

    addInitialLog("Text", keyRequest);
    keyRequest = false;

    if (text == "" && inputField.value != "") {
        outputText("header", "Input");
        outputText("link", inputField.value);
    }

    systemPrompt = generateSystemPrompt(systemPromptName);
    textResult = await generateText(systemPrompt, text, nOfTokens, true);

    if (!isForwarded) {
        message = ({ role: "Person 1", message: textResult.inputText });
        conversationHistory.push(message);
        message = ({ role: "Person 2", message: textResult.responseText });
        conversationHistory.push(message);

        outputText("header", "LLM");
        outputText("link", textResult.responseTextFormatted);
    }

    textResult.responseTextFormatted = formatToText(textResult.responseTextFormatted);

    if (voiceLLM && !isForwarded) {
        addReturnText("", "... forwarding to Voice");
        await buildVocie(textResult.responseTextFormatted, true, textResult.llmExag);
    }
    if (imgWithText && !isForwarded) {
        addReturnText("", "... forwarding to Prompt Generation");
        console.log("");
        console.log("Conversation History: ", conversationHistory);
        systemPrompt = generateSystemPrompt(systemPromptNameIMG);
        const imgPromptResult = await generateText(systemPrompt, JSON.stringify(conversationHistory), nOfTokensIMG, false);
        addReturnText("", "... forwarding to Image");
        await buildImages(imgPromptResult.responseText);
    }
}

async function buildImages(text = "") {
    let imgResult = [];
    let imgPrompt = inputField.value;
    if (text != "") {
        imgPrompt = text;
    }

    addInitialLog("Images", keyRequest);
    keyRequest = false;

    imgResult = await generateImages(imgPrompt, imgModel);

    console.log("");
    console.log(imgResult.responseIMGs);
    outputIMGs(imgResult.responseIMGs, imgResult.text);
}

async function buildTranscript() {
    let transcriptResult = "";

    if (!isRecording) {
        addInitialLog("Transcript", keyRequest);
        keyRequest = false;

        outputText("header", "Transcript");

        transcriptResult = await generateRecording();

        outputText("link", transcriptResult.text);
        // outputAudio(transcriptResult.audioPath, false);

        if (cbValues.createVoice) {
            addReturnText("", "... forwarding to Voice");
            await buildVocie(transcriptResult.text, false);
        }
        if (textToLLM) {
            addReturnText("", "... forwarding to LLM");
            await buildText(transcriptResult.text);
        }
    }
    else {
        generateRecording();
        keyRequest = false;
    }
}

async function buildVocie(text = "", newFile = true, exag = -1, itteration = 0) {
    addInitialLog("Voice", keyRequest);
    keyRequest = false;

    // outputText("header", "Voice");

    if (text == "") {
        text = inputField.value;
    }

    await generateSpeechFromText(text, newFile, exag, itteration);
}


let responseCost = 0;

async function generateText(systemPrompt = "", text = "", nOfTokens = 10, buildHistory = false) {
    let textFromLLM = false;
    let inputText = inputField.value;

    if (text != "") {
        textFromLLM = true;
        inputText = text;
    }
    else {
        text = promptPre.concat(inputText);

        let responseText = await fetchText(systemPrompt, text, nOfTokens, buildHistory);

        let llmExag = cbExaggeration;
        if (systemPrompt != generateSystemPrompt(systemPromptNameIMG)) {
            console.log("Response Generate Text Length: " + responseText.length);
            let llmExag = responseText.slice(0, 3);
            console.log("Exaggeration Extract: " + llmExag);
            responseText = responseText.slice(4, responseText.length);
            console.log("Cut Text Length: " + responseText.length);
        }

        let responseTextFormatted = formatAIanswer(responseText);

        return { inputText, responseText, responseTextFormatted, llmExag };
    }
}

async function fetchText(systemPrompt, prompt, tokens, buildHistory) {
    const data = {
        systemPrompt: systemPrompt,
        prompt: prompt,
        tokens: tokens,
        model: model,
        buildHistory: buildHistory
    };

    let modelName

    if (data.model == textModel1) {
        modelName = "GPT4.1 mini";
    }
    else if (data.model == textModel2) {
        modelName = "GPT4.1";
    }

    addReturnText("", "...  " + modelName + ": Generating Text");

    try {
        const options = {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(data)
        };

        console.log("");
        console.log("Fetch Text Data:");
        console.log(data);
        console.log("Fetch Text Options:");
        console.log(options);

        const responseAI = await fetch("/createAItext", options);
        const jsonAI = await responseAI.json();

        addReturnText("<div class='material-symbols-outlined returnIcons cGreen'>done</div>", " " + (jsonAI.cost).toFixed(2) + " Cents");

        responseCost = responseCost + parseFloat(jsonAI.cost);

        console.log("Return Fetch Text: ", jsonAI.data);

        return jsonAI.data;
    } catch (error) {
        addReturnText("<div class='material-symbols-outlined returnIcons cRed'>close</div>", " ERROR");
        console.log("AI RESPONSE ERROR:");
        console.error(error);
    }
}

async function generateImages(text, imgModel) {
    if (text != "") {
        let size = "1024x1024"
        let responseIMGs = [];
        let aspectRatio = "1:1"
        let safetyFilterLevel = "block_only_high"
        let personGeneration = "allow_adult"

        const imgData = {
            imgModel: "",
            prompt: "",
            n: "",
            size: "",
            aspectRatio: "",
            safetyFilterLevel: "",
            personGeneration: ""
        };

        if (nIMGs) {
            imgData.prompt = promptIMGpre.concat(text, promptIMGpost);
            imgData.size = size;
            imgData.n = nIMGs;
            imgData.imgModel = imgModel;
            imgData.aspectRatio = aspectRatio;
            imgData.safetyFilterLevel = safetyFilterLevel;
            imgData.personGeneration = personGeneration;

            addReturnText("", "... " + imgModel + ": Generating Images");

            let nIMGsTemp = nIMGs;

            if (imgModel == "IMAGEN") {
                nIMGsTemp = 1;
            }

            for (i = 0; i < nIMGsTemp; i++) {
                try {
                    const options = {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json"
                        },
                        body: JSON.stringify(imgData)
                    };

                    const responseAI = await fetch("/createAIimages", options);
                    const jsonAI = await responseAI.json();

                    console.log("");
                    console.log("IMG Response:");
                    console.log(jsonAI.data.length + " Images\n");
                    console.log(jsonAI.data);

                    addReturnText("<div class='material-symbols-outlined returnIcons cGreen'>done</div>", " " + (jsonAI.cost).toFixed(2) + " Cents");

                    responseCost = responseCost + parseFloat(jsonAI.cost);

                    responseIMGs.push(...jsonAI.data);
                } catch (error) {
                    addReturnText("<div class='material-symbols-outlined returnIcons cRed'>close</div>", " ERROR");
                    console.log("AI RESPONSE ERROR:");
                    console.error(error);
                }
            }

            return { responseIMGs, text };
        }
    }
    else {
        addReturnText("<div class='material-symbols-outlined returnIcons cRed'>close</div>", "Please enter Image prompt!");
    }
}

let mediaRecorder;
let currentStream;

async function generateRecording() {
    if (!isRecording) {
        let chunks = [];

        currentStream = await navigator.mediaDevices.getUserMedia({ audio: true });
        mediaRecorder = new MediaRecorder(currentStream);

        button3.querySelector("p").innerHTML = "STOP RECORDING";
        button3.style.backgroundColor = "var(--red)";

        mediaRecorder.start(1000);

        isRecording = true;

        return new Promise(async resolve => {
            mediaRecorder.ondataavailable = e => {
                chunks.push(e.data);
            };
            mediaRecorder.onstop = async () => {
                const audio = new Blob(chunks);
                outputAudio(URL.createObjectURL(audio), false);
                const transcript = await generateTranscript(audio);
                resolve(transcript);
            };
        });

    }
    else if (isRecording) {
        mediaRecorder.stop();
        currentStream.getTracks().forEach(track => track.stop());

        button3.querySelector("p").innerHTML = buttonText.toString();
        button3.style.backgroundColor = "var(--buttonBGColor)";
    }
}

async function generateTranscript(audio) {
    addReturnText("", "...  Whisper: Transcribing Audio");

    const formData = new FormData();
    formData.append("audio", audio, "input.wav");

    try {
        const res = await fetch("/transcribeAudio", {
            method: "POST",
            body: formData
        });

        const result = await res.json();
        console.log("");
        console.log("Transkript Whisper:", result.text);
        console.log("Converted Original Audio:", result.audioPath);
        result.text = formatToText(result.text);

        addReturnText("<div class='material-symbols-outlined returnIcons cGreen'>done</div>", " 0.00 Cents");
        return { text: result.text, audioPath: result.audioPath };
    } catch (error) {
        addReturnText("<div class='material-symbols-outlined returnIcons cRed'>close</div>", " ERROR");
        console.log("AI RESPONSE ERROR:");
        console.error(error);
    }
}

let nOfFiles = 0;

async function generateSpeechFromText(text = "", newFile = true, exag = -1, itteration = 0) {
    addReturnText("", "...  Chatterbot: Generating Voice");

    itteration++;

    try {
        // Form Data
        const formData = new FormData();
        console.log("");

        if (cbValues.sendAudioSample) {
            formData.append("voiceSample", audioSampleFile.files[0]);
            if (audioSampleFile.files[0]) {
                console.log("Generate Speech voiceSample:");
                console.log(audioSampleFile.files[0].name);
            }
        }

        if (text.length > voiceSliceCharackters) {
            if (nOfFiles == 0) {
                nOfFiles = Math.ceil(text.length / voiceSliceCharackters);
                outputText("noLink", "Generating " + (nOfFiles - (itteration - 1)) + " Voicefiles");
            }

            textTemp = text.slice(voiceSliceCharackters, text.length);
            text = text.slice(0, voiceSliceCharackters);
            console.log("Generate Speech Text: " + text);
            console.log("Generate Speech Text Later: " + textTemp);

        }
        formData.append("text", text);
        formData.append("newFile", JSON.stringify(newFile));

        if (exag > 0) {
            formData.append("exaggeration", exag);
            console.log("Exaggeration: " + exag);
        }
        else {
            formData.append("exaggeration", cbValues.cbExaggeration);
            console.log("Exagxaggeration: " + cbValues.cbExaggeration);
        }

        // formData.append("pase", cbValues.cbPase);                    //Manual set Pase
        let tempPase = Math.round(text.length / 12) / 100;
        formData.append("pase", tempPase);
        console.log("Pase: " + tempPase);

        formData.append("temperature", cbValues.cbTemperature);
        console.log("Temperature: " + cbValues.cbTemperature);

        // Fetch
        const res = await fetch("/generateSpeech", {
            method: "POST",
            body: formData,
        });

        const result = await res.json();
        console.log("Generate Speech Result Audiopath:", result.audioPath);

        if (nOfFiles <= 1 && itteration == 1) {
            outputAudio(result.audioPath, true);
            addReturnText("<div class='material-symbols-outlined returnIcons cGreen'>done</div>", " 0.00 Cents");
        }
        else if (nOfFiles > 1) {
            if (itteration == 1) {
                outputAudio(result.audioPath, true);
            }
            else if (itteration > 1) {
                outputAudio(result.audioPath, false);
            }

            if (itteration == nOfFiles) {
                addReturnText("<div class='material-symbols-outlined returnIcons cGreen'>done</div>", " 0.00 Cents");
                nOfFiles = 0;
            }
            else {
                await generateSpeechFromText(textTemp, newFile, exag, itteration);
            }
        }
    } catch (error) {
        addReturnText("<div class='material-symbols-outlined returnIcons cRed'>close</div>", " ERROR");
        console.log("AI RESPONSE ERROR:");
        console.error(error);
    }
}