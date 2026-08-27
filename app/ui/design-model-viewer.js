'use client'

import { Suspense, useEffect, useMemo, useState } from 'react'
import { Canvas } from '@react-three/fiber'
import { Bounds, Center, OrbitControls, useGLTF } from '@react-three/drei'
import * as THREE from 'three'

function softenMaterials (object) {
  object.traverse(child => {
    if (!child.isMesh || !child.material) return

    const patch = material => {
      const matte = material.clone()
      if ('roughness' in matte) matte.roughness = 1
      if ('metalness' in matte) matte.metalness = 0
      if ('envMapIntensity' in matte) matte.envMapIntensity = 0
      return matte
    }

    child.material = Array.isArray(child.material)
      ? child.material.map(patch)
      : patch(child.material)
  })
}

function GlbModel ({ url }) {
  const { scene } = useGLTF(url)
  const model = useMemo(() => {
    const clone = scene.clone()
    softenMaterials(clone)
    return clone
  }, [scene])
  return (
    <group rotation={[-Math.PI / 2, 0, 0]}>
      <Center>
        <primitive object={model} />
      </Center>
    </group>
  )
}

function FitModel ({ url }) {
  return (
    <Bounds fit clip observe margin={1.25}>
      <GlbModel url={url} />
    </Bounds>
  )
}

export default function DesignModelViewer ({
  modelBase64,
  className = 'w-full h-200'
}) {
  const [modelUrl, setModelUrl] = useState(null)

  useEffect(() => {
    if (!modelBase64) return

    const bytes = Uint8Array.from(atob(modelBase64), c => c.charCodeAt(0))
    const blob = new Blob([bytes], { type: 'model/gltf-binary' })
    const objectUrl = URL.createObjectURL(blob)
    setModelUrl(objectUrl)

    return () => URL.revokeObjectURL(objectUrl)
  }, [modelBase64])

  if (!modelBase64) {
    return (
      <div
        className={`flex items-center justify-center rounded-box border border-base-300 text-sm text-base-content/60 ${className}`}
      >
        Could not load 3D model
      </div>
    )
  }

  if (!modelUrl) {
    return (
      <div
        className={`flex items-center justify-center rounded-box border border-base-300 bg-base-200 ${className}`}
      >
        <span className='loading loading-spinner loading-lg' />
      </div>
    )
  }

  return (
    <div
      className={`rounded-box border border-base-300 bg-base-200 overflow-hidden ${className}`}
    >
      <Canvas
        className='w-full h-full'
        camera={{ position: [0, 0, 5], fov: 45, near: 0.001, far: 1000 }}
        gl={{ toneMapping: THREE.LinearToneMapping, toneMappingExposure: 1 }}
      >
        <hemisphereLight intensity={0.85} groundColor='#888888' />
        <ambientLight intensity={0.35} />
        <directionalLight position={[3, 5, 2]} intensity={0.45} />
        <Suspense fallback={null}>
          <FitModel url={modelUrl} />
        </Suspense>
        <OrbitControls makeDefault enablePan />
      </Canvas>
    </div>
  )
}
