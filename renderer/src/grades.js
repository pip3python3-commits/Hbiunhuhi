// One dominant hue + its complement per scene, with the shared aubergine shadow colour (#34202B) everywhere.
export const GRADES = {
  dayCool:   { skyTop: '#3b74d6', skyBot: '#c6e4ff', fog: '#bcd8f2', fogNear: 90,  fogFar: 420, sun: '#fff0cc', sunI: 3.0, sunDir: [-0.55, 0.55, 0.45], hemiSky: '#8fb8ff', hemiGnd: '#34202b', hemiI: 1.0, cloud: '#ffffff', sat: 1.12 },
  goldHour:  { skyTop: '#d9863a', skyBot: '#ffe0a0', fog: '#f2cf9a', fogNear: 80,  fogFar: 380, sun: '#ffd08a', sunI: 3.2, sunDir: [-0.6, 0.38, 0.5],  hemiSky: '#9fb4ff', hemiGnd: '#34202b', hemiI: 0.95, cloud: '#ffe9c4', sat: 1.15 },
  heat:      { skyTop: '#e8541e', skyBot: '#ffc36a', fog: '#f7b26a', fogNear: 70,  fogFar: 340, sun: '#ffe2a0', sunI: 3.6, sunDir: [-0.4, 0.7, 0.45],  hemiSky: '#ffb070', hemiGnd: '#4a1e24', hemiI: 0.9, cloud: '#ffd9a8', sat: 1.2 },
  alarm:     { skyTop: '#3a2a78', skyBot: '#f0643f', fog: '#9a5a6e', fogNear: 60,  fogFar: 300, sun: '#ffb877', sunI: 2.8, sunDir: [-0.5, 0.35, 0.6],  hemiSky: '#6a7ae0', hemiGnd: '#34202b', hemiI: 0.85, cloud: '#e89a8a', sat: 1.18 },
  aftermath: { skyTop: '#46507e', skyBot: '#b3a9c2', fog: '#8f8aa6', fogNear: 50,  fogFar: 260, sun: '#e8d6c8', sunI: 2.0, sunDir: [-0.5, 0.5, 0.5],  hemiSky: '#7c88c0', hemiGnd: '#34202b', hemiI: 0.9, cloud: '#c9c2d6', sat: 0.92 },
  rescue:    { skyTop: '#c97a2a', skyBot: '#ffd98f', fog: '#e8b878', fogNear: 60,  fogFar: 300, sun: '#ffc476', sunI: 3.0, sunDir: [-0.65, 0.3, 0.45], hemiSky: '#8aa0e0', hemiGnd: '#34202b', hemiI: 0.9, cloud: '#ffe0b0', sat: 1.1 },
  court:     { skyTop: '#000', skyBot: '#000', fog: '#3d2a30', fogNear: 60,  fogFar: 200, sun: '#ffdca0', sunI: 2.6, sunDir: [0.5, 0.8, 0.9],   hemiSky: '#9ab8f0', hemiGnd: '#34202b', hemiI: 1.15, cloud: '#fff', sat: 1.12 },
  court2:    { skyTop: '#000', skyBot: '#000', fog: '#2f3a4a', fogNear: 60,  fogFar: 200, sun: '#fff0d0', sunI: 2.8, sunDir: [0.6, 0.8, 0.8],   hemiSky: '#a8c8ff', hemiGnd: '#34202b', hemiI: 1.2, cloud: '#fff', sat: 1.15 },
};
