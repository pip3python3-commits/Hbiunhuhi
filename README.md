# story-shorts

Procedural 3D "story explainer" shorts (painterly low-poly world + rubber-hose stick figures), built entirely in CI.

```
story/molasses.json   narration + storyboard (hand-written, no LLM at build time)
pipeline/tts.py       Kokoro-ONNX TTS -> faster-whisper word timings -> numpy SFX -> build/{audio.wav,timeline.json}
renderer/             Three.js scene (rig.js characters, world.js kit, look.js painterly post) + render.mjs frame driver
.github/workflows/builder.yml   audio -> render (matrix shards) -> mux -> out.mp4 artifact
```

Run the workflow: **Actions -> builder -> Run workflow** (inputs: storyboard, render size, shard count, paint strength).
Locally: `pip install -r requirements.txt && npm i && npx playwright install chromium && ./run_local.sh`.

## Storyboard schema (story/*.json)
- `cast`: `{ id: {type: worker|boss|kid|judge|engineer|rescuer, hat?} }`
- `beats[]`: `narration`, `set` (street|court), `grade` (see renderer/src/grades.js), `cut` (none|whip|flash), `pad`,
  `world` keys (value or [from,to] over the beat): paint, leak, swell, rivets, burst, waveZ, flood, aftermath, thermo,
  `cam` {from,to:{p,t,fov}, ease, shake}, `actors[]` {id, tl:[{at(0..1), anim, face, pos, rot, scale}]}, `sfx[]` {at, type, vol}.
- anims: idle walk wade run wave point present smug shock panic cower sweat paint scoop gavel dejected
- faces: neutral smug smile grin shock panic worried sweat sad angry
- Beat length = TTS length + pad, so cuts always land on the narration.
