// ES6 IMPORTS
import express from "express";
import { } from "dotenv/config";

import path from "path";
import fs from "fs";
import fsp from 'fs/promises';
import { writeFile } from "fs";
import multer from "multer";
import { fileURLToPath } from "url";
import { spawn } from "child_process";
import fetch from 'node-fetch';
import axios from "axios";

import { Configuration, OpenAIApi } from "openai";
import aiplatform from '@google-cloud/aiplatform';
import { TranslationServiceClient } from '@google-cloud/translate';

import ffmpeg from 'fluent-ffmpeg';
import ffmpegPath from 'ffmpeg-static';



console.log("\n\n\n---------- Server Start! ----------\n\n\n");


// VARIABLES
const textModel1 = "gpt-4.1-mini-2025-04-14";
const textModel2 = "gpt-4.1-2025-04-14";
const imgModel1 = "dall-e-3";
const imgModel2 = "IMAGEN";

// START CODE
const app = express();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(express.static("public"));
app.use('/Images', express.static(path.join(__dirname, 'Images')));
app.use('/Audiofiles', express.static(path.join(__dirname, 'Audiofiles')));
app.use(express.json({ limit: "500kb" }));

// OPEN AI INIT
const aiConfiguration = new Configuration({
    organization: "org-g4dnutBbAzqx2x93GBqErvMy",
    apiKey: process.env.OPEN_AI_KEY
});

const openAI = new OpenAIApi(aiConfiguration);

// GOOGLE CLOUD INIT
const projectId = process.env.CAIP_PROJECT_ID;

// START SERVER

app.listen(process.env.PORT, () => {
    console.log("\n\n\n---------- Server Listening! ----------\n\n\n");
});


// ASYNC FUNCTIONS

//----- TEXT / GPT -----//

const memoryDIR = path.join(__dirname, "Memory");
if (!fs.existsSync(memoryDIR)) { fs.mkdirSync(memoryDIR); }
let sessionFileName = getTimestampFilename(".json");
let sessionFilePath = path.join(memoryDIR, sessionFileName);

app.post("/createAItext", async (request, response) => {
    console.log("");
    console.log("");
    console.log("--- Generating Text ---");

    const data = request.body;

    let aiPrompt = {};

    aiPrompt = {
        model: data.model,
        max_tokens: data.tokens,
        temperature: 0.4,
        top_p: 1,
        presence_penalty: 2,
        frequency_penalty: 2
    }

    aiPrompt.messages = buildMessagesFromSession(sessionFilePath, data.systemPrompt, data.prompt, data.buildHistory);

    console.log("");
    console.log("AI Parameters: ");
    console.log(aiPrompt);

    try {
        let responseAI;
        let aiAnswer;

        responseAI = await openAI.createChatCompletion(aiPrompt);
        let aiResponseAnswer = responseAI.data.choices[0];
        aiAnswer = aiResponseAnswer.message.content;

        // console.log("");
        // console.log("AI Response Usage:");
        // console.log(responseAI.data.usage);

        let cost;

        if (data.model == textModel1) {
            cost = calculateCost(responseAI.data.usage, 0.4, 1.6);
        }
        else if (data.model == textModel2) {
            cost = calculateCost(responseAI.data.usage, 2, 8);
        }

        console.log("");
        console.log("Cost Input: ", cost.costInput);
        console.log("Cost Output: ", cost.costOutput);
        console.log("Cost: ", cost.cost);
        console.log("");
        console.log("AI Response Answer:");
        console.log(aiAnswer);

        response.json({
            status: "200 - Succesful PostRequest",
            data: aiAnswer,
            cost: cost.cost
        });

        if (data.buildHistory) {
            const entry = {
                timestamp: getTimestampFilename(""),
                user: data.prompt,
                ai: aiAnswer,
                personality: data.personality
            };

            saveToSessionFile(sessionFilePath, entry);
        }

        response.end();
    } catch (error) {
        console.log("AI RESPONSE ERROR:");
        if (error.response) {
            console.log(error.response.status);
            console.log(error.response.data);
            console.log(error.response.headers);
        }
        else {
            console.log(error.message);
        }
        response.end();
    }
});

//----- IMAGES / DALL-E / IMAGEN 4 -----//

app.post("/createAIimages", async (request, response) => {
    console.log("");
    console.log("");
    console.log("--- Generating IMG ---");

    const data = request.body;

    data.n = parseFloat(data.n);

    let aiPrompt = {
        imgModel: data.imgModel,
        prompt: data.prompt,
        n: data.n,
        size: data.size,
        aspectRatio: data.aspectRatio,
        safetyFilterLevel: data.safetyFilterLevel,
        personGeneration: data.personGeneration
    }

    console.log("");
    console.log("Prompt:");
    console.log(data.prompt);

    const filename = getTimestampFilename("").concat("_", aiPrompt.imgModel, ".png");
    const imgDIR = "Images/";
    const filePath = imgDIR.concat(filename);
    let generatedImage;

    // Sicherstellen, dass der Ordner existiert
    if (!fs.existsSync('Images')) { fs.mkdirSync('Images'); }

    let cost;

    if (aiPrompt.imgModel == "DALL-E") {
        console.log("");
        console.log("--- DALL-E ---");

        aiPrompt.imgModel = imgModel1;

        let dallePrompt = {
            prompt: aiPrompt.prompt,
            n: 1,
            size: aiPrompt.size
        }

        console.log("");
        console.log("DALLE Prompt");
        console.log(dallePrompt);

        try {
            let responseAI;
            let aiAnswer;

            responseAI = await openAI.createImage(dallePrompt);
            let aiResponseIMGs = responseAI.data.data;
            aiAnswer = aiResponseIMGs;

            if (data.size == "1024x1024") {
                // cost = data.n * 8;
                cost = 8;
            }
            else if (data.size == "1024x1792") {
                // cost = data.n * 12;
                cost = 12;
            }

            console.log("");
            console.log("Cost", cost);
            console.log("");
            console.log("AI Answer:");
            console.log(aiAnswer);

            await downloadImage(aiAnswer[0].url, imgDIR, filename);

            aiAnswer[0] = filePath;

            response.json({
                status: "200 - Succesful PostRequest",
                data: aiAnswer,
                cost: cost
            });

            response.end();
        } catch (error) {
            console.log("AI RESPONSE ERROR:");
            if (error.response) {
                console.log(error.response.status);
                console.log(error.response.data);
                console.log(error.response.headers);
            }
            else {
                console.log(error.message);
            }
            response.end();
        }
    }

    else if (aiPrompt.imgModel == "IMAGEN") {
        console.log("");
        console.log("--- IMAGEN ---");

        aiPrompt.imgModel = imgModel2;

        let imagenPrompt = {
            sampleCount: aiPrompt.n,                                // 1 - 8
            aspectRatio: aiPrompt.aspectRatio,                      // "1:1" | "3:4" | "4:3" | "9:16" | "16:9"
            safetySetting: aiPrompt.safetyFilterLevel,              // "block_low_and_above" | "block_medium_and_above" | "block_only_high"
            personGeneration: aiPrompt.personGeneration,            // "allow_adult" | "dont_allow"
            // includeRaiReason: false,                                // Begründung für Ablehnung von KI - true | false
            // includeSafetyAttributes: false                          // "Death, Harm & Tragedy" | "Firearms & Weapons" | "Hate" | "Health" | "Illicit Drugs" | "Politics" | "Porn" | "Religion & Belief" | "Toxic" | "Violence" | "Vulgarity" | "War & Conflict" | false
        }

        console.log("");
        console.log("IMAGEN Prompt:");
        console.log(imagenPrompt);

        const { v1, helpers } = aiplatform;
        const { PredictionServiceClient } = v1;

        // GCP-Settings
        const location = 'us-central1'; // The region, the model is available at

        const clientOptions = {};
        const predictionServiceClient = new PredictionServiceClient(clientOptions);
        const modelPath = `projects/${projectId}/locations/${location}/publishers/google/models/imagen-4.0-generate-preview-05-20`;

        if (!projectId) {
            throw new Error("CAIP_PROJECT_ID environment variable is not set. Please set it in your .env file.");
        }

        // Not necessary if CGI, but necessary if running on a server || gcloud auth application-default login
        // if (!process.env.GOOGLE_APPLICATION_CREDENTIALS) {
        //     throw new Error("GOOGLE_APPLICATION_CREDENTIALS environment variable is not set. Please set it in your .env file pointing to your service account key.");
        // }

        const instances = { prompt: aiPrompt.prompt };
        const parameters = imagenPrompt;

        try {
            const [imagenResponse] = await predictionServiceClient.predict({
                endpoint: modelPath,
                instances: [helpers.toValue(instances)],
                parameters: helpers.toValue(parameters),
            });

            cost = 0;

            const uris = [];
            let filePathTemp = "";
            let imgURLs = [];
            if (imagenResponse.predictions && imagenResponse.predictions.length > 0) {
                imagenResponse.predictions.forEach((pred, i) => {
                    const b64 = pred.structValue?.fields?.bytesBase64Encoded?.stringValue;
                    if (b64) {
                        generatedImage = Buffer.from(b64, 'base64');
                        filePathTemp = filePath.split(".")[0].concat("_", i, ".", filePath.split(".")[1]);

                        cost += 4;
                        console.log("");
                        console.log("Cost: ", cost);

                        fs.writeFileSync(filePathTemp, generatedImage);

                        console.log("");
                        console.log("Filepth Temp");
                        console.log(filePathTemp);
                        imgURLs.push(filePathTemp)
                        uris.push(`data:image/png;base64,${b64}`); // Oder den öffentlichen URL zum Bild
                    } else {
                        console.warn(`No Base64-Data for prediction ${i}.`);
                    }
                });

                response.json({
                    status: "200 - Succesful PostRequest",
                    data: imgURLs,
                    cost: cost
                });

                console.log("");
                console.log("AI Response:");
                console.log(imgURLs);
                response.end();
            } else {
                console.warn("No images received.");
            }

            return uris;

        } catch (error) {
            console.log("AI RESPONSE ERROR:");
            if (error.response) {
                console.log(error.response.status);
                console.log(error.response.data);
                console.log(error.response.headers);
            }
            else {
                console.log(error.message);
            }
            response.end();
        }
    }
});

//----- TRANSCRIPTION (WHISPER) -----//

const audiofilesDIR = path.join(__dirname, "Audiofiles");
if (!fs.existsSync(audiofilesDIR)) { fs.mkdirSync(audiofilesDIR); }
let filename = "";

const audioFilesStorage = multer.diskStorage({
    destination: audiofilesDIR,
    filename: function (req, file, cb) {
        const filenameTemp = getTimestampFilename(".wav");
        req.filename = filenameTemp;
        cb(null, filenameTemp);
    }
});

const uploadAudio = multer({ storage: audioFilesStorage });

const tempFilesDIR = path.join(__dirname, "/_tempFiles");
if (!fs.existsSync(tempFilesDIR)) { fs.mkdirSync(tempFilesDIR, { recursive: true }); }

app.post("/transcribeAudio", uploadAudio.single("audio"), async (request, response) => {
    console.log("");
    console.log("");
    console.log("--- Generating Transcription ---");

    filename = request.filename;

    console.log("");
    console.log("AudioDIR: " + audiofilesDIR);
    console.log("Filename: " + filename);
    console.log("Filepath: " + request.file.path);


    // if (!request.file || !request.file.path) {
    //     console.warn("");
    //     console.warn("🚫 Keine Datei im Request vorhanden");
    // }
    // else {
    //     const tempFilePath = path.join(tempFilesDIR, filename);
    //     await normalizeLoudness(request.file.path, tempFilePath);
    //     await fsp.unlink(request.file.path);
    //     await fsp.rename(tempFilePath, request.file.path);
    // }

    const whisperPython = path.join(__dirname, 'scripts', 'venv-whisper', 'Scripts', 'python.exe');
    const pythonProcess = spawn(whisperPython, ['./scripts/whisperScript.py', request.file.path]);

    let output = '';
    pythonProcess.stdout.on('data', (data) => {
        output += data.toString('utf8');
    });

    // let errorOutput = ''; // Für mögliche Fehlermeldungen vom Python-Skript
    // pythonProcess.stderr.on('data', (data) => {
    //     errorOutput += data.toString('utf8');
    //     console.error(`Python stderr: ${data.toString('utf8')}`);
    // });

    pythonProcess.on('close', async (code) => {
        if (code === 0) {
            console.log("");
            console.log("Filename: " + filename);
            console.log("Filename Split: " + filename.split(".")[0]);

            const transcriptPath = path.join(audiofilesDIR, filename.split(".")[0] + "-Transkript.txt");

            console.log("");
            console.log("Transcript Path: " + transcriptPath);

            console.log("");
            console.log("Code: " + code);
            console.log("Output: " + output);

            writeFile(transcriptPath, output.trim(), 'utf8', (err) => {
                if (err) {
                    console.error("Fehler beim Speichern des Transkripts:", err);
                } else {
                    console.log("");
                    console.log("Transkript gespeichert unter:", transcriptPath);
                }
            });

            console.log("");
            console.log("Python output:", output.trim());

            // DELETING FILES
            if (!request.file || !request.file.path) {
                console.warn("");
                console.warn("🚫 Keine Datei im Request vorhanden");
            }
            else {
                await fsp.unlink(request.file.path);
                await fsp.unlink(transcriptPath);
            }

            response.send({
                text: output.trim(),
                audioPath: path.join("/Audiofiles/Transcripts", filename)
            });
        } else {
            console.error("Python script exited with error code:", code);
            console.error("Python error details:", errorOutput.trim());
            // response.status(500).send("Whisper Script Failed: " + errorOutput.trim());
        }
    });
});

//----- VOICE (ZONOS / CHATTERBOT) -----//

const voiceSampleDIR = path.join(audiofilesDIR, "VoiceSample");
if (!fs.existsSync(voiceSampleDIR)) { fs.mkdirSync(voiceSampleDIR); }

const voiceSampleStorage = multer.diskStorage({
    destination: voiceSampleDIR,
    filename: function (req, file, cb) {
        const safeFilename = file.originalname.replace(/\s+/g, '_'); // Leerzeichen ersetzen
        req.filename = safeFilename;
        cb(null, safeFilename);
    }
});
const uploadVoiceSample = multer({ storage: voiceSampleStorage });


let zonosParams = {
    text: "Initializing",
    modelChoice: "Zyphra/Zonos-v0.1-transformer",       // Zyphra/Zonos-v0.1-transformer | Zyphra/Zonos-v0.1-hybrid
    language: "en-us",                                  // en-us | de
    speakerAudioPath: null,                             // String or Null
    prefixAudioPath: null,                              // String or Null
    fmax: 24000,                                        // 0 - 24000 | Sample Rate?
    pitchStd: 45,                                       // 0 - 300 | Pitch
    speakingRate: 15,                                   // 5 - 30 | Speed?
    cfgScale: 2,                                        // 1 - 5 | Stay on Text - Improvise
    seed: 1,                                            // Seed
    randomizeSeed: false,                               // Randomize Seed
    e1: 1.00,       // Happiness
    e2: 0.05,       // Sadness
    e3: 0.05,       // Disgust
    e4: 0.05,       // Fear
    e5: 0.05,       // Surprise
    e6: 0.05,       // Anger
    e7: 0.10,       // Other
    e8: 0.20,       // Neutral
    linear: 0.5,        // -2 - 2 | Linear (0 to disable) - High values make the output less random.
    confidence: 0.4,    // -2 - 2 | Confidence - Low values make random outputs more random.
    quadratic: 0,       // -2 - 2 | Quadratic - High values make low probablities much lower.
    topP: 0,              // 0 - 1    | Legacy | Only when linear = 0
    topK: 0,              // 0 - 1024 | Legacy | Only when linear = 0
    minP: 0,              // 0 - 1    | Legacy | Only when linear = 0
    // unconditionalKeysArray: ['speaker', 'emotion', 'fmax', 'pitch_std', 'speaking_rate'],
    unconditionalKeysArray: [],
    vqSingle: false,        // ???
    dnsmosOvl: false,       // ???
    speakerNoised: false    // ???
};

let zonosData = [];

let isZonosReady = false;

startZonos(() => {
    zonosData = [zonosParams.modelChoice, zonosParams.text, zonosParams.language, zonosParams.speakerAudioPath, zonosParams.prefixAudioPath, zonosParams.e1, zonosParams.e2, zonosParams.e3, zonosParams.e4, zonosParams.e5, zonosParams.e6, zonosParams.e7, zonosParams.e8, zonosParams.vqSingle, zonosParams.fmax, zonosParams.pitchStd, zonosParams.speakingRate, zonosParams.dnsmosOvl, zonosParams.speakerNoised, zonosParams.cfgScale, zonosParams.topP, zonosParams.topK, zonosParams.minP, zonosParams.linear, zonosParams.confidence, zonosParams.quadratic, zonosParams.seed, zonosParams.randomizeSeed, zonosParams.unconditionalKeysArray];
    console.log("[Start Zonos] ✅ On Ready fired");
    isZonosReady = true;
});

app.post("/generateSpeech", uploadVoiceSample.single("voiceSample"), async (request, response) => {
    console.log("");
    console.log("");
    console.log("--- Generating Voice ---");

    console.log("");
    console.log("AudioDIR: " + audiofilesDIR);
    console.log("Filename: " + filename);

    console.log("");
    console.log("Create New File?: -" + JSON.parse(request.body.newFile));

    zonosParams = JSON.parse(request.body.zonosOptions);

    if (JSON.parse(request.body.newFile)) {
        filename = getTimestampFilename(".wav");
    }

    console.log("Filename: " + filename);

    const voiceModel = request.body.voiceModel;
    let audioPath = request.file?.path ?? "";
    const data = request.body.text;

    console.log("");
    console.log("Voice Model:", voiceModel);
    console.log("Voice Sample Path:", audioPath);
    console.log("Text: " + data);

    if (!audioPath) {
        console.warn("");
        console.warn("🚫 Keine Datei im Request vorhanden");
    }
    else {
        const tempFilePath = path.join(tempFilesDIR, "tempVoiceSample.wav");
        await normalizeLoudness(audioPath, tempFilePath);
        await fsp.unlink(audioPath);
        await fsp.rename(tempFilePath, audioPath);
    }

    if (voiceModel == "Chatterbox") {
        const exaggeration = parseFloat(request.body.exaggeration);
        const pase = parseFloat(request.body.pase);
        const temperature = parseFloat(request.body.temperature);

        console.log("");
        console.log("Exaggeration: " + exaggeration);
        console.log("Pase: " + pase);
        console.log("Temperature: " + temperature);

        const chatterboxPython = path.join(__dirname, 'scripts', 'venv-chatterbox', 'Scripts', 'python.exe');
        const pythonProcess = spawn(chatterboxPython, ['./scripts/chatterbotScript.py', data, audioPath, exaggeration, pase, temperature]);
        // const pythonProcess = spawn("python", ['./scripts/chatterbotScript.py', data, audioPath, exaggeration, pase, temperature]);

        let output = '';
        pythonProcess.stdout.on('data', (data) => {
            output += data;
        });

        let errorOutput = ''; // Für mögliche Fehlermeldungen vom Python-Skript
        pythonProcess.stderr.on('data', (data) => {
            errorOutput += data.toString('utf8');
            //     console.error(`Python stderr: ${data.toString('utf8')}`);
        });

        pythonProcess.on('close', async (code) => {
            if (code === 0) {
                console.log('Python output:', output);

                const oldPath = path.join(__dirname, 'Audiofiles', 'chatterbotOutput.wav');

                saveAndSend(oldPath);
            } else {
                console.error('AI ERROR:', code);
                response.status(500).send("Chatterbox Script Failed!");
            }
        });
    }
    else if (voiceModel == "Zonos") {
        console.log("");
        console.log("Audio Path: " + audioPath);

        const gradioTempFolder = path.join("C:", "Users", "USER", "AppData", "Local", "Temp", "gradio")

        if (!audioPath) {
            audioPath = path.join(__dirname, "scripts", "StandardVoice.wav");
        }
        if (audioPath) {
            const gradioUploadDIR = path.join(gradioTempFolder, getTimestampFilename(""));
            if (!fs.existsSync(gradioUploadDIR)) { fs.mkdirSync(gradioUploadDIR, { recursive: true }); }
            // console.log("Gradio Upload DIR: " + gradioUploadDIR);

            const gradioUploadPath = path.join(gradioUploadDIR, "upload.wav");
            // console.log("Gradio Upload Path: " + gradioUploadPath);
            await fsp.copyFile(audioPath, gradioUploadPath);


            const audioPathFile = await makeFileData(gradioUploadPath);
            // console.log("Audio Path File: " + JSON.stringify(audioPathFile, null, 2));

            zonosParams.speakerAudioPath = audioPathFile;
        }

        zonosParams.text = data;

        zonosData = [zonosParams.modelChoice, zonosParams.text, zonosParams.language, zonosParams.speakerAudioPath, zonosParams.prefixAudioPath, zonosParams.e1, zonosParams.e2, zonosParams.e3, zonosParams.e4, zonosParams.e5, zonosParams.e6, zonosParams.e7, zonosParams.e8, zonosParams.vqSingle, zonosParams.fmax, zonosParams.pitchStd, zonosParams.speakingRate, zonosParams.dnsmosOvl, zonosParams.speakerNoised, zonosParams.cfgScale, zonosParams.topP, zonosParams.topK, zonosParams.minP, zonosParams.linear, zonosParams.confidence, zonosParams.quadratic, zonosParams.seed, zonosParams.randomizeSeed, zonosParams.unconditionalKeysArray];

        const interval = setInterval(async () => {
            console.log("Waiting for Zonos to be loaded");
            try {
                if (isZonosReady) {
                    console.log("✅ Zonos Ready");
                    clearInterval(interval);
                    const response = await generateZonosVoice(zonosData);

                    const oldPath = response.path;
                    const newPath = path.join(__dirname, 'Audiofiles', "audio.wav");

                    await fsp.copyFile(oldPath, newPath)
                    await fsp.unlink(oldPath)

                    clearFolder(gradioTempFolder, true);

                    saveAndSend(newPath);
                }
            } catch {
                // Wait for next try
            }
        }, 1000);
    }
    async function makeFileData(audioPath) {
        const stats = await fsp.stat(audioPath);
        return {
            name: path.basename(audioPath),
            orig_name: path.basename(audioPath),
            size: stats.size,
            mime_type: "audio/wav",
            is_stream: false,
            path: audioPath,
            meta: { _type: "gradio.FileData" }
        };
    }

    async function saveAndSend(oldPath) {
        const newPath = path.join(__dirname, 'Audiofiles', filename.split(".")[0].concat('-Voice.wav'));
        const relativePath = '/Audiofiles/' + filename.split(".")[0] + '-Voice.wav';

        if (!oldPath) {
            console.warn("");
            console.warn("🚫 Keine Datei im Request vorhanden");
        }
        else {
            const tempFilePath = path.join(tempFilesDIR, filename);
            await normalizeLoudness(oldPath, tempFilePath);
            await fsp.unlink(oldPath);
            await fsp.rename(tempFilePath, oldPath);
        }

        response.send({ audioPath: relativePath });

        fs.rename(oldPath, newPath, (err) => {
            if (err) {
                console.error('Fehler beim Umbenennen:', err);
            } else {
                console.log("");
                console.log('Datei erfolgreich umbenannt.');
            }
        });
    }
});

async function generateZonosVoice(zonosData) {
    const body = {
        session_hash: "",    // Can be empty
        event_id: "",        // Empty
        data: zonosData
    };

    console.log("[Generate Zonos] Started ");
    console.log("[Generate Zonos] Body: " + JSON.stringify(body, null, 2));

    let result = "";

    try {
        const response = await axios.post(
            "http://127.0.0.1:7860/gradio_api/run/generate_audio",
            body,
            { headers: { "Content-Type": "application/json" } }
        );
        // Das Audio kommt in response.data.data[0]
        result = response.data.data[0];
        console.log("[Generate Zonos] response: " + JSON.stringify(response));
        console.log("[Generate Zonos] Result: " + JSON.stringify(result));
        return result;
    } catch (error) {
        // Schau Dir die Server - Antwort an:
        if (error.response) {
            console.log("[Generate Zonos] Error Code: ", error.code);
            // console.log("[Generate Zonos] Error Status: ", error.response.status);
            console.log("[Generate Zonos] Error StatusText: ", error.response.statusText);
            // console.error("[Generate Zonos] Server-Antwort: ", error.response.data);
        } else {
            // console.error("[Generate Zonos] Axios-Error: ", error.message);
        }
        // throw error;
    }

    // Gradio packt die Ergebnisse in resp.data.data, z.B. data[0] ist das Audio-URL oder Base64
    console.log("[Generate Zonos] Result.Path: " + JSON.stringify(result.path));
    return result;
}

//----- TRANSLATE (GOOGLE) -----//

app.post("/translateText", async (request, response) => {
    console.log("");
    console.log("");
    console.log("--- Translating Text ---");

    const text = request.body.text;
    const targetLanguage = request.body.targetLanguage;
    const location = 'global'; // oder z. B. 'us-central1'

    console.log("");
    console.log("Target Language:", targetLanguage);
    console.log("Text to Translate:", text);

    if (!text || !targetLanguage) {
        return res.status(400).json({ error: "Fehlender Text oder Ziel-Sprache" });
    }

    // const translateClient = new TranslationServiceClient();

    const config = {
        parent: `projects/${projectId}/locations/${location}`,
        contents: [text],
        mimeType: 'text/plain',
        targetLanguageCode: targetLanguage,
    };

    try {
        const [translation] = await new TranslationServiceClient().translateText(config);
        const translatedText = translation.translations[0].translatedText;

        console.log("Translation:", translatedText);

        response.json(translatedText);
    } catch (error) {
        console.warn("❌ Fehler bei der Übersetzung:", error.message);
        response.status(500).json({ error: "Failed to translate text." });
    }

    async function translateText(text, targetLanguage) {
    }
});


// FUNCTIONS

function startZonos(onReady) {
    console.log("");
    console.log("--- Start Zonos () ---");
    const zonosScriptPath = path.join(__dirname, "repos", "Zonos-for-windows", "runZonos.ps1");

    // console.log(" ... existiert?", fs.existsSync(zonosScriptPath));
    // console.log(" ... isFile? ", fs.lstatSync(zonosScriptPath).isFile());
    // console.log(" ... zonosScriptPath Pfad:", zonosScriptPath);

    const gradio = spawn("powershell.exe", [
        "-NoProfile",
        "-ExecutionPolicy", "Bypass",
        // "-Command", `& '${zonosScriptPath.replace(/'/g, "''")}'`
        "-File", zonosScriptPath
    ], {
        // detached: false,
        shell: false,
        cwd: path.dirname(zonosScriptPath),
        stdio: ["ignore", "pipe", "pipe"]
    });

    // console.log("");
    // console.log(" ... gradio.spawnargs: ", gradio.spawnargs);

    gradio.stdout.on("data", chunk => {
        const line = chunk.toString().trim();
        // console.log(`[Start Zonos - Gradio stdout] ${line}`);
    });

    gradio.stderr.on("data", chunk => {
        // console.error(`[Start Zonos - Gradio stderr] ${chunk.toString().trim()}`);
    });

    gradio.unref();

    const body = {
        session_hash: "",    // Can be empty
        event_id: "",        // Empty
        data: zonosData
    };

    const interval = setInterval(async () => {
        // console.log("[Start Zonos] Waiting for Gradio");
        try {
            await axios.get("http://127.0.0.1:7860");
            console.log("[Start Zonos] ✅ Gradio loaded");
            clearInterval(interval);  // hier stoppen!
            onReady();
            // warmup();
        } catch {
            // Wait for next try
        }
    }, 1000);

    async function warmup() {
        console.log("[Gradio stderr] Sending Warmup");
        const res = await axios.post(
            "http://127.0.0.1:7860/gradio_api/run/generate_audio",
            body,
            { headers: { "Content-Type": "application/json" } }
        );
        if (res.status === 200) {
            console.log("[Start Zonos] ✅ Zonos is running");
            clearInterval(interval);
            onReady();
        }
    }
}

app.get("/getAImodels", async (request, response) => {
    console.log("");
    console.log("");
    console.log("--- Getting AI Models ---");

    try {

        const promiseModels = await openAI.listModels();
        const jsonModels = await promiseModels.data.data;
        let responseObject = [];

        for (let i = 0; i < jsonModels.length; i++) {
            // console.log(jsonModels[i].id);
            // console.log(jsonModels[i].permission);
            responseObject[i] = {
                model: jsonModels[i].id
            };
        }

        console.log("");
        console.log(responseObject);

        response.json({
            responseObject
        });

        response.end();
    } catch (error) {
        console.log("RESPONSE ERROR:");
        if (error.response) {
            console.log(error.response.status);
            console.log(error.response.data);
            console.log(error.response.headers);
        }
        else {
            console.log(error.message);
        }
        response.end();
    }
});

function saveToSessionFile(filePath, entry) {
    let data = [];

    if (fs.existsSync(filePath)) {
        data = JSON.parse(fs.readFileSync(filePath, "utf-8"));
    }

    data.push(entry);
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf-8");
}

function buildMessagesFromSession(filePath, aiMessage, userMessage, buildHistory) {
    const messages = [{
        role: "system",
        content: aiMessage
    }];

    if (buildHistory) {
        if (fs.existsSync(filePath)) {
            const sessionData = JSON.parse(fs.readFileSync(filePath, "utf-8"));

            for (const entry of sessionData) {
                if (entry.user) {
                    messages.push({
                        role: "user",
                        content: entry.user
                    });
                }
                if (entry.ai) {
                    messages.push({
                        role: "assistant",
                        content: entry.ai
                    });
                }
            }
        }
    }

    messages.push({
        role: "user",
        content: userMessage
    });

    return messages;
}

function getTimestampFilename(extension) {
    const now = new Date();
    const pad = (n) => n.toString().padStart(2, "0");
    const filename = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}_${pad(now.getHours())}-${pad(now.getMinutes())}-${pad(now.getSeconds())}${extension}`;
    return filename;
}

async function downloadImage(imageUrl, folder = "", filename = "") {
    try {
        if (!fs.existsSync(folder)) {
            fs.mkdirSync(folder);
        }

        const filePath = path.join(folder, filename);

        const response = await fetch(imageUrl);
        if (!response.ok) {
            throw new Error(`HTTP Error! Status: ${response.status} - ${response.statusText}`);
        }

        const imageBuffer = await response.buffer();
        fs.writeFileSync(filePath, imageBuffer);

        return filePath;
    } catch (error) {
        console.error('Error when downloading image "download":', error);
        throw error;
    }
}

function calculateCost(tokens, Input, Output) {
    Input = Input * 100;
    Output = Output * 100;

    const costInput = (tokens.prompt_tokens / 1000000) * Input;
    const costOutput = (tokens.completion_tokens / 1000000) * Output;

    const cost = costInput + costOutput;

    return { cost, costInput, costOutput };
}

ffmpeg.setFfmpegPath(ffmpegPath);

async function normalizeLoudness(inputAudioPath, outputAudioPath) {
    return new Promise((resolve, reject) => {
        ffmpeg(inputAudioPath)
            .audioFilter('loudnorm')
            .output(outputAudioPath)
            .on('end', () => {
                console.log("");
                console.log(`✅ Normalized: ${path.basename(outputAudioPath)}`);
                resolve();
            })
            .on('error', (err) => {
                console.log("");
                console.warn(`❌ Normalizing Error ${inputAudioPath}:`, err.message);
                reject(err);
            })
            .run();
    });
}

// await normalizeFolderLoudness(voiceSampleDIR, voiceSampleLoudnessDIR);

async function normalizeFolderLoudness(inputAudioFolder, outputAudioFolder) {
    try {
        await fsp.mkdir(outputAudioFolder, { recursive: true });
        const files = await fsp.readdir(inputAudioFolder);

        const audioFiles = files.filter(f =>
            /\.(wav|mp3)$/i.test(f)
        );

        for (const file of audioFiles) {
            const inputPath = path.join(inputAudioFolder, file);
            // const outputName = file.replace(/\.(wav|mp3)$/i, '_FIXEDLOUDNESS.$1');
            const outputPath = path.join(outputAudioFolder, file);
            await normalizeLoudness(inputPath, outputPath);
        }

        console.log(`🎉 Alle ${audioFiles.length} Dateien wurden normalisiert.`);
    } catch (err) {
        console.error('❌ Fehler beim Batch-Normalisieren:', err.message);
    }
}

clearFolder(audiofilesDIR, false, ".wav");
clearFolder(memoryDIR, true);

async function clearFolder(folderPath, deleteAll = false, filetype = "FILETYPE IN HERE") {
    const entries = await fsp.readdir(folderPath, { withFileTypes: true });

    for (const entry of entries) {
        const fullPath = path.join(folderPath, entry.name);

        if (deleteAll && entry.isDirectory()) {
            await fsp.rm(fullPath, { recursive: true, force: true }); // Unterordner löschen
        }
        else if (filetype != "FILETYPE IN HERE") {
            if (entry.isFile() && entry.name.endsWith(filetype)) {
                await fsp.unlink(fullPath);
            }
        }
        else if (deleteAll) {
            await fsp.unlink(fullPath); // Datei löschen
        }
    }

    console.log(`🧼 Ordner geleert: ${folderPath}`);
}