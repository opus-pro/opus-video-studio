# Assets and provenance

- `preview/reference.mp4`: 1280 × 720 derivative of the user-approved NUMO 4d film. Viewing reference only; not a rendering input.
- `public/audio/master.m4a`: AAC stream copied from the approved film, SHA-256 `79c0669b5d651a2ed454eb0dcbcbb3d2c5187cbc4e82d3a269284329cce2f5d2`. Original composition plus accepted material/UI sound effects, no voiceover.
- `public/audio/music.m4a`: compact AAC derivative of the final 4d music stem. Procedural drums and synthesizer chords with GeneralUser GS fingered electric bass, rendered through FluidSynth. It is a baked music recording; the SoundFont and isolated instrument samples are not bundled.
- `public/audio/sfx.m4a`: AAC stream copied from the approved material SFX-only preview. Procedurally created paper, optical motion, UI and brand contacts. See the 27 timed cues in `config/audio-cues.json`.
- GeneralUser GS by S. Christian Collins: https://github.com/mrbumpy409/GeneralUser-GS . Upstream license retained verbatim in `licenses/GeneralUser-GS.txt`.
- `public/grain.png`: procedural grain from the original project.
- `public/fonts/GeistVF.woff2`: Geist, accompanying SIL Open Font License in `Geist-OFL.txt`.
- `public/fonts/InstrumentSerif-Regular.ttf`: Instrument Serif, supporting shared typography utilities, accompanying SIL Open Font License in `InstrumentSerif-OFL.txt`.
- Marks, charts, web interface elements and icons are drawn in source. The brand, product and demo data are fictional.

No third-party reference video, audio sample, provider credential or API response is included. Audio provenance is recorded in `config/audio-provenance.json`. Dependencies including Remotion retain their respective licensing terms; this package does not grant additional third-party rights.
