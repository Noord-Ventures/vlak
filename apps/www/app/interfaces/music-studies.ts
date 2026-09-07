export const musicStudies = [{
  slug: "music", title: "Music session", what: "Music session",
  voice: "Turn a small loop into a playable session.",
  law: "A working four-track clip launcher, step sequencer, and audio mixer.",
  story: "A music workspace with four synthesized instruments, four scenes, and editable sixteen-step clips. Launch a scene, shape the selected pattern, and mix each channel while it plays. The browser schedules and synthesizes the audio; the session can be exported as a stereo wave file.",
  type: "Clip launcher, pattern editor, channel mixer", module: "Grid system",
  ink: "Monochrome clip slots, quiet beat divisions, and a clear moving playhead.",
  use: "Launch a scene → edit a pattern → mix and export audio",
  field: "A transport above a clip matrix, with a focused pattern editor and instrument controls.",
  note: "Press Play to hear the session. Four instruments are synthesized locally with Web Audio, without downloads or a music service. Clip edits, tempo, mute, solo, gain, pan, and tone affect the sound. Export renders four bars of the active clips as a stereo wave file; Save session downloads the editable project as JSON.",
  components: ["Button", "Icon", "Input", "Select", "Number field", "Toggle group", "Channel strip", "Audio meter", "Parameter knob"],
  modifications: [
    "Buttons compose transport and clip launching. Number field sets tempo, Input names the session, and Select chooses a clip's root note.",
    "Channel strip controls the actual gain, pan, mute, and solo mix. Parameter knob shapes the selected instrument's tone; Audio meter reads real channel signals from Web Audio analysers.",
    "A custom accessible sixteen-step grid gives the editor its musical structure. Audio is scheduled ahead on the audio clock; the visual playhead follows that clock independently.",
  ],
}] as const;

export const musicMobilePatterns = {
  music: "On mobile, Session, Clip, and Mixer are focused screens behind persistent navigation. The clip matrix and step grid keep their readable target sizes in bounded horizontal viewports. Transport stays above the scrolling workspace, and switching screens preserves playback and the selected clip.",
};
