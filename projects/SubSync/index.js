// Import required modules
const fs = require('fs'); // File system module for reading and writing files
const path = require('path'); // Path module for handling file and directory paths
const ffmpeg = require('fluent-ffmpeg'); // ffmpeg library for handling multimedia files
const openai = require('openai'); // OpenAI API client for transcription
const request = require('request'); // Request module for making HTTP requests
const retry = require('async-retry'); // Retry module for retrying async functions on errors
const { createReadStream } = require('fs'); // CreateReadStream for reading files as streams
const { promisify } = require('util'); // Promisify for converting callback-based functions to promises
const { exec } = require('child_process'); // Exec for running shell commands
const execPromise = promisify(exec); // Promisified version of exec

// Define constants
const AUDIO_EXTENSIONS = ['.mp3', '.wav', '.ogg', '.m4a', '.mp4', '.mpeg']; // Supported audio file extensions

// Create a custom error class for API errors
class APIError extends Error { }

// Check if the file is a valid audio or video file
async function is_valid_audio_video(filePath) {
    return new Promise((resolve, reject) => {
        ffmpeg.ffprobe(filePath, (err, metadata) => {
            if (err) {
                console.warn(Invalid or unsupported file: ${ filePath });
                resolve(false);
            } else {
                resolve(metadata.streams.some(stream => ['audio', 'video'].includes(stream.codec_type)));
            }
        });
    });
}

// Get the file size of a given file
function get_file_size(filePath) {
    return fs.statSync(filePath).size;
}

// Convert bytes to megabytes
function convert_bytes_to_mb(bytes) {
    return bytes / (1024 * 1024);
}

// Transcribe the audio file using OpenAI API
async function transcribe_audio(filePath, print_transcript = false) {
    if (print_transcript) {
        console.log(Transcribing: \n${ filePath }\n);
    }

    const fileSize = get_file_size(filePath);
    const maxFileSize = 26214400; // 25 MB

    // Check if the file size is within the API limits
    if (fileSize > maxFileSize) {
        console.log(Error: ${ filePath } exceeds the API file size limit of ${ maxFileSize } bytes.);
        return null;
    }

    // Create a read stream for the audio file
    const audioFile = createReadStream(filePath);
    const fileSizeMB = convert_bytes_to_mb(fileSize);
    console.log(Before API call for: \n${ filePath } \n);
    console.log(${ fileSizeMB.toFixed(2) } MB);

    let transcript;
    try {
        // Call OpenAI API to transcribe the audio file
        transcript = await openai.Audio.create({
            file: audioFile,
            purpose: 'transcription',
            model: 'whisper-v1',
        });
        const transcriptId = transcript.id;


        // Wait for the transcription to complete
        while (true) {
            await new Promise(resolve => setTimeout(resolve, 5000));
            transcript = await openai.Audio.retrieve(transcriptId);
            const status = transcript.status;
            if (status === 'completed' || status === 'error') {
                break;
            }
        }

        // Check for transcription errors
        if (transcript.status === 'error') {
            throw new APIError(`Transcription failed for ${filePath}`);
        }
    } catch (e) {
        console.error(Error during transcription API call for ${ filePath }: ${ e });
        return null;
    }

    console.log(`AfterAPI call for:\n${filePath}\n); const timeTaken = (Date.now() - startTime) / 1000; const minutes = Math.floor(timeTaken / 60); const seconds = Math.floor(timeTaken % 60); console.log(API call for ${filePath} took ${minutes} minutes and ${seconds} seconds`);

    // If no transcript is returned, log the error and return null
    if (!transcript) {
        console.log(No transcript returned for ${ filePath });
        return null;
    }

    // Print the transcript if the print_transcript option is set to true
    if (print_transcript) {
        console.log(transcript.text);
    }
    return transcript;
}

// Add other functions, main logic and command line argument parsing
// (e.g., main function, command line argument processing, error handling, etc.)