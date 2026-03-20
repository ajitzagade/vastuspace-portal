'use client'

import { useEffect, useRef, useState, Suspense } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls, Environment, Float, Sphere, useGLTF } from '@react-three/drei'
import * as THREE from 'three'

function ProceduralBuilding({ hovered }: { hovered: boolean }) {
  const groupRef = useRef<THREE.Group>(null)

  useFrame((state) => {
    if (!groupRef.current) return
    groupRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.15) * 0.3
  })

  const windowRows = Array.from({ length: 8 })
  const windowCols = Array.from({ length: 3 })

  return (
    <group ref={groupRef}>
      <mesh position={[0, 2, 0]} castShadow>
        <boxGeometry args={[1.4, 4, 1.4]} />
        <meshPhysicalMaterial color={hovered ? '#d4b563' : '#e8e0d0'} metalness={0.3} roughness={0.1} transparent opacity={0.92} />
      </mesh>
      <mesh position={[0, 4.8, 0]} castShadow>
        <boxGeometry args={[0.8, 1.6, 0.8]} />
        <meshPhysicalMaterial color="#c9a84c" metalness={0.8} roughness={0.05} />
      </mesh>
      <mesh position={[0, 6, 0]}>
        <cylinderGeometry args={[0, 0.15, 0.8, 6]} />
        <meshStandardMaterial color="#c9a84c" metalness={1} roughness={0} />
      </mesh>
      <mesh position={[-1.0, 1.2, 0]} castShadow>
        <boxGeometry args={[0.6, 2.4, 1.0]} />
        <meshPhysicalMaterial color="#d5cfc4" metalness={0.2} roughness={0.15} transparent opacity={0.88} />
      </mesh>
      <mesh position={[1.0, 1.2, 0]} castShadow>
        <boxGeometry args={[0.6, 2.4, 1.0]} />
        <meshPhysicalMaterial color="#d5cfc4" metalness={0.2} roughness={0.15} transparent opacity={0.88} />
      </mesh>
      <mesh position={[0, -0.3, 0]} receiveShadow>
        <boxGeometry args={[2.6, 0.6, 2.6]} />
        <meshStandardMaterial color="#1a1a1a" metalness={0.5} roughness={0.4} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.62, 0]} receiveShadow>
        <planeGeometry args={[12, 12]} />
        <meshStandardMaterial color="#0d0d0d" metalness={0.1} roughness={0.9} />
      </mesh>
      <Sphere args={[0.4, 32, 32]} position={[0, 6.4, 0]}>
        <meshBasicMaterial color="#c9a84c" transparent opacity={0.6} />
      </Sphere>
      {windowRows.map((_, row) =>
        windowCols.map((_, col) => (
          <mesh key={`w-${row}-${col}`} position={[-0.35 + col * 0.35, 0.4 + row * 0.44, 0.71]}>
            <planeGeometry args={[0.18, 0.2]} />
            <meshBasicMaterial color={col === 1 ? '#c9a84c' : '#fff8e7'} transparent opacity={0.55 + (row % 3) * 0.15} />
          </mesh>
        ))
      )}
    </group>
  )
}

function GLTFModel({ url }: { url: string }) {
  const { scene } = useGLTF(url)
  return <primitive object={scene} />
}

function Particles() {
  const points = useRef<THREE.Points>(null)
  const count = 80
  const positions = new Float32Array(count * 3)
  for (let i = 0; i < count; i++) {
    positions[i * 3 + 0] = (Math.random() - 0.5) * 10
    positions[i * 3 + 1] = Math.random() * 8
    positions[i * 3 + 2] = (Math.random() - 0.5) * 10
  }
  useFrame((state) => {
    if (points.current) points.current.rotation.y = state.clock.elapsedTime * 0.02
  })
  return (
    <points ref={points}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial size={0.03} color="#c9a84c" transparent opacity={0.6} sizeAttenuation />
    </points>
  )
}

export default function BuildingScene({ modelUrl }: { modelUrl?: string }) {
  const [hovered, setHovered] = useState(false)
  const [resolvedModelUrl, setResolvedModelUrl] = useState<string | null>(null)

  useEffect(() => {
    // Demo mode: if the URL looks like a supported GLB/GLTF, try to render it immediately.
    // This avoids brittle existence checks (HEAD/Range) that can prevent model rendering on hosts like Vercel.
    const normalizedUrl = modelUrl ? modelUrl.split('?')[0].split('#')[0].toLowerCase() : ''
    const isSupported = normalizedUrl.endsWith('.glb') || normalizedUrl.endsWith('.gltf')

    if (!modelUrl || !isSupported) {
      setResolvedModelUrl(null)
      return
    }

    setResolvedModelUrl(modelUrl)
  }, [modelUrl])

  return (
    <Canvas
      camera={{ position: [5, 4, 6], fov: 45 }}
      gl={{ antialias: true, alpha: true }}
      dpr={[1, 1.5]}
      shadows
      style={{ background: 'transparent', width: '100%', height: '100%', cursor: hovered ? 'grab' : 'default' }}
    >
      <Suspense fallback={null}>
        <ambientLight intensity={0.3} />
        <directionalLight position={[8, 12, 5]} intensity={1.5} castShadow color="#fff8e7" />
        <pointLight position={[-4, 6, -4]} intensity={0.5} color="#c9a84c" />
        <pointLight position={[4, 2, 4]} intensity={0.3} color="#4488ff" />

        {resolvedModelUrl ? (
          <Float speed={1.2} rotationIntensity={0.05} floatIntensity={0.2}>
            <GLTFModel url={resolvedModelUrl} />
          </Float>
        ) : (
          <Float speed={1.2} rotationIntensity={0.08} floatIntensity={0.3}>
            <group
              onPointerEnter={() => setHovered(true)}
              onPointerLeave={() => setHovered(false)}
            >
              <ProceduralBuilding hovered={hovered} />
            </group>
          </Float>
        )}

        <Particles />
        <Environment preset="city" />

        <OrbitControls
          enablePan={false}
          enableZoom={true}
          minDistance={3}
          maxDistance={15}
          minPolarAngle={Math.PI / 4}
          maxPolarAngle={Math.PI / 2.2}
          autoRotate
          autoRotateSpeed={0.4}
          enableDamping
          dampingFactor={0.05}
        />
      </Suspense>
    </Canvas>
  )
}
