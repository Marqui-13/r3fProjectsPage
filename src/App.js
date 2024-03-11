import * as THREE from "three";
import React, { useRef, useState, useEffect, Suspense } from "react";
import { Canvas, extend, useFrame, useLoader } from "@react-three/fiber";
import { shaderMaterial } from "@react-three/drei";
import glsl from "babel-plugin-glsl/macro";
import ProjectsHeader from './projectsHeader.js';

const WaveShaderMaterial = shaderMaterial(
  {
    uTime: 0,
    uColor: new THREE.Color(0.0, 0.0, 0.0),
    uTexture: new THREE.Texture(),
  },
  glsl`
    precision mediump float;
    varying vec2 vUv;
    varying float vWave;
    uniform float uTime;
    #pragma glslify: snoise3 = require(glsl-noise/simplex/3d);
    void main() {
      vUv = uv;
      vec3 pos = position;
      float noiseFreq = 1.5;
      float noiseAmp = 0.15;
      vec3 noisePos = vec3(pos.x * noiseFreq + uTime, pos.y, pos.z);
      pos.z += snoise3(noisePos) * noiseAmp;
      vWave = pos.z;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);  
    }
  `,
  glsl`
  precision mediump float;

  uniform vec3 uColor;
  uniform float uTime;
  uniform sampler2D uTexture;
  
  varying vec2 vUv;
  varying float vWave;
  
  void main() {
    // Calculate the distance from the center of the texture
    vec2 center = vUv - 0.5;
    float distance = length(center) * 2.0; // Normalize distance to [0, 1]
    float edgeSoftness = 0.05; // Adjust for softer edges
    float radius = 1.4; // Adjust for the size of the rounded corner
    
    // Fade out near the edges to create rounded corners
    float alpha = smoothstep(radius, radius - edgeSoftness, distance);
    
    // Apply faded alpha to texture
    vec3 texture = texture2D(uTexture, vUv).rgb;
    gl_FragColor = vec4(texture * alpha, 1.0); // Apply alpha based on distance
  }
  `
);

extend({ WaveShaderMaterial });

const Wave = ({ position, imageUrl, projectName, projectUrl, onHover }) => {
  const ref = useRef();
  const [hovered, setHovered] = useState(false);
  const targetScale = useRef([1, 1, 1]); // useRef to hold target scale to smoothly transition to
  const image = useLoader(THREE.TextureLoader, imageUrl);

  useEffect(() => {
    if (ref.current) {
      ref.current.material.uniforms.uTexture.value = image;
    }
  }, [image]);

  useFrame((state) => {
    if (hovered) {
      targetScale.current = [1.5, 1.5, 1.5];
    } else {
      targetScale.current = [1, 1, 1];
    }

    const mesh = ref.current;
    if (mesh) {
      // Correctly access the clock from the state provided to useFrame
      mesh.material.uniforms.uTime.value = state.clock.getElapsedTime();
  
      // Smoothly interpolate towards the target scale
      mesh.scale.x = THREE.MathUtils.lerp(mesh.scale.x, targetScale.current[0], 0.1);
      mesh.scale.y = THREE.MathUtils.lerp(mesh.scale.y, targetScale.current[1], 0.1);
    }
  });
  

  return (
    <mesh
      ref={ref}
      position={position}
      onPointerOver={(e) => {
        e.stopPropagation();
        setHovered(true);
        onHover(projectName);
      }}
      onPointerOut={() => {
        setHovered(false);
        onHover("");
      }}
      onClick={() => window.open(projectUrl, '_blank')}
    >
      <planeBufferGeometry args={[0.4, 0.6, 16, 16]} />
      <waveShaderMaterial attach="material" uColor={"lightblue"} uTexture={image} />
    </mesh>
  );
};

const projects = [
  { id: 1, imageUrl: "https://i.ibb.co/qg1PtKz/cybertruck-Shaders.png", projectName: "Cybertruck Shaders", projectUrl: "https://cybertruckshaders.netlify.app/"},
  { id: 2, imageUrl: "https://i.ibb.co/DpDVKL1/dmfx.png", projectName: "Dissolve Material Effect", projectUrl: "https://dissolvematerialfx.netlify.app/"},
  { id: 3, imageUrl: "https://raw.githubusercontent.com/Marqui-13/otherProjects/main/images/threejsEarth2.png", projectName: "Earth2", projectUrl: "https://threejs-earth2.netlify.app/"},
  { id: 4, imageUrl: "https://i.ibb.co/SBYTyLm/threejs-Earth1.png", projectName: "Earth1", projectUrl: "https://3jsearth.on.fleek.co/3Dearth.html"},
  //{ id: 5, imageUrl: "https://raw.githubusercontent.com/Marqui-13/otherProjects/main/images/threejsEarth2.png", projectName: "Earth2", projectUrl: ""},
  //{ id: 6, imageUrl: "https://i.ibb.co/VvTYcvN/black.png", projectName: "", projectUrl: ""},
];

const startPositionY = 2; // Start higher up for the first image
const adjustedVerticalOffset = 1.5; // May need fine-tuning

const Scene = ({ setHoveredProjectName }) => {
  return (
    <Canvas camera={{ fov: 85, position: [0, 0, 3.5] }}>
      <Suspense fallback={null}>
        {projects.map((project, index) => (
          <Wave 
            key={project.id}
            position={[0, startPositionY - index * adjustedVerticalOffset, 0]}
            imageUrl={project.imageUrl}
            projectName={project.projectName}
            projectUrl={project.projectUrl}
            onHover={(isHovered) => setHoveredProjectName(isHovered ? project.projectName : "")}
          />
        ))}
      </Suspense>
    </Canvas>
  );
};

const App = () => {
  const [hoveredProjectName, setHoveredProjectName] = useState("");

  return (
    <>
      {hoveredProjectName && (
          <div className="hovered-project-name">{hoveredProjectName}</div>
      )}
      <ProjectsHeader />
      <div className="canvas-container">
        <Scene setHoveredProjectName={setHoveredProjectName}/>
      </div>
    </>
  );
};

export default App;