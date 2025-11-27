import fs from "fs/promises";
import { pipeline } from "@huggingface/transformers";
import pkg from "wavefile";
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const { WaveFile } = pkg;
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

let ttsModel = null;
let speakerEmbeddings = null;

export async function generateTTS(text) {
    if (!ttsModel) {
        console.log("Loading TTS model...");
        ttsModel = await pipeline(
            "text-to-speech",
            "onnx-community/Supertonic-TTS-ONNX",
            { dtype: "fp32" }
        );

        const voicePath = join(__dirname, '..', 'voices', 'F2.bin');
        const voiceBuffer = await fs.readFile(voicePath);
        speakerEmbeddings = new Float32Array(
            voiceBuffer.buffer,
            voiceBuffer.byteOffset,
            voiceBuffer.byteLength / 4
        );
    }

    console.log("Generating speech...");
    const audio = await ttsModel(text, { speaker_embeddings: speakerEmbeddings });

    const wav = new WaveFile();
    wav.fromScratch(1, audio.sampling_rate, '32f', audio.audio);
    const wavBuffer = Buffer.from(wav.toBuffer());

    return {
        audio: audio.audio,
        sampleRate: audio.sampling_rate,
        wavBuffer
    };
}
