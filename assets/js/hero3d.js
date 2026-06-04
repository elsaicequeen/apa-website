/* =========================================================================
   3D aurora hero — restrained, light lilac/lavender flowing gradient.
   Three.js (CDN, ES module). A full-bleed plane with a custom fragment
   shader: layered flowing noise blending lavender tones. Deliberately slow
   and low-amplitude — calming, "not overboard".

   Falls back gracefully (CSS gradient already painted via .hero__fallback):
     - prefers-reduced-motion  -> skip entirely
     - no WebGL / load failure -> skip entirely
     - tab hidden / off-screen -> pause the render loop
   Built on the threejs-webgl approach from freshtechbro/claudedesignskills.
   ========================================================================= */

const canvas = document.getElementById('hero-canvas');
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

async function initAurora() {
  if (!canvas || reduceMotion) return;

  // Acquire the GL context ourselves and hand it to Three (via the `context`
  // option) so Three never tries to create a second, possibly-conflicting one.
  // If no context is available, the CSS lavender fallback simply stays.
  let gl;
  try {
    const opts = { alpha: true, antialias: true, powerPreference: 'low-power' };
    gl = canvas.getContext('webgl2', opts) || canvas.getContext('webgl', opts) ||
         canvas.getContext('experimental-webgl', opts);
  } catch (e) { /* ignore */ }
  if (!gl) return;

  let THREE;
  try {
    THREE = await import('https://unpkg.com/three@0.160.0/build/three.module.js');
  } catch (e) {
    return; // CDN unreachable -> keep CSS fallback
  }

  // Everything below can throw if a GL context can't be created
  // (lost context, sandboxed canvas, etc.). On any failure we simply keep
  // the CSS lavender gradient that's already painted behind the hero.
  try {

  const renderer = new THREE.WebGLRenderer({ canvas, context: gl, antialias: true, alpha: true });
  renderer.setClearColor(0x000000, 0);
  const DPR = Math.min(window.devicePixelRatio || 1, 1.75); // cap DPR for perf
  renderer.setPixelRatio(DPR);

  const scene = new THREE.Scene();
  const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

  const uniforms = {
    u_time:   { value: 0 },
    u_res:    { value: new THREE.Vector2(1, 1) },
    u_mouse:  { value: new THREE.Vector2(0.5, 0.5) },
    // Lavender / lilac / white palette
    u_c1: { value: new THREE.Color('#f6f1ff') }, // near-white
    u_c2: { value: new THREE.Color('#d9c8fb') }, // soft lilac
    u_c3: { value: new THREE.Color('#b59ff0') }, // lilac
    u_c4: { value: new THREE.Color('#efe7ff') }, // pale violet
  };

  const fragment = `
    precision highp float;
    varying vec2 vUv;
    uniform float u_time;
    uniform vec2  u_res;
    uniform vec2  u_mouse;
    uniform vec3  u_c1, u_c2, u_c3, u_c4;

    // value noise + fbm
    vec2 hash(vec2 p){
      p = vec2(dot(p, vec2(127.1, 311.7)), dot(p, vec2(269.5, 183.3)));
      return -1.0 + 2.0 * fract(sin(p) * 43758.5453123);
    }
    float noise(vec2 p){
      vec2 i = floor(p); vec2 f = fract(p);
      vec2 u = f * f * (3.0 - 2.0 * f);
      return mix(mix(dot(hash(i + vec2(0.0,0.0)), f - vec2(0.0,0.0)),
                     dot(hash(i + vec2(1.0,0.0)), f - vec2(1.0,0.0)), u.x),
                 mix(dot(hash(i + vec2(0.0,1.0)), f - vec2(0.0,1.0)),
                     dot(hash(i + vec2(1.0,1.0)), f - vec2(1.0,1.0)), u.x), u.y);
    }
    float fbm(vec2 p){
      float v = 0.0; float a = 0.5;
      for(int i = 0; i < 5; i++){ v += a * noise(p); p *= 2.0; a *= 0.5; }
      return v;
    }

    void main(){
      vec2 uv = vUv;
      float aspect = u_res.x / max(u_res.y, 1.0);
      vec2 p = vec2(uv.x * aspect, uv.y);

      float t = u_time * 0.04;                 // slow drift
      vec2 par = (u_mouse - 0.5) * 0.18;        // gentle pointer parallax

      // flowing domain warp
      float n1 = fbm(p * 1.6 + vec2(t, -t * 0.7) + par);
      float n2 = fbm(p * 2.3 - vec2(t * 0.6, t) + n1 + par * 1.5);
      float n  = fbm(p * 1.2 + n2 * 0.8 + vec2(-t * 0.5, t * 0.4));

      float m = smoothstep(-0.6, 0.8, n);
      vec3 col = mix(u_c1, u_c2, smoothstep(0.0, 0.6, m));
      col = mix(col, u_c3, smoothstep(0.45, 1.0, n2 * 0.5 + 0.5) * 0.6);
      col = mix(col, u_c4, smoothstep(0.2, 0.9, n1 * 0.5 + 0.5) * 0.4);

      // soft vignette toward white so content stays legible
      float vig = smoothstep(1.25, 0.2, length(uv - vec2(0.35, 0.5)));
      col = mix(vec3(0.97, 0.95, 1.0), col, 0.55 + vig * 0.35);

      gl_FragColor = vec4(col, 1.0);
    }
  `;

  const material = new THREE.ShaderMaterial({
    uniforms,
    vertexShader: `varying vec2 vUv; void main(){ vUv = uv; gl_Position = vec4(position, 1.0); }`,
    fragmentShader: fragment,
  });

  const quad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), material);
  scene.add(quad);

  function resize() {
    const w = canvas.clientWidth || window.innerWidth;
    const h = canvas.clientHeight || window.innerHeight;
    renderer.setSize(w, h, false);
    uniforms.u_res.value.set(w * DPR, h * DPR);
  }
  resize();
  window.addEventListener('resize', resize, { passive: true });

  // gentle pointer parallax (lerped)
  const target = { x: 0.5, y: 0.5 };
  window.addEventListener('pointermove', (e) => {
    target.x = e.clientX / window.innerWidth;
    target.y = e.clientY / window.innerHeight;
  }, { passive: true });

  // pause when tab hidden or hero scrolled off-screen
  let running = true;
  document.addEventListener('visibilitychange', () => {
    running = !document.hidden;
    if (running) loop();
  });
  const io = new IntersectionObserver((entries) => {
    running = entries[0].isIntersecting && !document.hidden;
    if (running) loop();
  }, { threshold: 0.01 });
  io.observe(canvas);

  let raf = 0;
  const clock = new THREE.Clock();
  function loop() {
    if (!running) { cancelAnimationFrame(raf); return; }
    uniforms.u_time.value += clock.getDelta();
    uniforms.u_mouse.value.x += (target.x - uniforms.u_mouse.value.x) * 0.04;
    uniforms.u_mouse.value.y += (target.y - uniforms.u_mouse.value.y) * 0.04;
    renderer.render(scene, camera);
    raf = requestAnimationFrame(loop);
  }
  loop();

  } catch (e) {
    if (canvas) canvas.style.display = 'none'; // ensure CSS fallback shows
    return;
  }
}

initAurora();
