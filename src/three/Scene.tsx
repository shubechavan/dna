import { useEffect, useMemo, useRef } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { EffectComposer, Bloom, Vignette } from '@react-three/postprocessing';
import * as THREE from 'three';
import ParticleMorph from './ParticleMorph';
import { getShape, SHAPE_META, type ShapeId } from './shapes';
import { SLIDES, type SlideDef } from '../slides';
import { useDeck } from '../store';

/* Pointer tracked on window, because the HTML overlay sits above the canvas. */
const pointer = { x: 0, y: 0 };
if (typeof window !== 'undefined') {
  window.addEventListener('pointermove', (e) => {
    pointer.x = (e.clientX / window.innerWidth) * 2 - 1;
    pointer.y = -((e.clientY / window.innerHeight) * 2 - 1);
  });
}

const damp = THREE.MathUtils.damp;

function isNarrow(w: number, h: number) {
  return w < 900 || w / h < 1.1;
}

function CameraRig({ slide }: { slide: SlideDef }) {
  const { camera, size } = useThree();
  const look = useRef(new THREE.Vector3(...slide.camera.target));
  const goal = useMemo(() => new THREE.Vector3(), []);
  const goalLook = useMemo(() => new THREE.Vector3(), []);
  const shift = useRef({ x: 0, y: 0 });

  useFrame((_, dt) => {
    const cam = camera as THREE.PerspectiveCamera;
    const narrow = isNarrow(size.width, size.height);
    // Push the 3D subject to the right half so it sits beside the text panel.
    const tx = narrow ? 0 : slide.layout === 'wide' ? 0.33 : 0.235;
    const ty = narrow ? 0.2 : 0;
    shift.current.x = damp(shift.current.x, tx, 2.2, dt);
    shift.current.y = damp(shift.current.y, ty, 2.2, dt);
    cam.setViewOffset(size.width, size.height, -shift.current.x * size.width, shift.current.y * size.height, size.width, size.height);

    goal.set(...slide.camera.pos);
    goal.x += pointer.x * 0.9;
    goal.y += pointer.y * 0.55;
    if (narrow) goal.z += 6;
    const k = 1 - Math.exp(-1.6 * dt);
    cam.position.lerp(goal, k);
    goalLook.set(...slide.camera.target);
    look.current.lerp(goalLook, k);
    cam.lookAt(look.current);
  });
  return null;
}

function ShapeRig({ shape }: { shape: ShapeId }) {
  const tilt = useRef<THREE.Group>(null);
  const spin = useRef<THREE.Group>(null);

  useFrame((state, dt) => {
    const meta = SHAPE_META[shape];
    const t = tilt.current!;
    const s = spin.current!;
    t.rotation.x = damp(t.rotation.x, meta.tilt[0], 1.4, dt);
    t.rotation.y = damp(t.rotation.y, meta.tilt[1], 1.4, dt);
    t.rotation.z = damp(t.rotation.z, meta.tilt[2], 1.4, dt);
    if (meta.spin > 0) {
      s.rotation.y += meta.spin * dt;
    } else {
      const TAU = Math.PI * 2;
      const base = Math.round(s.rotation.y / TAU) * TAU;
      s.rotation.y = damp(s.rotation.y, base + Math.sin(state.clock.elapsedTime * 0.35) * meta.sway, 1.2, dt);
    }
  });

  return (
    <group ref={tilt}>
      <group ref={spin}>
        <ParticleMorph shape={shape} />
      </group>
    </group>
  );
}

function Backdrop({ accent }: { accent: string }) {
  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        side: THREE.BackSide,
        depthWrite: false,
        uniforms: { uTint: { value: new THREE.Color(accent) } },
        vertexShader: /* glsl */ `
          varying vec3 vDir;
          void main() {
            vDir = normalize(position);
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          }`,
        fragmentShader: /* glsl */ `
          uniform vec3 uTint;
          varying vec3 vDir;
          void main() {
            vec3 top = vec3(0.0025, 0.0022, 0.006);
            vec3 bottom = vec3(0.008, 0.005, 0.016);
            vec3 col = mix(bottom, top, smoothstep(-0.5, 0.6, vDir.y));
            float g = pow(max(dot(vDir, normalize(vec3(0.3, 0.05, -1.0))), 0.0), 6.0);
            col += uTint * g * 0.05;
            float g2 = pow(max(dot(vDir, normalize(vec3(-0.7, 0.45, -0.6))), 0.0), 4.0);
            col += vec3(0.02, 0.012, 0.05) * g2;
            gl_FragColor = vec4(col, 1.0);
          }`,
      }),
    [],
  );
  const target = useMemo(() => new THREE.Color(), []);
  useFrame((_, dt) => {
    target.set(accent);
    (material.uniforms.uTint.value as THREE.Color).lerp(target, 1 - Math.exp(-1.5 * dt));
  });
  return (
    <mesh material={material} renderOrder={-1}>
      <sphereGeometry args={[150, 32, 16]} />
    </mesh>
  );
}

function Dust() {
  const { geometry, material } = useMemo(() => {
    const N = 1600;
    const pos = new Float32Array(N * 3);
    for (let i = 0; i < N; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 90;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 50;
      pos[i * 3 + 2] = -60 + Math.random() * 72;
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    const m = new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      uniforms: { uTime: { value: 0 }, uScale: { value: 1 } },
      vertexShader: /* glsl */ `
        uniform float uTime;
        uniform float uScale;
        varying float vA;
        void main() {
          vec3 p = position;
          p.y = mod(p.y + uTime * 0.25 + 25.0, 50.0) - 25.0;
          p.x += sin(uTime * 0.1 + position.z) * 0.6;
          vec4 mv = modelViewMatrix * vec4(p, 1.0);
          gl_Position = projectionMatrix * mv;
          gl_PointSize = uScale * 40.0 / -mv.z;
          vA = 0.5 + 0.5 * sin(uTime + position.x * 3.0);
        }`,
      fragmentShader: /* glsl */ `
        varying float vA;
        void main() {
          float d = length(gl_PointCoord - 0.5);
          if (d > 0.5) discard;
          float a = smoothstep(0.5, 0.0, d);
          gl_FragColor = vec4(vec3(0.35, 0.45, 0.7) * a * (0.15 + 0.2 * vA), 1.0);
        }`,
    });
    return { geometry: g, material: m };
  }, []);
  useFrame((state, dt) => {
    material.uniforms.uTime.value += dt;
    material.uniforms.uScale.value = state.viewport.dpr * (state.size.height / 1000);
  });
  return <points geometry={geometry} material={material} frustumCulled={false} />;
}

/** Build the remaining shapes during idle time so the first transition to each never stutters. */
function Prewarm() {
  useEffect(() => {
    const ids = [...new Set(SLIDES.map((s) => s.shape))];
    let i = 0;
    let timer = 0;
    const step = () => {
      if (i >= ids.length) return;
      getShape(ids[i++]);
      timer = window.setTimeout(step, 60);
    };
    timer = window.setTimeout(step, 400);
    return () => window.clearTimeout(timer);
  }, []);
  return null;
}

export default function Scene() {
  const index = useDeck((s) => s.index);
  const slide = SLIDES[index];
  return (
    <Canvas
      className="scene"
      dpr={[1, 1.6]}
      gl={{ antialias: false, powerPreference: 'high-performance' }}
      camera={{ fov: 42, near: 0.1, far: 400, position: [0, 0.5, 22] }}
    >
      <color attach="background" args={['#04030a']} />
      <Backdrop accent={slide.accent} />
      <Dust />
      <ShapeRig shape={slide.shape} />
      <CameraRig slide={slide} />
      <Prewarm />
      <EffectComposer multisampling={0}>
        <Bloom mipmapBlur intensity={1.25} luminanceThreshold={0.14} luminanceSmoothing={0.35} radius={0.74} />
        <Vignette offset={0.22} darkness={0.72} />
      </EffectComposer>
    </Canvas>
  );
}
