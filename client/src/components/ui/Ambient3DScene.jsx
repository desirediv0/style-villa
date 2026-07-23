"use client";

import { useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Float, Environment, RoundedBox } from "@react-three/drei";

/* Soft pastel palette (light theme, logo-derived) */
const PASTEL = {
  orchid: "#D9A9D6",
  orchidDeep: "#BE7FBA",
  sky: "#9BD9F2",
  skyDeep: "#63C3E8",
  cream: "#F6EFE6",
  blush: "#F3D7E4",
};

/* Kept to the outer margins so it never fights the content in the middle */
const LAYOUT_WIDE = [
  { nx: -0.46, ny: 0.42, color: PASTEL.orchid, kind: "sphere", scale: 0.42, speed: 1 },
  { nx: 0.46, ny: 0.34, color: PASTEL.sky, kind: "ring", scale: 0.5, speed: 0.85 },
  { nx: -0.47, ny: -0.34, color: PASTEL.blush, kind: "capsule", scale: 0.36, speed: 1.2 },
  { nx: 0.46, ny: -0.36, color: PASTEL.skyDeep, kind: "box", scale: 0.42, speed: 0.9 },
  { nx: 0.24, ny: 0.46, color: PASTEL.orchidDeep, kind: "sphere", scale: 0.26, speed: 1.3 },
  { nx: -0.24, ny: -0.46, color: PASTEL.cream, kind: "ring", scale: 0.3, speed: 0.8 },
];

const LAYOUT_NARROW = [
  { nx: -0.40, ny: 0.40, color: PASTEL.orchid, kind: "sphere", scale: 0.34, speed: 1 },
  { nx: 0.42, ny: -0.38, color: PASTEL.sky, kind: "ring", scale: 0.32, speed: 0.9 },
  { nx: 0.40, ny: 0.36, color: PASTEL.blush, kind: "capsule", scale: 0.26, speed: 1.2 },
];

function Piece({ position, scale = 1, color, kind, speed = 1 }) {
  const ref = useRef();
  useFrame((_, delta) => {
    if (ref.current) ref.current.rotation.y += delta * 0.2 * speed;
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
      opacity={0.9}
    />
  );

  return (
    <Float speed={1.1 * speed} rotationIntensity={0.6} floatIntensity={1.3}>
      <group ref={ref} position={position} scale={scale}>
        {kind === "sphere" && (
          <mesh>
            <sphereGeometry args={[0.6, 48, 48]} />
            {material}
          </mesh>
        )}
        {kind === "ring" && (
          <mesh rotation={[Math.PI / 2.6, 0, 0]}>
            <torusGeometry args={[0.62, 0.14, 32, 96]} />
            {material}
          </mesh>
        )}
        {kind === "capsule" && (
          <mesh>
            <capsuleGeometry args={[0.3, 0.55, 16, 32]} />
            {material}
          </mesh>
        )}
        {kind === "box" && (
          <RoundedBox args={[0.95, 0.7, 0.32]} radius={0.12} smoothness={6}>
            {material}
          </RoundedBox>
        )}
      </group>
    </Float>
  );
}

function Pieces({ isLow }) {
  const { viewport } = useThree();
  const defs = isLow ? LAYOUT_NARROW : LAYOUT_WIDE;
  return (
    <>
      {defs.map((d, i) => (
        <Piece key={i} {...d} position={[d.nx * viewport.width, d.ny * viewport.height, 0]} />
      ))}
    </>
  );
}

/* Gentle pointer parallax */
function Rig({ pointerRef }) {
  const { camera } = useThree();
  useFrame(() => {
    const p = pointerRef?.current || { x: 0, y: 0 };
    camera.position.x += (p.x * 0.4 - camera.position.x) * 0.04;
    camera.position.y += (-p.y * 0.25 - camera.position.y) * 0.04;
    camera.lookAt(0, 0, 0);
  });
  return null;
}

export default function Ambient3DScene({ pointerRef, quality = "high" }) {
  const isLow = quality === "low";
  return (
    <Canvas
      camera={{ position: [0, 0, 6], fov: 45 }}
      dpr={isLow ? [1, 1.3] : [1, 1.8]}
      gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
    >
      <ambientLight intensity={1.2} />
      <directionalLight position={[4, 5, 5]} intensity={1.9} />
      <directionalLight position={[-5, 2, -3]} intensity={0.6} color={PASTEL.sky} />
      <Environment preset="city" />
      <Pieces isLow={isLow} />
      <Rig pointerRef={pointerRef} />
    </Canvas>
  );
}
