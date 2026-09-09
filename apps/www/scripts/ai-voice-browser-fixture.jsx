import * as React from "react";
import { createRoot } from "react-dom/client";
import { SpeechInput } from "../../../packages/react/dist/components/speech-input.js";

function VoiceFixture() {
  const [mounted, setMounted] = React.useState(true);
  const [text, setText] = React.useState("");
  const [state, setState] = React.useState("idle");
  const transcribe = async (blob, { signal }) => {
    window.__recordingProof = { size: blob.size, type: blob.type, signal };
    if (window.__delayTranscript) return new Promise(resolve => { window.__finishTranscript = resolve; });
    return "Recorded audio fixture";
  };
  return <main>
    <button type="button" onClick={() => setMounted(value => !value)}>{mounted ? "Unmount input" : "Mount input"}</button>
    {mounted && <SpeechInput mode="recording" onAudioRecorded={transcribe} onTranscript={setText} onStatusChange={setState} />}
    <p data-testid="state">{state}</p>
    <p data-testid="transcript">{text}</p>
  </main>;
}
createRoot(document.getElementById("fixture")).render(<VoiceFixture />);
