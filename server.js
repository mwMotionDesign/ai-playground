// ES6 IMPORTS
import express from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import { spawn } from "child_process";
import { } from "dotenv/config";
import { Configuration, OpenAIApi } from "openai";
import { writeFile } from "fs";

// VARIABLES
let systemPrompt = "";

initiatePrompt();

function initiatePrompt() {
    const aiPersonality = "Useful";

    if (aiPersonality == "Useful") {
        systemPrompt = ""
            + "You are a useful female AI assistant. "
            + "Your name is Nova. "
            + "Keep your answers short. "
            + ""
    }
    if (aiPersonality == "Sarcastic") {
        systemPrompt = ""
            + "You are a female AI personality. "
            + "Your name is Nova. "
            + "Your task is to be as sarcastic as possible. Nihilistic. "
            + "Information is irrelevant. "
            + "Your personality is important. "
    }
    if (aiPersonality == "Playfull") {
        systemPrompt = ""
            + "You are a female AI personality. "
            + "Your name is Nova. "
            + "Your task is to be as playful and flirty as possible. You love life. "
            + "Information is irrelevant and you're more interested in the user, than anything else. "
            + "Your personality is important. "
    }
    if (aiPersonality == "Albert") {
        systemPrompt = ""
            + "You are imitating Albert Einstein. "
            + "Pretend to be him. "
            + ""
    }

    systemPrompt = systemPrompt.concat(""
        + "Important! You can control your tone of voice. "
        + "At the beginning of every message add a float value, formatted with exactly one decimal place (e.g., 0.6). "
        + "The values you can use are between "
        + "0.1 and 1.2. "
        + "0.1 slow and calm "
        + "0.5 neutral tone and spee "
        + "1.2 extremely overexcited. "
        + "Keep it between 0.1 and 0.8 most of the time. "
        + "Higher values can break the voice model. "
    )

}

const textModel1 = "gpt-4.1-mini-2025-04-14";
const textModel2 = "gpt-4.1-2025-04-14";
const imgModel = "dall-e-3";

// START CODE
const app = express();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(express.static("public"));
app.use('/Audiofiles', express.static(path.join(__dirname, 'Audiofiles')));
app.use(express.json({ limit: "500kb" }));

// OPEN AI INIT
const aiConfiguration = new Configuration({
    organization: "org-g4dnutBbAzqx2x93GBqErvMy",
    apiKey: process.env.OPEN_AI_KEY
});

const openAI = new OpenAIApi(aiConfiguration);

// STORAGE

// ASYNC FUNCTIONS

//----- TEXT / GPT -----//

const memoryDIR = path.join(__dirname, "Memory");
if (!fs.existsSync(memoryDIR)) { fs.mkdirSync(memoryDIR); }
let sessionFileName = getTimestampFilename(".json");
let sessionFilePath = path.join(memoryDIR, sessionFileName);

app.post("/createAItext", async (request, response) => {
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

    if (data.model == textModel1 || data.model == textModel2) {
        aiPrompt.messages = buildMessagesFromSession(sessionFilePath, systemPrompt, data.prompt);
    }

    console.log("");
    console.log("--- Generating Text ---");
    console.log("AI Parameters: ");
    console.log(aiPrompt);
    console.log("");

    try {
        let responseAI;
        let aiAnswer;

        if (data.model == textModel1 || data.model == textModel2) {
            responseAI = await openAI.createChatCompletion(aiPrompt);
            let aiResponseAnswer = responseAI.data.choices[0];
            aiAnswer = aiResponseAnswer.message.content;
        }

        console.log("AI Response Answer:");
        console.log(responseAI.data.usage);

        let cost;

        if (data.model == textModel1) {
            cost = calculateCost(responseAI.data.usage, 0.4, 1.6);
        }
        else if (data.model == textModel2) {
            cost = calculateCost(responseAI.data.usage, 2, 8);
        }

        console.log(cost);
        console.log("");
        console.log("AI Response:");
        console.log(aiAnswer);
        console.log("");

        response.json({
            status: "200 - Succesful PostRequest",
            data: aiAnswer,
            cost: cost
        });

        const entry = {
            timestamp: getTimestampFilename(""),
            user: data.prompt,
            ai: aiAnswer
        };

        saveToSessionFile(sessionFilePath, entry);

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

//----- IMAGES / DALL-E -----//

app.post("/createAIimages", async (request, response) => {
    console.log("");
    console.log("--- Generating Text ---");

    const data = request.body;
    let aiPrompt = {};

    aiPrompt = {
        model: imgModel,
        prompt: data.prompt,
        // n: data.n,
        n: 1,
        size: data.size
    }

    console.log("");
    console.log("--- Generating IMG ---");
    console.log("AI Parameters: ");
    console.log(aiPrompt);
    console.log("");

    try {
        let responseAI;
        let aiAnswer;

        responseAI = await openAI.createImage(aiPrompt);
        let aiResponseIMGs = responseAI.data.data;
        aiAnswer = aiResponseIMGs;

        let cost;

        if (data.size == "1024x1024") {
            // cost = data.n * 8;
            cost = 8;
        }
        else if (data.size == "1024x1792") {
            // cost = data.n * 12;
            cost = 12;
        }

        console.log(cost);
        console.log("");
        console.log("AI Response:");
        console.log(aiAnswer);
        console.log("");

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
    console.log("--- Generating Transcription ---");

    filename = request.filename;

    console.log("");
    console.log("AudioDIR: " + audiofilesDIR);
    console.log("Filename: " + filename);
    console.log("Filepath: " + request.file.path);
    console.log("");


    console.log('FFMPEG Converted File');

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
            console.log("Filename: " + filename);
            console.log("Filename Split: " + filename.split(".")[0]);

            const transcriptPath = path.join(audiofilesDIR, filename.split(".")[0] + "-Transkript.txt");

            console.log("Transcript Path: " + transcriptPath);

            console.log("");
            console.log("Code: " + code);
            console.log("Output: " + output);

            writeFile(transcriptPath, output.trim(), 'utf8', (err) => {
                if (err) {
                    console.error("Fehler beim Speichern des Transkripts:", err);
                } else {
                    console.log("Transkript gespeichert unter:", transcriptPath);
                }
            });

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
    console.log("--- Generating Voice ---");

    console.log("");
    console.log("AudioDIR: " + audiofilesDIR);
    console.log("Filename: " + filename);
    console.log("");

    console.log("Create New File?: " + JSON.parse(request.body.newFile));

    if (JSON.parse(request.body.newFile)) {
        filename = getTimestampFilename(".wav");
    }

    console.log("Filename: " + filename);

    const audioPath = request.file?.path ?? "";
    const data = request.body.text;
    const exaggeration = parseFloat(request.body.exaggeration);
    const pase = parseFloat(request.body.pase);
    const temperature = parseFloat(request.body.temperature);

    console.log("Voice Sample Path:", audioPath);
    console.log("");

    console.log("Text: " + data);
    console.log("Exaggeration: " + exaggeration);
    console.log("Pase: " + pase);
    console.log("Temperature: " + temperature);
    console.log("");

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

function buildMessagesFromSession(filePath, systemPrompt, data) {
    const messages = [{
        role: "system",
        content: systemPrompt
    }];

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

    messages.push({
        role: "user",
        content: data
    });

    console.log(messages);
    return messages;
}

function getTimestampFilename(extension) {
    const now = new Date();
    const pad = (n) => n.toString().padStart(2, "0");
    const filename = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}_${pad(now.getHours())}-${pad(now.getMinutes())}-${pad(now.getSeconds())}${extension}`;
    return filename;
}

function calculateCost(tokens, Input, Output) {
    Input = Input * 100;
    Output = Output * 100;

    const costInput = (tokens.prompt_tokens / 1000000) * Input;
    const costOutput = (tokens.completion_tokens / 1000000) * Output;

    const cost = costInput + costOutput;

    return cost;
}


// START SERVER

app.listen(process.env.PORT, () => {
    console.log("\n\n\n---------- Server Listening! ----------\n\n\n");
});
