import wav from "wav-decoder";
import FFT from "fft.js";

// DSP Configuration
const DSP_CONFIG = {
    nFft: 1024,
    hopLength: 128,
    nMels: 40,
    fMin: 20,
    minPhoneDuration: 0.02  // 20ms minimum
};

// Hann window with caching
const windowCache = new Map();

function createHannWindow(N) {
    const w = new Float32Array(N);
    const factor = (2 * Math.PI) / (N - 1);
    for (let i = 0; i < N; i++) {
        w[i] = 0.5 - 0.5 * Math.cos(factor * i);
    }
    return w;
}

function getWindow(N) {
    if (!windowCache.has(N)) {
        windowCache.set(N, createHannWindow(N));
    }
    return windowCache.get(N);
}

// Mel scale conversions
const hzToMel = (hz) => 2595 * Math.log10(1 + hz / 700);
const melToHz = (mel) => 700 * (10 ** (mel / 2595) - 1);

// Create Mel filterbank (cached)
const filterbankCache = new Map();

function createMelFilterbank(sr, nFft, nMels, fMin, fMax) {
    const cacheKey = `${sr}_${nFft}_${nMels}_${fMin}_${fMax}`;
    if (filterbankCache.has(cacheKey)) {
        return filterbankCache.get(cacheKey);
    }

    const melMin = hzToMel(fMin);
    const melMax = hzToMel(fMax);
    const melPoints = Array.from({ length: nMels + 2 }, (_, i) =>
        melToHz(melMin + (i * (melMax - melMin)) / (nMels + 1))
    );

    const bins = melPoints.map(hz => Math.floor((nFft + 1) * hz / sr));
    const filterbank = [];

    for (let m = 1; m <= nMels; m++) {
        const filter = new Float32Array(nFft / 2 + 1);
        const [left, center, right] = [bins[m - 1], bins[m], bins[m + 1]];

        for (let k = left; k < center; k++) {
            filter[k] = (k - left) / (center - left);
        }
        for (let k = center; k < right; k++) {
            filter[k] = (right - k) / (right - center);
        }

        filterbank.push(filter);
    }

    filterbankCache.set(cacheKey, filterbank);
    return filterbank;
}

// Compute Mel Spectrogram
function computeMelSpectrogram(signal, sr, nFft, hopLength, nMels, fMin) {
    const fMax = sr / 2;
    const fftObject = new FFT(nFft);
    const window = getWindow(nFft);
    const filterbank = createMelFilterbank(sr, nFft, nMels, fMin, fMax);

    const frames = [];
    const numFrames = Math.floor((signal.length - nFft) / hopLength);

    for (let i = 0; i < numFrames; i++) {
        const start = i * hopLength;
        const frame = new Float32Array(nFft);
        
        // Apply window
        for (let j = 0; j < nFft; j++) {
            frame[j] = signal[start + j] * window[j];
        }

        // FFT
        const complexOut = fftObject.createComplexArray();
        fftObject.realTransform(complexOut, frame);

        // Compute magnitude spectrum
        const magnitude = new Float32Array(nFft / 2 + 1);
        for (let k = 0; k < magnitude.length; k++) {
            const re = complexOut[2 * k];
            const im = complexOut[2 * k + 1];
            magnitude[k] = Math.sqrt(re * re + im * im);
        }

        // Apply mel filterbank
        const melFrame = filterbank.map(filter => {
            let sum = 0;
            for (let k = 0; k < filter.length; k++) {
                sum += filter[k] * magnitude[k];
            }
            return Math.log(1e-6 + sum);
        });

        frames.push(melFrame);
    }

    return frames;
}

// Compute spectral flux (frame-to-frame energy change)
function computeSpectralFlux(melFrames) {
    const flux = new Float32Array(melFrames.length);

    for (let t = 1; t < melFrames.length; t++) {
        let sum = 0;
        const currentFrame = melFrames[t];
        const prevFrame = melFrames[t - 1];
        
        for (let i = 0; i < currentFrame.length; i++) {
            const diff = currentFrame[i] - prevFrame[i];
            if (diff > 0) sum += diff;  // Only positive changes
        }
        flux[t] = sum;
    }

    return flux;
}

// Detect phoneme boundaries using adaptive peak picking
function detectPhoneBoundaries(flux, targetCount) {
    // Calculate statistics
    const mean = flux.reduce((sum, val) => sum + val, 0) / flux.length;
    const variance = flux.reduce((sum, val) => sum + (val - mean) ** 2, 0) / flux.length;
    const stdDev = Math.sqrt(variance);
    const threshold = mean + 0.5 * stdDev;

    const peaks = [];

    // Find local maxima above threshold
    for (let i = 2; i < flux.length - 2; i++) {
        const isLocalMax = 
            flux[i] > flux[i - 1] &&
            flux[i] > flux[i + 1] &&
            flux[i] > flux[i - 2] &&
            flux[i] > flux[i + 2] &&
            flux[i] > threshold;

        if (isLocalMax) peaks.push(i);
    }

    // Keep strongest peaks if too many
    if (peaks.length > targetCount * 1.5) {
        peaks.sort((a, b) => flux[b] - flux[a]);
        peaks.length = Math.ceil(targetCount * 1.2);
        peaks.sort((a, b) => a - b);
    }

    return peaks;
}

// Convert boundaries to phoneme durations
function boundariesToDurations(peaks, hopLength, sampleRate, phoneCount, totalDuration) {
    if (peaks.length === 0) {
        const avgDuration = totalDuration / phoneCount;
        return Array(phoneCount).fill(avgDuration);
    }

    let times = [0, ...peaks.map(i => (i * hopLength) / sampleRate), totalDuration];

    // Adjust boundary count to match phoneme count
    if (times.length - 1 < phoneCount) {
        // Interpolate if too few boundaries
        const step = totalDuration / phoneCount;
        times = Array.from({ length: phoneCount + 1 }, (_, i) => i * step);
    } else if (times.length - 1 > phoneCount) {
        // Merge closest boundaries if too many
        while (times.length - 1 > phoneCount) {
            let minDiff = Infinity;
            let minIdx = 1;

            for (let i = 1; i < times.length - 1; i++) {
                const diff = times[i + 1] - times[i];
                if (diff < minDiff) {
                    minDiff = diff;
                    minIdx = i;
                }
            }

            times.splice(minIdx, 1);
        }
    }

    // Calculate durations with minimum threshold
    const durations = Array.from({ length: phoneCount }, (_, i) => {
        const duration = times[i + 1] - times[i];
        return Math.max(duration, DSP_CONFIG.minPhoneDuration);
    });

    // Normalize to exact total duration
    const sum = durations.reduce((a, b) => a + b, 0);
    const scale = totalDuration / sum;
    return durations.map(d => d * scale);
}

// Phoneme duration weights based on linguistic patterns
const PHONEME_WEIGHTS = {
    // Vowels - longer durations
    'AA': 1.2, 'AE': 1.1, 'AH': 0.9, 'AO': 1.2, 'AW': 1.3,
    'AY': 1.3, 'EH': 1.0, 'ER': 1.1, 'EY': 1.2,
    'IH': 0.9, 'IY': 1.1, 'OW': 1.3, 'OY': 1.3,
    'UH': 1.0, 'UW': 1.2,
    
    // Stops - very short
    'B': 0.6, 'P': 0.6, 'T': 0.6, 'D': 0.6, 'K': 0.6, 'G': 0.6,
    
    // Fricatives - medium
    'F': 0.9, 'V': 0.9, 'TH': 0.9, 'DH': 0.9,
    'S': 1.0, 'Z': 1.0, 'SH': 1.0, 'ZH': 1.0, 'HH': 0.8,
    
    // Affricates - medium
    'CH': 1.0, 'JH': 1.0,
    
    // Nasals - medium
    'M': 0.9, 'N': 0.9, 'NG': 1.0,
    
    // Liquids - medium
    'L': 0.9, 'R': 1.0,
    
    // Glides - short
    'W': 0.8, 'Y': 0.8
};

// Main function: estimate phoneme durations from audio
export async function estimateDurationsFromAudio(buffer, phonemes) {
    const wavData = await wav.decode(buffer);
    const sampleRate = wavData.sampleRate;
    const signal = wavData.channelData[0];
    const totalDuration = signal.length / sampleRate;

    // Step 1: Calculate base durations from phoneme weights
    const weights = phonemes.map(p => PHONEME_WEIGHTS[p] || 1.0);
    const totalWeight = weights.reduce((sum, w) => sum + w, 0);
    const baseDurations = weights.map(w => (w / totalWeight) * totalDuration);

    // Step 2: Compute spectral features for energy-based refinement
    const melFrames = computeMelSpectrogram(
        signal,
        sampleRate,
        DSP_CONFIG.nFft,
        DSP_CONFIG.hopLength,
        DSP_CONFIG.nMels,
        DSP_CONFIG.fMin
    );
    
    const flux = computeSpectralFlux(melFrames);

    // Step 3: Calculate energy per phoneme segment
    const framesPerPhone = melFrames.length / phonemes.length;
    const energies = phonemes.map((_, i) => {
        const startFrame = Math.floor(i * framesPerPhone);
        const endFrame = Math.floor((i + 1) * framesPerPhone);
        
        let energy = 0;
        for (let f = startFrame; f < endFrame && f < flux.length; f++) {
            energy += flux[f];
        }
        
        return energy / (endFrame - startFrame);
    });

    // Step 4: Adjust durations based on energy (±20% variation)
    const avgEnergy = energies.reduce((sum, e) => sum + e, 0) / energies.length;
    const adjustedDurations = baseDurations.map((duration, i) => {
        const energyFactor = 0.8 + 0.4 * (energies[i] / (avgEnergy || 1));
        return duration * Math.max(0.8, Math.min(1.2, energyFactor));
    });

    // Step 5: Normalize to exact total duration
    const sum = adjustedDurations.reduce((a, b) => a + b, 0);
    const scale = totalDuration / sum;
    
    return adjustedDurations.map(d => d * scale);
}
