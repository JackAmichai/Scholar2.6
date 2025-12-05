// Voice recognition utilities for speech-to-text

export class VoiceRecognition {
    private recognition: any;
    private isListening: boolean = false;

    constructor() {
        // Check for browser support
        const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

        if (SpeechRecognition) {
            this.recognition = new SpeechRecognition();
            this.recognition.continuous = false;
            this.recognition.interimResults = false;
            this.recognition.lang = 'en-US';
        }
    }

    isSupported(): boolean {
        return !!this.recognition;
    }

    start(onResult: (transcript: string) => void, onError?: (error: string) => void): void {
        if (!this.recognition) {
            onError?.('Speech recognition not supported in this browser');
            return;
        }

        if (this.isListening) {
            return;
        }

        this.isListening = true;

        this.recognition.onresult = (event: any) => {
            const transcript = event.results[0][0].transcript;
            onResult(transcript);
            this.isListening = false;
        };

        this.recognition.onerror = (event: any) => {
            console.error('Speech recognition error:', event.error);
            onError?.(event.error);
            this.isListening = false;
        };

        this.recognition.onend = () => {
            this.isListening = false;
        };

        try {
            this.recognition.start();
        } catch (error) {
            console.error('Failed to start recognition:', error);
            this.isListening = false;
            onError?.('Failed to start voice recognition');
        }
    }

    stop(): void {
        if (this.recognition && this.isListening) {
            this.recognition.stop();
            this.isListening = false;
        }
    }

    getIsListening(): boolean {
        return this.isListening;
    }
}
