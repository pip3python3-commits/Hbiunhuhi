# Sprout Labs — an embedded-systems series

Fourteen long-form (16:9, 1080p) animated episodes that follow three founders building **Sprout**, a self-watering plant pot,
from a blinking LED to a connected, battery-powered, motorised product. The topics follow the chapter structure of
*Making Embedded Systems* (2nd ed., Elecia White) as a syllabus, but the story, explanations, code and diagrams are original.

**Download the videos:** [Releases](https://github.com/pip3python3-commits/Hbiunhuhi/releases) (one release per episode, `epNN-r<run>` with `epNN.mp4`).

| # | Title | Words | Chapters |
|---|---|---|---|
| 01 | Episode 1 - The Fern Incident | 1982 | What Even Is an Embedded System?; Building Code for Another Computer; Debugging Without a Screen; Living Within Your Means; Principles to Steer By; Prototypes and Maker Boards; Hardware and Software, Together |
| 02 | Episode 2 - Draw the Map First | 1909 | Start With the Outside; Block Diagrams; Who Is in Charge?; Layers; Designing for Change; Drivers with a Familiar Shape; Adapters; Interfaces and a Logger; The Sandbox |
| 03 | Episode 3 - The Boards Arrive | 1941 | Where Hardware Meets Software; Bring-Up, Step by Step; Reading Datasheets; Reading Schematics; Practice on a Hobby Board; Keep the Board Alive; The Debugging Toolbox; Testing Hardware with Software; Commands and Responses; When Things Go Wrong |
| 04 | Episode 4 - One Bit at a Time | 1839 | Registers; Binary and Hex; Bitwise Operations; Blinking the LED; Hiding the Hardware; The Main Loop; Reading a Button; Debouncing; Dependency Injection; Timers; PWM: Gentle Power; Ready to Ship? |
| 05 | Episode 5 - Excuse Me, Processor | 1718 | What Is an Interrupt?; Who Goes First?; Saving Your Place; Writing a Handler; Critical Sections; Configuring Interrupts; When Not to Use Interrupts; How Fast Is Fast?; The System Tick; A Very Small Scheduler |
| 06 | Episode 6 - Who Runs Next? | 1499 | Tasks; Preemption and an Operating System; Race Conditions; Priority Inversion; State Machines; Coding a State Machine; The Watchdog; Main Loop Styles; Active Objects |
| 07 | Episode 7 - How Chips Gossip | 1556 | Serial: One Bit After Another; Logic Levels and RS-232; SPI: Fast and Simple; I squared C: Two Wires, Many Chips; One Wire, and Parallel; Buffers and FIFOs; DMA: The Delivery Service; Reading the Analog World |
| 08 | Episode 8 - Sprout Grows Up | 1592 | A Keypad Without Many Pins; Displays; Flyweights and Factories; Memory That Remembers; Sensors: Analog and Digital; The Strategy Pattern; Pipelines and Filters; Speeds and Feeds |
| 09 | Episode 9 - Impossible Bugs | 1558 | The Optimizer Is Not Your Enemy; Hunting the Impossible; Hard Faults; Reading the Crime Scene; The Culprit; Core Dumps and Defenses |
| 10 | Episode 10 - Sprout Goes Online | 1638 | Choosing a Connection; Robust Communication; Checking Integrity; Encryption and Trust; Thinking Like an Attacker; Updating the Code; Signed Updates; Rolling Out Carefully; Many Devices and Manufacturing |
| 11 | Episode 11 - Doing More with Less | 1390 | Reading the Map File; Shrinking the Code; Shrinking RAM Use; The Trouble with Malloc; Finding Where Time Goes; Optimizing the Hot Spot; Small Tricks That Help |
| 12 | Episode 12 - Numbers Without Fear | 1440 | Fast and Slow Operations; The Overflow; Averages; Choosing Better Algorithms; Approximations; Dividing by a Constant; Lookup Tables; Fake Floating Point; Machine Learning on a Chip? |
| 13 | Episode 13 - A Year on Two Batteries | 1377 | Power Basics; Measuring Current; Sleep Modes; Race to Sleep; The Peripheral Budget; The Radio Is the Elephant; The New Budget |
| 14 | Episode 14 - Sprout Turns Toward the Sun | 1401 | Kinds of Motors; Encoders; Driving a DC Motor; Feedback and Control; Tuning; Motion Profiles; Lessons Motors Teach; Shipping Day |

## How it is made
- `episodes/epNN.ep` — the compact script (dialogue, narration, on-screen diagrams).
- `scripts/direct.py` — auto-director: compiles a script into `story/episodes/epNN.json` (cameras, marks, grades, visuals, voices).
- `.github/workflows/builder.yml` — Kokoro TTS + Whisper timing → Three.js frames in sharded headless Chromium → ffmpeg → Release.
  Pushing a `story/episodes/*.json` change (one episode per commit) re-renders that episode. Run status lands on the `ci-status` branch.
- Voices: narrator `bf_emma`, Ada `af_heart`, Ben `am_michael`, Cy `bm_george` (Kokoro).

## Local preview
```bash
npm install
python3 scripts/direct.py episodes/ep01.ep -o story/episodes/ep01.json
python3 pipeline/tts.py --story story/episodes/ep01.json --out build --dry-run
node renderer/render.mjs --timeline build/timeline.json --out build/stills --stills 10,60,120
```
