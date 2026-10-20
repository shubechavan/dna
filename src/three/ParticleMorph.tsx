import { useEffect, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { COUNT, getShape, type ShapeId } from './shapes';

const MORPH_SECONDS = 2.4;
const DELAY = 0.45; // max per-particle start delay, as a fraction of the morph
const WINDOW = 1 - DELAY;

const vertex = /* glsl */ `
uniform float uTime;
uniform float uMorph;
uniform float uScale;
attribute vec3 aFrom;
attribute vec3 aTo;
attribute vec3 aCFrom;
attribute vec3 aCTo;
attribute float aSFrom;
attribute float aSTo;
attribute float aRand;
varying vec3 vColor;

float easeIO(float t) { return t < 0.5 ? 4.0 * t * t * t : 1.0 - pow(-2.0 * t + 2.0, 3.0) * 0.5; }

void main() {
  float p = clamp((uMorph - aRand * ${DELAY.toFixed(2)}) / ${WINDOW.toFixed(2)}, 0.0, 1.0);
  float e = easeIO(p);
  vec3 pos = mix(aFrom, aTo, e);
  float burst = sin(p * 3.14159265);
  vec3 dir = normalize(pos + vec3(0.0001, 0.0002, 0.0003));
  pos += dir * burst * (0.5 + aRand * 1.6);

  float ph = aRand * 6.2831853;
  pos += vec3(sin(uTime * 0.8 + ph * 3.0), cos(uTime * 0.7 + ph * 5.0), sin(uTime * 0.6 + ph * 7.0)) * 0.04;

  vec4 mv = modelViewMatrix * vec4(pos, 1.0);
  gl_Position = projectionMatrix * mv;

  float s = mix(aSFrom, aSTo, e);
  float tw = 0.8 + 0.2 * sin(uTime * (1.5 + aRand * 2.0) + ph * 10.0);
  gl_PointSize = s * tw * uScale / -mv.z;
  vColor = mix(aCFrom, aCTo, e) * (1.0 + burst * 0.7);
}
`;

const fragment = /* glsl */ `
varying vec3 vColor;
void main() {
  float d = length(gl_PointCoord - 0.5);
  if (d > 0.5) discard;
  float a = smoothstep(0.5, 0.0, d);
  a *= a;
  float core = smoothstep(0.16, 0.0, d);
  gl_FragColor = vec4(vColor * (a + core * 0.9), 1.0);
}
`;

const easeIO = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

export default function ParticleMorph({ shape }: { shape: ShapeId }) {
  const current = useRef<ShapeId>(shape);

  const { geometry, material } = useMemo(() => {
    const s = getShape(shape);
    const g = new THREE.BufferGeometry();
    const rand = new Float32Array(COUNT);
    for (let i = 0; i < COUNT; i++) rand[i] = Math.random();
    g.setAttribute('position', new THREE.BufferAttribute(s.pos.slice(), 3));
    g.setAttribute('aFrom', new THREE.BufferAttribute(s.pos.slice(), 3));
    g.setAttribute('aTo', new THREE.BufferAttribute(s.pos.slice(), 3));
    g.setAttribute('aCFrom', new THREE.BufferAttribute(s.col.slice(), 3));
    g.setAttribute('aCTo', new THREE.BufferAttribute(s.col.slice(), 3));
    g.setAttribute('aSFrom', new THREE.BufferAttribute(s.size.slice(), 1));
    g.setAttribute('aSTo', new THREE.BufferAttribute(s.size.slice(), 1));
    g.setAttribute('aRand', new THREE.BufferAttribute(rand, 1));
    const m = new THREE.ShaderMaterial({
      vertexShader: vertex,
      fragmentShader: fragment,
      uniforms: { uTime: { value: 0 }, uMorph: { value: 1 }, uScale: { value: 60 } },
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });
    return { geometry: g, material: m };
    // built once; later shape changes are handled by the effect below
  }, []);

  useEffect(() => () => {
    geometry.dispose();
    material.dispose();
  }, [geometry, material]);

  useEffect(() => {
    if (current.current === shape) return;
    current.current = shape;

    // Freeze wherever every particle is right now (mid-flight included) as the new start.
    const A = geometry.attributes;
    const from = A.aFrom.array as Float32Array;
    const to = A.aTo.array as Float32Array;
    const cFrom = A.aCFrom.array as Float32Array;
    const cTo = A.aCTo.array as Float32Array;
    const sFrom = A.aSFrom.array as Float32Array;
    const sTo = A.aSTo.array as Float32Array;
    const rand = A.aRand.array as Float32Array;
    const u = material.uniforms.uMorph.value as number;

    for (let i = 0; i < COUNT; i++) {
      const p = Math.min(1, Math.max(0, (u - rand[i] * DELAY) / WINDOW));
      const e = easeIO(p);
      const burst = Math.sin(p * Math.PI) * (0.5 + rand[i] * 1.6);
      const i3 = i * 3;
      let x = from[i3] + (to[i3] - from[i3]) * e;
      let y = from[i3 + 1] + (to[i3 + 1] - from[i3 + 1]) * e;
      let z = from[i3 + 2] + (to[i3 + 2] - from[i3 + 2]) * e;
      if (burst > 0) {
        const len = Math.hypot(x, y, z) || 1;
        x += (x / len) * burst;
        y += (y / len) * burst;
        z += (z / len) * burst;
      }
      from[i3] = x;
      from[i3 + 1] = y;
      from[i3 + 2] = z;
      for (let k = 0; k < 3; k++) cFrom[i3 + k] = cFrom[i3 + k] + (cTo[i3 + k] - cFrom[i3 + k]) * e;
      sFrom[i] = sFrom[i] + (sTo[i] - sFrom[i]) * e;
    }

    const next = getShape(shape);
    to.set(next.pos);
    cTo.set(next.col);
    sTo.set(next.size);
    for (const name of ['aFrom', 'aTo', 'aCFrom', 'aCTo', 'aSFrom', 'aSTo']) A[name].needsUpdate = true;
    material.uniforms.uMorph.value = 0;
  }, [shape, geometry, material]);

  useFrame((state, dt) => {
    const U = material.uniforms;
    U.uTime.value += dt;
    U.uMorph.value = Math.min(1, U.uMorph.value + dt / MORPH_SECONDS);
    U.uScale.value = 62 * state.viewport.dpr * (state.size.height / 1000);
  });

  return <points geometry={geometry} material={material} frustumCulled={false} />;
}
