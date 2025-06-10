// ES6 IMPORTS
import express from "express";
import { } from "dotenv/config";

import path from "path";
import fs from "fs";
import { writeFile } from "fs";
import multer from "multer";
import { fileURLToPath } from "url";
import { spawn } from "child_process";
import fetch from 'node-fetch';

import { Configuration, OpenAIApi } from "openai";
import aiplatform from '@google-cloud/aiplatform';

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

        console.log("");
        console.log("AI Response Usage:");
        console.log(responseAI.data.usage);

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

    // console.log("");
    // if (data.safetyFilterLevel == "false") {
    //     console.log("Safety Filer Level: ");
    //     console.log(data.safetyFilterLevel);
    //     data.safetyFilterLevel = false;
    //     console.log("Safety Filer Level: ");
    //     console.log(data.safetyFilterLevel);
    // }
    // else {
    //     console.log("Safety Filer Level unchaged: ");
    //     console.log(data.safetyFilterLevel);
    // }

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
            // safetyFilterLevel: aiPrompt.safetyFilterLevel,
            safetySetting: aiPrompt.safetyFilterLevel,              // "block_low_and_above" | "block_medium_and_above" | "block_only_high"
            personGeneration: aiPrompt.personGeneration,            // "allow_adult" | "dont_allow"
            // includeRaiReason: false,                                // Begründung für Ablehnung von KI - true | false
            // includeSafetyAttributes: false                          // "Death, Harm & Tragedy" | "Firearms & Weapons" | "Hate" | "Health" | "Illicit Drugs" | "Politics" | "Porn" | "Religion & Belief" | "Toxic" | "Violence" | "Vulgarity" | "War & Conflict" | false
        }

        console.log("");
        console.log("IMAGEN Prompt:");
        console.log(imagenPrompt);

        try {
            const { v1, helpers } = aiplatform;
            const { PredictionServiceClient } = v1;

            // GCP-Settings
            const location = 'us-central1'; // Die Region, in der das Modell verfügbar ist

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
                        console.warn(`Keine Base64-Daten für Prediction ${i}.`);
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
                console.warn("Keine Bilder in der Antwort erhalten.");
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

//----- TRANSCRIPTION (Whisper) -----//

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

app.post("/transcribeAudio", uploadAudio.single("audio"), (request, response) => {
    console.log("");
    console.log("");
    console.log("--- Generating Transcription ---");

    filename = request.filename;

    console.log("");
    console.log("AudioDIR: " + audiofilesDIR);
    console.log("Filename: " + filename);
    console.log("Filepath: " + request.file.path);

    const pythonProcess = spawn('python', ['./scripts/whisperScript.py', request.file.path]);

    let output = '';
    pythonProcess.stdout.on('data', (data) => {
        output += data.toString('utf8');
    });

    // let errorOutput = ''; // Für mögliche Fehlermeldungen vom Python-Skript
    // pythonProcess.stderr.on('data', (data) => {
    //     errorOutput += data.toString('utf8');
    //     console.error(`Python stderr: ${data.toString('utf8')}`);
    // });

    pythonProcess.on('close', (code) => {
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

            response.send({
                text: output.trim(),
                audioPath: path.join("/Audiofiles", filename)
            });
        } else {
            console.error("Python script exited with error code:", code);
            console.error("Python error details:", errorOutput.trim());
            response.status(500).send("Whisper Script Failed: " + errorOutput.trim());
        }
    });
});

//----- VOICE (CHATTERBOT) -----//

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

app.post("/generateSpeech", uploadVoiceSample.single("voiceSample"), (request, response) => {
    console.log("");
    console.log("");
    console.log("--- Generating Voice ---");

    console.log("");
    console.log("AudioDIR: " + audiofilesDIR);
    console.log("Filename: " + filename);

    console.log("");
    console.log("Create New File?: -" + JSON.parse(request.body.newFile));

    if (JSON.parse(request.body.newFile)) {
        filename = getTimestampFilename(".wav");
    }

    console.log("Filename: " + filename);

    const audioPath = request.file?.path ?? "";
    const data = request.body.text;
    const exaggeration = parseFloat(request.body.exaggeration);
    const pase = parseFloat(request.body.pase);
    const temperature = parseFloat(request.body.temperature);

    console.log("");
    console.log("Voice Sample Path:", audioPath);

    console.log("");
    console.log("Text: " + data);

    console.log("");
    console.log("Exaggeration: " + exaggeration);
    console.log("Pase: " + pase);
    console.log("Temperature: " + temperature);

    const pythonProcess = spawn('python', ['./scripts/chatterbotScript.py', data, audioPath, exaggeration, pase, temperature]);

    let output = '';
    pythonProcess.stdout.on('data', (data) => {
        output += data;
    });

    // let errorOutput = ''; // Für mögliche Fehlermeldungen vom Python-Skript
    // pythonProcess.stderr.on('data', (data) => {
    //     errorOutput += data.toString('utf8');
    //     console.error(`Python stderr: ${data.toString('utf8')}`);
    // });

    pythonProcess.on('close', (code) => {
        if (code === 0) {
            // console.log('Python output:', output);
            // response.send({ text: output.trim() });

            const alterPfad = path.join(__dirname, 'Audiofiles', 'chatterbotOutput.wav');
            const neuerPfad = path.join(__dirname, 'Audiofiles', filename.split(".")[0].concat('-Voice.wav'));
            const relativePfad = '/Audiofiles/' + filename.split(".")[0] + '-Voice.wav';

            response.send({ audioPath: relativePfad });

            fs.rename(alterPfad, neuerPfad, (err) => {
                if (err) {
                    console.error('Fehler beim Umbenennen:', err);
                } else {
                    console.log("");
                    console.log('Datei erfolgreich umbenannt.');
                }
            });
        } else {
            console.error('ERROR:', code);
            response.status(500).send("Chatterbox Script Failed!");
        }
    });
});


// FUNCTIONS

app.get("/getAImodels", async (request, response) => {
    console.log("");
    console.log("");
    console.log("Getting AI Models: ");

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
        console.log(responseObject);

        response.json({
            responseObject
        });

        response.end();
    } catch (error) {
        console.log("AI RESPONSE ERROR:");
        // console.error(error);
        console.log(error);
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
        console.error('Fehler beim Herunterladen oder Speichern des Bildes mit "download":', error);
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
