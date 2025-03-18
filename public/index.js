// Parameter definitions
const numericParameterDefs = {
    "timeMultiplier": {
      "min": 0,
      "max": 0.01,
      "step": 0.00001,
      "defaultValue": 0.0003,
    },
    "amplitude": {
      "min": 0,
      "max": 200,
      "step": 1,
      "defaultValue": 140,
    },
    "noiseSize": {
      "min": 0,
      "max": 100,
      "step": 1,
      "defaultValue": 80,
    },
    "noiseScale": {
      "min": 0,
      "max": 0.1,
      "step": 0.0001,
      "defaultValue": 0.0026,
    },
    "steps": {
      "min": 0,
      "max": 100,
      "step": 1,
      "defaultValue": 85,
    },
    "noiseDetailOctave": {
      "min": 0,
      "max": 10,
      "step": 1,
      "defaultValue": 5,
    },
    "noiseDetailFalloff": {
      "min": 0,
      "max": 1,
      "step": 0.05,
      "defaultValue": 0.7,
    },
    "trailTransparency": {
      "min": 0,
      "max": 255,
      "step": 1,
      "defaultValue": 15,
    }
  };
  
  // Initialize parameter store
  const parameterStore = {};
  Object.entries(numericParameterDefs).forEach(([key, def]) => {
    parameterStore[key] = def.defaultValue;
  });
  
  // Global variables
  let canvasSize;
  let frame_count = 0;
  let particleLayer;
  let amp;
  let music;
  let ampBuffer = [];
  let particles = []; // Array to store particles
  
  function preload() {
    userStartAudio();
    music = loadSound("./dancing_buffers.mp4");
    music.amp(0.4);
  
    // userStartAudio();
    // can preload assets here...
  }
  
  function setup() {
  
    amp = new p5.Amplitude()
    console.log("amp", amp)
    music.connect(amp);
  
    // Determine the canvas size based on screen width
    canvasSize = Math.min(500, window.innerWidth - 20); // 20px buffer
  
    createCanvas(canvasSize, canvasSize, WEBGL);
    setAttributes('alpha', true);
  
    // Create particle layer with same dimensions and renderer
    particleLayer = createGraphics(canvasSize, canvasSize, WEBGL);
    particleLayer.setAttributes('alpha', true);
  
    background("#050818");
    particleLayer.clear();
  }
  
  // Handle window resizing
  function windowResized() {
    // Update canvas size when window is resized
    const newSize = Math.min(500, window.innerWidth - 20);
  
    // Only resize if the size actually changed
    if (newSize !== canvasSize) {
      canvasSize = newSize;
      resizeCanvas(canvasSize, canvasSize);
  
      // Recreate the particle layer with new size
      particleLayer = createGraphics(canvasSize, canvasSize, WEBGL);
      particleLayer.setAttributes('alpha', true);
  
      background("#050818");
    }
  }
  
  
  
  function draw() {
    if (!music.isPlaying()) {
      music.play()
    }
    frame_count += 1;
  
    let frame_level_mult = 3
  
    let level = amp.getLevel();
    console.log("level", level);
  
    ampBuffer.unshift(level)
  
  
  
    let timeMultiplier = parameterStore.timeMultiplier;
    let noiseSize = parameterStore.noiseSize;
    let falloff = parameterStore.noiseDetailFalloff;
    let octaves = parameterStore.noiseDetailOctave;
    let trailTransparency = parameterStore.trailTransparency;
  
    // Set noise detail for both canvases
    noiseDetail(octaves, falloff);
    particleLayer.noiseDetail(octaves, falloff);
  
    // Draw background directly on main canvas
    background("#050818");
  
    // Apply fade effect to particle layer
    particleLayer.push();
    particleLayer.blendMode(BLEND);
    let alphaHex = Math.floor(trailTransparency).toString(16).padStart(2, '0');
    particleLayer.fill("#000000" + alphaHex);
    particleLayer.noStroke();
    particleLayer.rect(-particleLayer.width / 2, -particleLayer.height / 2, particleLayer.width, particleLayer.height);
    particleLayer.pop();
  
    // get the current time
    let time = millis() * timeMultiplier;
  
    let period = Math.PI;
    const delta = period / parameterStore.steps;
  
    let amplitude = parameterStore.amplitude;
    let center_x = 0;
    let center_y = 0;
    let radius = 3;
  
    // Draw particles on the particle layer
    particleLayer.blendMode(BLEND);
    let particle_n = 0
    for (let i = 0; i < period; i += delta) {
  
      let angle = i;
      let noiseVal = 0;
  
      let particleColor = lerpColor(color("#C89933"), color("#E2F1AF"), 0.0 + Math.abs(noise(frame_count * 0.08 - angle)));
  
      if (particle_n < ampBuffer.length) {
        noiseVal = Math.abs(ampBuffer[particle_n])
        if (noiseVal < 0.03) {
  
          particleColor = lerpColor(color("#151E3F"), color("#2C8C99"), 0.0 + Math.abs(noise(frame_count * 0.08 - angle)));
  
        }
  
      }
  
  
      noiseVal *= 20;
      // let noiseVal = noise(frame_count * 0.01 - angle);
      // let noiseVal = level * 20;
      let x1 = center_x + (amplitude + Math.abs(noiseVal) * noiseSize) * Math.sin(angle);
      let y1 = center_y + (amplitude + Math.abs(noiseVal) * noiseSize) * Math.cos(angle);
  
      let x2 = center_x - (amplitude + Math.abs(noiseVal) * noiseSize) * Math.sin(angle);
      let y2 = y1;
      let color1 = lerpColor(color("#151E3F"), color("#2C8C99"), 0.0 + Math.abs(noise(frame_count * 0.08 - angle)));
      let color2 = lerpColor(color("#151E3F"), color("#2C8C99"), 0.0 + Math.abs(noise(frame_count * 0.08 + angle + Math.PI)));
  
      particleLayer.fill(particleColor);
      particleLayer.noStroke();
      particleLayer.circle(x1, y1, radius);
      particleLayer.fill(particleColor);
      particleLayer.circle(x2, y2, radius);
  
      particle_n += 1;
    }
  
    // Composite the particle layer onto the main canvas
    push();
    imageMode(CORNER);
    translate(-width / 2, -height / 2);
    blendMode(BLEND);
    image(particleLayer, 0, 0, width, height);
    filter(BLUR, 2)
    blendMode(ADD);
    image(particleLayer, 0, 0, width, height);
    pop();
  }