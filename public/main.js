

focusInputField();
addDescription();

let keyRequest = true;
let costSum = 0;

async function generateResponse(type, text = "") {
    console.log("");
    console.log("GENERATE RESPONSE - Start");

    keyRequest = true;
    responseCost = 0;
    stopRandomTimer();

    if (firstAction) {
        clearResults();
        firstAction = false;
    }


    // TEXT
    if (type == "text") {
        console.log("GENERATE RESPONSE - Type Text");
        startLoading();
        if (text != "") {
            await buildText(text);
        }
        else if (inputField.value != "") {
            await buildText();
        }
        ending();
    }

    // IMAGES
    if (type == "images" && inputField.value != "") {
        console.log("GENERATE RESPONSE - Type Images");
        startLoading();
        await buildImages();
        ending();
    }

    // TRANSCRIPT
    if (type == "audio") {
        console.log("GENERATE RESPONSE - Type Audio");
        if (isRecording) {
            startLoading();
            buildTranscript();
        }
        else if (!isRecording) {
            await buildTranscript();
            ending();
        }
    }

    // VOICE
    if (type == "voice") {
        console.log("GENERATE RESPONSE - Type Voice");
        startLoading();
        await buildVocie();
        ending();
    }


    function ending() {
        console.log("");
        console.log("GENERATE RESPONSE - ENDING");
        isRecording = false;
        costSum = costSum + responseCost;
        addReturnText("", "Cost sum: " + (responseCost).toFixed(2) + " / " + (costSum).toFixed(2) + " Cents");
        endLoading();
        outputDivider();
    }
}

let inputValue = "";

async function buildText(text = "", isForwarded = false) {
    console.log("");
    console.log("BUILD TEXT - Start");

    let message = {};
    let textResult = "";
    let inputValueOld = "";
    inputValue = inputField.value;

    addInitialLog("Text", keyRequest);
    keyRequest = false;

    if (text == "" && inputValue != "") {
        outputText("header", "Input");
        outputText("link", inputValue);

        if (translate) {
            addReturnText("", "... forwarding to Translation");
            inputValueOld = inputValue;
            inputValue = await translateToLanguage(inputValue);

            outputText("noLink", "<span class='tBold'>Translation</span>");
            outputText("link", inputValue);
        }
    }

    // Push to Conversation History
    if (!isForwarded && text != pushLLMessageConstructed) {
        if (text != "") {
            message = ({ role: "User", message: text });
        }
        else if (inputValue != "") {
            message = ({ role: "User", message: inputValue });
        }
        conversationHistory.push(message);
        console.log("BUILD TEXT - Conversation History: ", conversationHistory);
    }

    // Random Personality
    // if (llmPersonalityDOM.value == llmPersonalityRandom && !changePersonalityAuto) {
    //     llmPersonalityDOM.value = llmPersonalityRandom;
    // }

    // LLM Chooses Personality
    if (changePersonalityAuto || llmPersonalityDOM.value == llmPersonalityRandom && !isForwarded) {
        if (changePersonalityAuto) {
            const newPersonalityResult = await generateText(systemPromptPersonality, JSON.stringify(conversationHistory), nOfTokensPersonality, false);
            llmPersonalityDOM.value = newPersonalityResult.responseText;
        }

        systemPrompt = generateSystemPrompt(llmPersonalityDOM.value);
    }

    textResult = await generateText(systemPrompt, text, nOfTokens, true);

    // Add Answer to Conversation History - Add Personality to Asnwer - Output Text
    if (!isForwarded) {
        message = ({ role: "AI", message: textResult.responseText });
        conversationHistory.push(message);

        let manipulatedOutput = "";
        for (i = 0; i < pesonalityMarkers.length; i++) {
            if (pesonalityMarkers[i].personality == hiddenPersonality) {
                manipulatedOutput = "<span class='tBold'>".concat(pesonalityMarkers[i].marker, "</span><br>", textResult.responseTextFormatted);
            }
        }

        if (manipulatedOutput == "") {
            manipulatedOutput = textResult.responseTextFormatted;
        }

        // if (llmPersonalityDOM.value == llmPersonalityRandom || changePersonalityAuto) {
        //     for (i = 0; i < pesonalityMarkers.length; i++) {
        //         if (pesonalityMarkers[i].personality == hiddenPersonality) {
        //             manipulatedOutput = "<span class='tBold'>".concat(pesonalityMarkers[i].marker, "</span><br>", textResult.responseTextFormatted);
        //         }
        //     }
        // }
        // else {
        //     manipulatedOutput = textResult.responseTextFormatted;
        // }

        outputText("header", "Large Language Model");
        outputText("link", manipulatedOutput);
    }

    if (voiceLLM && !isForwarded) {
        addReturnText("", "... forwarding to Voice");
        await buildVocie(textResult.responseText, true, textResult.llmExag);
    }
    if (imgWithText && !isForwarded) {
        addReturnText("", "... forwarding to Prompt Generation");
        console.log("");
        console.log("BUILD TEXT - Conversation History: ", conversationHistory);
        const imgPromptResult = await generateText(systemPromptIMG, JSON.stringify(conversationHistory), nOfTokensIMG, false);
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

    outputIMGs(imgResult.responseIMGs, imgResult.text);
}

async function buildTranscript() {
    let transcriptResult = "";

    if (!isRecording) {
        addInitialLog("Transcript", keyRequest);
        keyRequest = false;

        outputText("header", "Transcript");

        transcriptResult = await generateRecording();

        if (translate) {
            outputText("link", transcriptResult.text);
            outputText("noLink", "<span class='tBold'>Translation</span>");
            addReturnText("", "... forwarding to Translation");
            transcriptResult.text = await translateToLanguage(transcriptResult.text);
        }

        outputText("link", transcriptResult.text);

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


    if (text == "") {
        text = inputField.value;
        outputText("header", "Voice");
        outputText("link", text);
    }

    text = formatForSpeech(text);

    await generateSpeechFromText(text, newFile, exag, itteration);
}


let responseCost = 0;

async function generateText(systemPromptToSend = "", text = "", nOfTokens = 10, buildHistory = false) {
    console.log("");
    console.log("GENERATE TEXT - Start");

    let inputText = inputValue;
    if (text != "") { inputText = text; }

    let responseText
    text = promptPre.concat(inputText);

    try {
        responseText = await fetchText(systemPromptToSend, text, nOfTokens, buildHistory);
        console.log("");
    } catch (error) {
        addReturnText("<div class='material-symbols-outlined returnIcons cRed'>close</div>", " ERROR");
        console.log("AI RESPONSE ERROR:");
        console.error(error);
    }

    let llmExag = cbExaggeration;
    if (systemPromptToSend != systemPromptIMG && systemPromptToSend != systemPromptPersonality) {
        console.log("GENERATE TEXT - Response Generate Text Length: ", responseText.length);
        llmExag = responseText.slice(0, 3);
        console.log("GENERATE TEXT - Exaggeration Extract: ", llmExag);
        responseText = responseText.slice(4, responseText.length);
        console.log("GENERATE TEXT - Cut Text Length: ", responseText.length);
    }

    let responseTextFormatted = formatAIanswer(responseText);
    responseText = formatToText(responseText);

    console.log("GENERATE TEXT - responseText:" + responseText);
    console.log("GENERATE TEXT - responseTextFormatted:" + responseTextFormatted);

    return { inputText, responseText, responseTextFormatted, llmExag };
}


async function fetchText(systemPromptToSend, prompt, tokens, buildHistory) {
    console.log("");
    console.log("FETCH TEXT - Start");

    const data = {
        systemPrompt: systemPromptToSend,
        prompt: prompt,
        tokens: tokens,
        model: model,
        buildHistory: buildHistory,
        personality: hiddenPersonality
    };

    let modelName

    if (data.model == textModel1) {
        modelName = "GPT4.1 mini";
    }
    else if (data.model == textModel2) {
        modelName = "GPT4.1";
    }

    addReturnText("", "...  " + modelName + ": Generating Text");

    const options = {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
    };

    // console.log("RECORDING - Fetch Text Data: ", data);
    // console.log("RECORDING - "Fetch Text Options: ", options);

    try {
        const responseAI = await fetch("/createAItext", options);
        const jsonAI = await responseAI.json();

        addReturnText("<div class='material-symbols-outlined returnIcons cGreen'>done</div>", " " + (jsonAI.cost).toFixed(2) + " Cents");

        responseCost = responseCost + parseFloat(jsonAI.cost);

        // console.log("Return Fetch Text: ", jsonAI.data);

        return jsonAI.data;
    } catch (error) {
        addReturnText("<div class='material-symbols-outlined returnIcons cRed'>close</div>", " ERROR");
        console.log("AI RESPONSE ERROR:");
        console.error(error);
    }
}

async function generateImages(text, imgModel) {
    console.log("");
    console.log("IMAGES - Generating Images");

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

            const options = {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(imgData)
            };

            for (i = 0; i < nIMGsTemp; i++) {
                try {
                    const responseAI = await fetch("/createAIimages", options);
                    const jsonAI = await responseAI.json();

                    console.log("IMAGES - Response:");
                    console.log("IMAGES - Amount: " + jsonAI.data.length + " Images");
                    console.log("IMAGES - Imagepaths:" + jsonAI.data);

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
        return;
    }
}

let mediaRecorder;
let currentStream;

async function generateRecording() {
    console.log("");

    if (!isRecording) {
        console.log("RECORDING - Start");

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
                // outputAudio(URL.createObjectURL(audio), false);
                const transcript = await generateTranscript(audio);
                resolve(transcript);
            };
        });

    }
    else if (isRecording) {
        console.log("RECORDING - Stop");

        mediaRecorder.stop();
        currentStream.getTracks().forEach(track => track.stop());

        button3.querySelector("p").innerHTML = buttonText.toString();
        button3.style.backgroundColor = "var(--buttonBakckground)";
    }
}

async function generateTranscript(audio) {
    addReturnText("", "...  Whisper: Transcribing Audio");
    console.log("");
    console.log("TRANSCRIPT - Starting Transcription");

    const formData = new FormData();
    formData.append("audio", audio, "input.wav");

    try {
        const res = await fetch("/transcribeAudio", {
            method: "POST",
            body: formData
        });

        const result = await res.json();
        result.text = formatToText(result.text);

        console.log("TRANSCRIPT - from Whisper:", result.text);
        console.log("TRANSCRIPT - Audio Path:", result.audioPath);

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
    console.log("");
    console.log("VOICE - Starting Voice Generation");

    itteration++;

    try {
        // Form Data
        const formData = new FormData();

        formData.append("voiceModel", modelVoice)

        if (cbValues.sendAudioSample) {
            formData.append("voiceSample", audioSampleFile.files[0]);
            if (audioSampleFile.files[0]) {
                console.log("VOICE - Audiosample Path:", audioSampleFile.files[0].name);
            }
        }

        if (text.length > (voiceSliceCharackters + voiceSliceCharacktersOverlap)) {
            if (nOfFiles == 0) {
                nOfFiles = Math.ceil(text.length / voiceSliceCharackters);
                outputText("noLink", "Generating " + (nOfFiles - (itteration - 1)) + " Voicefiles");
            }

            textTemp = text.slice((voiceSliceCharackters));
            text = text.slice(0, (voiceSliceCharackters + voiceSliceCharacktersOverlap));
            console.log("VOICE - Text: " + text);
            console.log("VOICE - Text Later: " + textTemp);

        }
        formData.append("text", text);
        formData.append("newFile", JSON.stringify(newFile));

        if (modelVoice == voiceModel1) {
            formData.append("zonosOptions", JSON.stringify(zonosOptions));
            console.log("VOICE - zonosOptions: " + JSON.stringify(zonosOptions));
        }

        else if (modelVoice == voiceModel2) {
            if (exag > 0) {
                formData.append("exaggeration", exag);
                console.log("VOICE - Exaggeration: " + exag);
            }
            else {
                formData.append("exaggeration", cbValues.cbExaggeration);
                console.log("VOICE - Exagxaggeration: " + cbValues.cbExaggeration);
            }

            // formData.append("pase", cbValues.cbPase);                    //Manual set Pase
            let tempPase = Math.round(text.length / 15) / 100;
            if (tempPase < 0.05) { tempPase = 0.05 };
            formData.append("pase", tempPase);
            console.log("VOICE - Pase: " + tempPase);

            formData.append("temperature", cbValues.cbTemperature);
            console.log("VOICE - Temperature: " + cbValues.cbTemperature);
        }

        // Fetch
        const res = await fetch("/generateSpeech", {
            method: "POST",
            body: formData,
        });

        const result = await res.json();
        console.log("VOICE - Result Audiopath:", result.audioPath);

        if (nOfFiles <= 1 && itteration == 1) {
            outputAudio(result.audioPath, { autoplay: true });
            addReturnText("<div class='material-symbols-outlined returnIcons cGreen'>done</div>", " 0.00 Cents");
        }
        else if (nOfFiles > 1) {
            if (itteration == 1) {
                outputAudio(result.audioPath, { autoplayQueue: true });
            }
            else if (itteration > 1) {
                outputAudio(result.audioPath, { addToQueue: true });
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

async function translateToLanguage(text, targetLanguage = "en") {
    console.log("");
    console.log("TRANSLATE - Start");

    console.log("TRANSLATE - Trget Language:", targetLanguage);
    console.log("TRANSLATE - Text to translate:", text);

    if (text != "") {
        const data = {
            text: text,
            targetLanguage: targetLanguage
        };

        try {
            const response = await fetch("/translateText", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data)
            });
            const jsonAI = await response.json();

            console.log("TRANSLATE - Translation:", jsonAI);

            return jsonAI;
        } catch (error) {
            console.error("TRANSLATE - AI RESPONSE ERROR:", error);
        }
    }
}