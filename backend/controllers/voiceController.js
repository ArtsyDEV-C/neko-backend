const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');

exports.transcribeAudio = async (req, res) => {
    // Check if file is uploaded
    if (!req.file) {
        return res.status(400).json({ message: "No audio file uploaded" });
    }

    // Validate file type and size (example: limit to 10MB and only accept .wav files)
    if (req.file.mimetype !== 'audio/wav' || req.file.size > 10 * 1024 * 1024) {
        return res.status(400).json({ message: "Invalid file type or size" });
    }

    try {
        const form = new FormData();
        form.append('audio', fs.createReadStream(req.file.path));

        const response = await axios.post('http://localhost:5005/asr', form, {
            headers: form.getHeaders()
        });

        res.json({ text: response.data.text });

        // Optional: remove file after use
        fs.unlink(req.file.path, (err) => {
            if (err) console.error("Failed to delete file:", err);
        });
    } catch (error) {
        console.error("ASR API error:", error.message);
        res.status(500).json({ message: "ASR transcription failed" });
    }
};