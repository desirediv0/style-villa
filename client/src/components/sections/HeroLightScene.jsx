"use client";

import { useRef, useMemo } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Float, Environment, RoundedBox } from "@react-three/drei";
import * as THREE from "three";

/* Soft pastel palette derived from the logo (kept light & airy) */
const PASTEL = {
  orchid: "#D9A9D6",
  orchidDeep: "#BE7FBA",
  sky: "#9BD9F2",
  skyDeep: "#63C3E8",
  cream: "#F6EFE6",
  blush: "#F3D7E4",
};

/* One floating boutique object */
function Piece({ position, rotation = [0, 0, 0], scale = 1, color, kind, speed = 1, scrollRef }) {
  const ref = useRef();

  useFrame((state, delta) => {
    const s = scrollRef?.current || 0;
    if (ref.current) {
      ref.current.rotation.y += delta * 0.18 * speed;
      // gently rise + spread as the visitor scrolls
      ref.current.position.y = position[1] + s * 1.4;
      ref.current.position.x = position[0] * (1 + s * 0.28);
    }
  });

  const material = (
    <meshPhysicalMaterial
      color={color}
      roughness={0.2}
      metalness={0.05}
      clearcoat={1}
      clearcoatRoughness={0.18}
      sheen={0.6}
      sheenColor={"#ffffff"}
      transparent
      opacity={0.94}
    />
  );

  return (
    <Float speed={1.1 * speed} rotationIntensity={0.5} floatIntensity={1.1}>
      <group ref={ref} position={position} rotation={rotation} scale={scale}>
        {kind === "sphere" && (
          <mesh castShadow>
            <sphereGeometry args={[0.6, 48, 48]} />
            {material}
          </mesh>
        )}
        {kind === "ring" && (
          <mesh castShadow rotation={[Math.PI / 2.6, 0, 0]}>
            <torusGeometry args={[0.62, 0.14, 32, 96]} />
            {material}
          </mesh>
        )}
        {kind === "capsule" && (
          <mesh castShadow>
            <capsuleGeometry args={[0.3, 0.55, 16, 32]} />
            {material}
          </mesh>
        )}
        {kind === "box" && (
          <RoundedBox args={[0.95, 0.7, 0.32]} radius={0.12} smoothness={6} castShadow>
            {material}
          </RoundedBox>
        )}
      </group>
    </Float>
  );
}

/* Layout is expressed as a fraction of the visible frustum, so the objects land
   in the same place on every screen size. Desktop: they orbit the product image
   on the right, never straying into the headline column. Mobile: corners only. */
const LAYOUT_WIDE = [
  { nx: 0.34, ny: 0.33, color: PASTEL.orchid, kind: "sphere", scale: 0.6, speed: 1 },
  { nx: 0.46, ny: 0.02, color: PASTEL.sky, kind: "ring", scale: 0.68, speed: 0.85 },
  { nx: 0.01, ny: -0.36, color: PASTEL.blush, kind: "capsule", scale: 0.48, speed: 1.2 },
  { nx: 0.39, ny: -0.34, color: PASTEL.skyDeep, kind: "box", scale: 0.54, speed: 0.9 },
  { nx: 0.11, ny: 0.42, color: PASTEL.orchidDeep, kind: "sphere", scale: 0.36, speed: 1.35 },
  { nx: 0.00, ny: 0.17, color: PASTEL.cream, kind: "ring", scale: 0.33, speed: 0.8 },
  { nx: 0.48, ny: 0.30, color: PASTEL.blush, kind: "sphere", scale: 0.4, speed: 1.1 },
];

const LAYOUT_NARROW = [
  { nx: 0.41, ny: 0.46, color: PASTEL.orchid, kind: "sphere", scale: 0.34, speed: 1 },
  { nx: -0.38, ny: -0.42, color: PASTEL.sky, kind: "ring", scale: 0.36, speed: 0.9 },
  { nx: 0.38, ny: -0.32, color: PASTEL.blush, kind: "capsule", scale: 0.32, speed: 1.2 },
];

function Pieces({ scrollRef, isLow }) {
  const { viewport } = useThree();
  const defs = isLow ? LAYOUT_NARROW : LAYOUT_WIDE;
  return (
    <>
      {defs.map((d, i) => (
        <Piece
          key={i}
          {...d}
          // z = 0 keeps the frustum mapping exact
          position={[d.nx * viewport.width, d.ny * viewport.height, 0]}
          scrollRef={scrollRef}
        />
      ))}
    </>
  );
}

/* Camera drifts with the pointer for a soft parallax */
function Rig({ pointerRef, scrollRef }) {
  const { camera } = useThree();
  useFrame(() => {
    const p = pointerRef?.current || { x: 0, y: 0 };
    const s = scrollRef?.current || 0;
    camera.position.x += (p.x * 0.55 - camera.position.x) * 0.045;
    camera.position.y += (-p.y * 0.35 + 0.2 - camera.position.y) * 0.045;
    camera.position.z = 6.2 - s * 0.8;
    camera.lookAt(0, 0.1, 0);
  });
  return null;
}

export default function HeroLightScene({ scrollRef, pointerRef, quality = "high" }) {
  const isLow = quality === "low";

  return (
    <Canvas
      shadows={!isLow}
      camera={{ position: [0, 0.2, 6.2], fov: 42 }}
      dpr={isLow ? [1, 1.3] : [1, 2]}
      gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
    >
      {/* Bright, airy studio light — no dark background at all */}
      <ambientLight intensity={1.15} />
      <directionalLight
        position={[4, 6, 5]}
        intensity={2.1}
        castShadow={!isLow}
        shadow-mapSize={[1024, 1024]}
      />
      <directionalLight position={[-5, 2, -3]} intensity={0.7} color={PASTEL.sky} />
      <pointLight position={[0, -2, 3]} intensity={12} color={PASTEL.blush} />
      <Environment preset="city" />

      <Pieces scrollRef={scrollRef} isLow={isLow} />

      <Rig pointerRef={pointerRef} scrollRef={scrollRef} />
    </Canvas>
  );
}
