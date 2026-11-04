// 3D hero scene — floating laptop with design content on screen,
// orbiting design symbols, and a particle field. Built with Three.js.

import * as THREE from "three";

const container = document.getElementById("heroCanvasContainer");
const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

if (container) init();

function init() {
  const scene = new THREE.Scene();

  const camera = new THREE.PerspectiveCamera(
    45,
    container.clientWidth / container.clientHeight,
    0.1,
    100
  );
  camera.position.set(0, 1.4, 7);

  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(container.clientWidth, container.clientHeight);
  container.appendChild(renderer.domElement);

  // ---------- Lights ----------
  scene.add(new THREE.AmbientLight(0xe8d6ba, 1.15));

  const keyLight = new THREE.DirectionalLight(0xfff2e0, 1.5);
  keyLight.position.set(4, 6, 5);
  scene.add(keyLight);

  const warmGlow = new THREE.PointLight(0xf13c15, 2.5, 12);
  warmGlow.position.set(0, 1.4, 2.4);
  scene.add(warmGlow);

  const copperRim = new THREE.PointLight(0xb87333, 3.5, 14);
  copperRim.position.set(-4, 2, -3);
  scene.add(copperRim);

  // ---------- Laptop ----------
  const laptop = new THREE.Group();

  const bodyMat = new THREE.MeshStandardMaterial({
    color: 0xb5762f,
    metalness: 0.7,
    roughness: 0.34,
  });
  const darkMat = new THREE.MeshStandardMaterial({
    color: 0x2a1a10,
    metalness: 0.4,
    roughness: 0.6,
  });

  // Base
  const base = new THREE.Mesh(new THREE.BoxGeometry(3.2, 0.14, 2.2), bodyMat);
  laptop.add(base);

  // Keyboard well
  const kbWell = new THREE.Mesh(new THREE.BoxGeometry(2.9, 0.02, 1.6), darkMat);
  kbWell.position.set(0, 0.08, -0.1);
  laptop.add(kbWell);

  // Keys grid
  const keyGeo = new THREE.BoxGeometry(0.16, 0.03, 0.16);
  const keyMat = new THREE.MeshStandardMaterial({
    color: 0x3a2718,
    metalness: 0.3,
    roughness: 0.7,
  });
  for (let row = 0; row < 5; row++) {
    for (let col = 0; col < 13; col++) {
      const key = new THREE.Mesh(keyGeo, keyMat);
      key.position.set(-1.26 + col * 0.21, 0.1, -0.72 + row * 0.21);
      laptop.add(key);
    }
  }
  // Spacebar + trackpad
  const spacebar = new THREE.Mesh(new THREE.BoxGeometry(1.1, 0.03, 0.16), keyMat);
  spacebar.position.set(0, 0.1, 0.33);
  laptop.add(spacebar);
  const trackpad = new THREE.Mesh(new THREE.BoxGeometry(1.0, 0.015, 0.55), keyMat);
  trackpad.position.set(0, 0.08, 0.75);
  laptop.add(trackpad);

  // Screen lid
  const lid = new THREE.Group();
  lid.position.set(0, 0.07, -1.1);

  const screenBack = new THREE.Mesh(new THREE.BoxGeometry(3.2, 2.1, 0.09), bodyMat);
  screenBack.position.set(0, 1.05, 0);
  lid.add(screenBack);

  // Design content on screen (canvas, continuously typed)
  const screenCanvas = document.createElement("canvas");
  screenCanvas.width = 640;
  screenCanvas.height = 400;
  const sctx = screenCanvas.getContext("2d");
  const screenTexture = new THREE.CanvasTexture(screenCanvas);
  screenTexture.colorSpace = THREE.SRGBColorSpace;

  const screenMat = new THREE.MeshBasicMaterial({ map: screenTexture });
  const screenFace = new THREE.Mesh(new THREE.PlaneGeometry(3.0, 1.9), screenMat);
  screenFace.position.set(0, 1.05, 0.05);
  lid.add(screenFace);

  lid.rotation.x = -0.22;
  laptop.add(lid);

  laptop.position.y = -0.4;
  laptop.rotation.x = 0.24;
  scene.add(laptop);

  // ---------- Design content on the screen ----------
  const codeLines = [
    "const fares = {",
    "  role: 'Graphic Designer',",
    "  tools: ['Ps', 'Ai', 'Ae'],",
    "  style: 'bold & minimal',",
    "  years: 5,",
    "};",
    "",
    "// motion · video · design",
    "// turning ideas into visuals",
  ];
  let typedChars = 0;
  const totalChars = codeLines.join("\n").length;

  function drawScreen() {
    sctx.fillStyle = "#1a0f0a";
    sctx.fillRect(0, 0, 640, 400);

    // window chrome
    sctx.fillStyle = "#2b1810";
    sctx.fillRect(0, 0, 640, 36);
    const dotColors = ["#ff5f57", "#febc2e", "#28c840"];
    dotColors.forEach((c, i) => {
      sctx.fillStyle = c;
      sctx.beginPath();
      sctx.arc(24 + i * 26, 18, 7, 0, Math.PI * 2);
      sctx.fill();
    });
    sctx.fillStyle = "#8a7a68";
    sctx.font = "13px monospace";
    sctx.fillText("identity.fig — fares", 110, 23);

    // typed design content
    sctx.font = "600 19px monospace";
    let remaining = typedChars;
    let y = 70;
    for (const line of codeLines) {
      if (remaining <= 0) break;
      const shown = line.slice(0, remaining);
      remaining -= line.length + 1;

      if (shown.trim().startsWith("//")) sctx.fillStyle = "#a08a76";
      else if (/^(const)/.test(shown.trim())) sctx.fillStyle = "#ff6a3c";
      else if (shown.trim().startsWith("role") || shown.trim().startsWith("tools") || shown.trim().startsWith("style") || shown.trim().startsWith("years")) sctx.fillStyle = "#b87333";
      else sctx.fillStyle = "#f2e9dc";

      sctx.fillText(shown, 28, y);
      y += 26;
    }
    // caret
    if (Math.floor(performance.now() / 500) % 2 === 0) {
      sctx.fillStyle = "#ff6a3c";
      sctx.fillRect(28 + measureCaretX(), y - 42, 10, 20);
    }
    screenTexture.needsUpdate = true;
  }

  function measureCaretX() {
    let remaining = typedChars;
    let lastLine = "";
    for (const line of codeLines) {
      if (remaining <= 0) break;
      lastLine = line.slice(0, remaining);
      remaining -= line.length + 1;
    }
    return sctx.measureText(lastLine).width;
  }

  // ---------- Floating design symbols ----------
  const symbols = ["Aa", "◆", "✦", "[ ]", "○", "⬡"];
  const sprites = [];
  symbols.forEach((sym, i) => {
    const c = document.createElement("canvas");
    c.width = 128;
    c.height = 64;
    const cx = c.getContext("2d");
    cx.font = "700 40px monospace";
    cx.textAlign = "center";
    cx.textBaseline = "middle";
    cx.fillStyle = i % 2 === 0 ? "#f13c15" : "#b87333";
    cx.shadowColor = cx.fillStyle;
    cx.shadowBlur = 8;
    cx.fillText(sym, 64, 32);

    const tex = new THREE.CanvasTexture(c);
    tex.colorSpace = THREE.SRGBColorSpace;
    const sprite = new THREE.Sprite(
      new THREE.SpriteMaterial({ map: tex, transparent: true, opacity: 0.85 })
    );
    const angle = (i / symbols.length) * Math.PI * 2;
    sprite.userData = { angle, radius: 2.9 + (i % 3) * 0.45, speed: 0.14 + (i % 3) * 0.04, yBase: 0.4 + (i % 2) * 0.9 };
    sprite.scale.set(0.85, 0.42, 1);
    sprites.push(sprite);
    scene.add(sprite);
  });

  // ---------- Particle field ----------
  const particleCount = 260;
  const positions = new Float32Array(particleCount * 3);
  for (let i = 0; i < particleCount; i++) {
    positions[i * 3] = (Math.random() - 0.5) * 16;
    positions[i * 3 + 1] = (Math.random() - 0.5) * 10;
    positions[i * 3 + 2] = (Math.random() - 0.5) * 10 - 2;
  }
  const particleGeo = new THREE.BufferGeometry();
  particleGeo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  const particles = new THREE.Points(
    particleGeo,
    new THREE.PointsMaterial({ color: 0xb87333, size: 0.035, transparent: true, opacity: 0.45 })
  );
  scene.add(particles);

  // ---------- Mouse parallax ----------
  let mouseX = 0;
  let mouseY = 0;
  window.addEventListener("pointermove", (e) => {
    mouseX = (e.clientX / window.innerWidth - 0.5) * 2;
    mouseY = (e.clientY / window.innerHeight - 0.5) * 2;
  });

  // ---------- Resize ----------
  const resizeObserver = new ResizeObserver(() => {
    const w = container.clientWidth;
    const h = container.clientHeight;
    if (w === 0 || h === 0) return;
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h);
  });
  resizeObserver.observe(container);

  // ---------- Animate ----------
  const clock = new THREE.Clock();
  let lastType = 0;

  function animate() {
    requestAnimationFrame(animate);
    const t = clock.getElapsedTime();

    if (!reducedMotion) {
      if (t - lastType > 0.05) {
        typedChars = typedChars >= totalChars + 60 ? 0 : typedChars + 1;
        lastType = t;
      }

      laptop.position.y = -0.4 + Math.sin(t * 0.9) * 0.09;
      laptop.rotation.y = Math.sin(t * 0.35) * 0.28 + mouseX * 0.22;
      laptop.rotation.x = 0.24 + mouseY * 0.1;

      sprites.forEach((s) => {
        const u = s.userData;
        const a = u.angle + t * u.speed;
        s.position.set(
          Math.cos(a) * u.radius,
          u.yBase + Math.sin(t * 0.8 + u.angle * 3) * 0.25,
          Math.sin(a) * u.radius - 0.5
        );
      });

      particles.rotation.y = t * 0.02;
      camera.position.x += (mouseX * 0.4 - camera.position.x) * 0.03;
      camera.position.y += (1.4 - mouseY * 0.3 - camera.position.y) * 0.03;
      camera.lookAt(0, 0.5, 0);
    } else {
      typedChars = totalChars;
    }

    drawScreen();
    renderer.render(scene, camera);
  }
  animate();
}
