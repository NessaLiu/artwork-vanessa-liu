import {
  WebGLRenderer,
  PerspectiveCamera,
  Scene,
  GridHelper,
  AxesHelper,
  Vector3,
  Vector2,
  CameraHelper,
} from "three";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
// import { renderStats } from "../imports/stats";
// import { guiController } from "../imports/gui";
import materialModifier from "@jam3/webgl-components/materials/material-modifier";
import { simplexNoise3D } from "@jam3/webgl-components/shaders/noise/simplex.glsl";

// Scene
const scene = new Scene();

// Arrays
const spheres = [];
let materials = [];
let lights = [];

// shader variables
const clock = new THREE.Clock();
let customShader;
let shaderConfig = {};

// defining vertex and fragment shaders
let uniforms = {};

// WebGL renderer set up
const renderer = new WebGLRenderer({ antialias: true });
renderer.debug.checkShaderErrors = true; // check material shader programs for errors during compilation
renderer.setScissorTest(true); // only pixels in defined scissor area will be affected by further renderer actions
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);

const cameras = {
  dev: new PerspectiveCamera(
    65,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
  ),
  main: new PerspectiveCamera(
    65,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
  ),
};

// Initial camera positioning
cameras.dev.position.set(20, 10, 20);
cameras.dev.lookAt(new Vector3());

cameras.main.position.set(0, 40, 50);
cameras.main.lookAt(new Vector3());

// Create two orbit control sets
// One for developing, second for actual user control
const controls = {
  dev: new OrbitControls(cameras.dev, renderer.domElement),
  main: new OrbitControls(cameras.main, renderer.domElement),
};
controls.main.enableDamping = true; // gives sense of weight to controls
controls.main.enableZoom = false; // turn off zoom

export class Artwork {
  isSetup = false;
  mousePosition = new Vector2();

  constructor() {
    // ------------------------------------ INITIAL SETUP ------------------------------------

    scene.fog = new THREE.FogExp2(0x000000, 0.001);
    renderer.setClearColor(scene.fog.color);

    // Debug helpers; grid, axes, camera
    // scene.add(
    //   new GridHelper(10, 10),
    //   new AxesHelper(),
    //   new CameraHelper(cameras.main)
    // );

    // --------------------------------------------------------------------------
    // Add Light to the Scene
    // --------------------------------------------------------------------------
    const ambient = new THREE.AmbientLight(0xffffff, 0.3);
    scene.add(ambient);

    // Set initial lights to 0 intensity for the correct colours
    // Intensity will update based on material update

    // Position 1 (0, 0, 0) -------------------------------------------------
    const redPointLight1 = new THREE.PointLight(0xff0000, 3, 300);
    redPointLight1.position.set(0, 0, 0);
    scene.add(redPointLight1);

    const pinkPointLight1 = new THREE.PointLight(0xff006f, 0, 500);
    pinkPointLight1.position.set(0, 0, 0);
    scene.add(pinkPointLight1);

    const whitePointLight1 = new THREE.PointLight(0xffffff, 0, 300);
    whitePointLight1.position.set(0, 0, 0);
    scene.add(whitePointLight1);

    // Position 2 (0, 0, 200) -------------------------------------------------
    const purplePointLight2 = new THREE.PointLight(0x6b19e6, 3, 300);
    purplePointLight2.position.set(0, 0, 200);
    scene.add(purplePointLight2);

    const bluePointLight2 = new THREE.PointLight(0x366bff, 0, 300);
    bluePointLight2.position.set(0, 0, 200);
    scene.add(bluePointLight2);

    const greenPointLight2 = new THREE.PointLight(0xa8ffe2, 0, 300);
    greenPointLight2.position.set(0, 0, 200);
    scene.add(greenPointLight2);

    // Position 3 (0, 0, -200) -------------------------------------------------
    const bluePointLight3 = new THREE.PointLight(0x0000ff, 3, 300);
    bluePointLight3.position.set(0, 0, -200);
    scene.add(bluePointLight3);

    const purplePointLight3 = new THREE.PointLight(0x754fff, 0, 300);
    purplePointLight3.position.set(0, 0, -200);
    scene.add(purplePointLight3);

    const greenPointLight3 = new THREE.PointLight(0xd1ffa8, 0, 300);
    greenPointLight3.position.set(0, 0, -200);
    scene.add(greenPointLight3);

    const pointLight3 = new THREE.PointLight(0xff0000, 2, 100);
    pointLight3.position.set(-500, 0, 0);
    scene.add(pointLight3);

    // add lights for each stage
    // note: stage 2 has no lights but is there for index purposes
    lights = [
      [redPointLight1, purplePointLight2, bluePointLight3],
      [],
      [pinkPointLight1, bluePointLight2, purplePointLight2, purplePointLight3],
      [whitePointLight1, greenPointLight2, greenPointLight3],
    ];

    // Directional Light -------------------------------------------------
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(800, 50, 20);
    scene.add(directionalLight);

    this.createObjects();
    this.initAudio();
    this.update();
  }

  setup(parent) {
    parent.append(renderer.domElement);
  }

  onMouseMove(event) {
    // Mouse and Window variables
    const windowHalfX = window.innerWidth / 2;
    const windowHalfY = window.innerHeight / 2;
    this.mousePosition.x = (event.clientX - windowHalfX) * 2;
    this.mousePosition.y = (event.clientY - windowHalfY) * 2;
  }

  // --------------------------------------------------------------------------
  // ADDING AUDIO
  // --------------------------------------------------------------------------
  initAudio() {
    const listener = new THREE.AudioListener();
    cameras.main.add(listener);
    const bgSound = new THREE.Audio(listener);
    const audioLoader = new THREE.AudioLoader();
    audioLoader.load("./assets/audio/bg_audio.mp3", (buffer) => {
      bgSound.setBuffer(buffer);
      //bgSound.setLoop(true);
      bgSound.setVolume(0.5);
      bgSound.play();
    });
  }

  // --------------------------------------------------------------------------
  // BUILDING SCENE
  // --------------------------------------------------------------------------
  createObjects() {
    //  Create texture loader
    const loader = new THREE.TextureLoader();

    // Background Image
    let urls = [
      "posx.jpg",
      "negx.jpg",
      "posy.jpg",
      "negy.jpg",
      "posz.jpg",
      "/negz.jpg",
    ];
    let bgLoader = new THREE.CubeTextureLoader();
    scene.background = bgLoader.load(urls);
    scene.background = new THREE.CubeTextureLoader()
      .setPath("./assets/background/")
      .load(urls);

    const textureCube = new THREE.CubeTextureLoader()
      .setPath("./assets/background/")
      .load(urls);
    textureCube.mapping = THREE.CubeRefractionMapping;

    // --------------------------------------------------------------------------
    // Load in textures of the 4 stages
    // --------------------------------------------------------------------------

    // water textures
    const waterBaseColour = loader.load("./assets/water/Water_002_COLOR.jpg");
    const waterDisplacementMap = loader.load(
      "./assets/textures/water/Water_002_DISP.png"
    );
    const waterNormalMap = loader.load("./assets/water/Water_002_NORM.jpg");
    const waterAmbientOcclusionMap = loader.load(
      "./assets/water/Water_002_OCC.jpg"
    );
    const waterRoughnessMap = loader.load("./assets/water/Water_002_ROUGH.jpg");

    // ice textures
    const iceBaseColour = loader.load("./assets/ice/Ice_001_COLOR.jpg");
    const iceDisplacementMap = loader.load(
      "./assets/textures/ice/Ice_001_DISP.png"
    );
    const iceNormalMap = loader.load("./assets/ice/Ice_001_NRM.jpg");
    const iceAmbientOcclusionMap = loader.load("./assets/ice/Ice_001_OCC.jpg");
    const iceSpecularityMap = loader.load("./assets/ice/Ice_001_SPEC.jpg");

    // rock textures
    const rockBaseColour = loader.load(
      "./assets/rock/Rock_Cliff_003_basecolor.jpg"
    );
    const rockNormalMap = loader.load(
      "./assets/rock/Rock_Cliff_003_normal.jpg"
    );
    const rockHeightMap = loader.load(
      "./assets/rock/Rock_Cliff_003_height.png"
    );
    const rockRoughnessMap = loader.load(
      "./assets/rock/Rock_Cliff_003_roughness.jpg"
    );
    const rockAmbientOcclusionMap = loader.load(
      "./assets/rock/Rock_Cliff_003_ambientOcclusion.jpg"
    );

    // metal textures
    const metalBaseColour = loader.load(
      "./assets/metal/Alien_Metal_002_COLOR.jpg"
    );
    const metalNormalMap = loader.load(
      "./assets/metal/Alien_Metal_002_NORM.jpg"
    );
    const metalHeightMap = loader.load(
      "./assets/metal/Alien_Metal_002_DISP.jpg"
    );
    const metalRoughnessMap = loader.load(
      "./assets/metal/Alien_Metal_002_ROUGH.jpg"
    );
    const metalAmbientOcclusionMap = loader.load(
      "./assets/metal/Alien_Metal_002_OCC.jpg"
    );

    // glass textures
    const glassBaseColour = loader.load(
      "./assets/glass/Glass_Pattern_001_basecolor.jpg"
    );
    const glassDisplacementMap = loader.load(
      "./assets/glass/Glass_Pattern_001_height.png"
    );
    const glassNormalMap = loader.load(
      "./assets/glass/Glass_Pattern_001_normal.jpg"
    );
    const glassAmbientOcclusionMap = loader.load(
      "./assets/glass/Glass_Pattern_001_ambientOcclusion.jpg"
    );
    const glassAlphaMap = loader.load(
      "./assets/glass/Glass_Pattern_001_opacity.jpg"
    );
    const glassRoughnessMap = loader.load(
      "./assets/glass/Glass_Pattern_001_roughness.jpg"
    );
    const glassMetalnessMap = loader.load(
      "./assets/glass/Glass_Pattern_001_metallic.jpg"
    );

    // tile textures
    const tileBaseColour = loader.load("./assets/tile/Tiles_045_basecolor.jpg");
    const tileDisplacementMap = loader.load(
      "./assets/tile/Tiles_045_height.png"
    );
    const tileNormalMap = loader.load("./assets/tile/Tiles_045_normal.jpg");
    const tileAmbientOcclusionMap = loader.load(
      "./assets/tile/Tiles_045_ambientOcclusion.jpg"
    );
    const tileRoughnessMap = loader.load(
      "./assets/tile/Tiles_045_roughness.jpg"
    );

    // --------------------------------------------------------------------------
    // Creating materials of the 4 stages
    // --------------------------------------------------------------------------

    const rockyMaterial = new THREE.MeshStandardMaterial({
      map: rockBaseColour,
      normalMap: rockNormalMap,
      displacementMap: rockHeightMap,
      displacementScale: 2,
      roughnessMap: rockRoughnessMap,
      aoMap: rockAmbientOcclusionMap,
    });
    const metalMaterial = new THREE.MeshStandardMaterial({
      map: metalBaseColour,
      normalMap: metalNormalMap,
      displacementMap: metalHeightMap,
      displacementScale: 2,
      roughnessMap: metalRoughnessMap,
      aoMap: metalAmbientOcclusionMap,
    });
    const waterMaterial = new THREE.MeshStandardMaterial({
      map: waterBaseColour,
      normalMap: waterNormalMap,
      displacementMap: waterDisplacementMap,
      displacementScale: 0.5,
      roughnessMap: waterRoughnessMap,
      roughness: 0,
      aoMap: waterAmbientOcclusionMap,
    });
    const iceMaterial = new THREE.MeshPhongMaterial({
      map: iceBaseColour,
      normalMap: iceNormalMap,
      displacementMap: iceDisplacementMap,
      displacementScale: 0.5,
      aoMap: iceAmbientOcclusionMap,
      specularMap: iceSpecularityMap,
    });
    const clearMaterial = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      envMap: textureCube,
      refractionRatio: 0.95,
    });
    const glassMaterial = new THREE.MeshStandardMaterial({
      map: glassBaseColour,
      normalMap: glassNormalMap,
      displacementMap: glassDisplacementMap,
      displacementScale: 0.5,
      aoMap: glassAmbientOcclusionMap,
      metalnessMap: glassMetalnessMap,
      alphaMap: glassAlphaMap,
      roughnessMap: glassRoughnessMap,
    });
    const tileMaterial = new THREE.MeshStandardMaterial({
      map: tileBaseColour,
      normalMap: tileNormalMap,
      displacementMap: tileDisplacementMap,
      displacementScale: 0.5,
      roughnessMap: tileRoughnessMap,
      roughness: 0,
      aoMap: tileAmbientOcclusionMap,
    });

    // Adding shaders
    shaderConfig = {
      uniforms: {
        time: { value: 0 },
      },
      vertexShader: {
        /* glsl */
        uniforms: `
        uniform float time;
        `,
        functions: `
        ${simplexNoise3D}
        `,
        postTransform: /* glsl */ `
        float speed = time * 0.8;
        float noise = simplexNoise3D(position.xyz * 0.8 + speed) * 0.5;
        transformed = normal * noise;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position + transformed, 1.0);
        `,
      },
      fragmentShader: {
        uniforms: ``,
        functions: ``,
      },
    };

    // Add shader effect on water material
    waterMaterial.onBeforeCompile = (shader) => {
      customShader = materialModifier(shader, shaderConfig);
    };

    materials = [metalMaterial, clearMaterial, waterMaterial, tileMaterial];

    // Create geometries for different sized spheres
    const sphereSmallGeo = new THREE.SphereBufferGeometry(3, 128, 128);
    const sphereMedGeo = new THREE.SphereBufferGeometry(10, 128, 128);
    const sphereLargeGeo = new THREE.SphereBufferGeometry(20, 128, 128);

    // --------------------------------------------------------------------------
    // // Add spheres to the scene with initial texture
    // --------------------------------------------------------------------------

    // small spheres
    for (let i = 0; i < 100; i++) {
      const smallSphere = new THREE.Mesh(sphereSmallGeo, metalMaterial);
      smallSphere.position.x = Math.random() * 500 - 40;
      smallSphere.position.y = Math.random() * 500 - 50;
      smallSphere.position.z = Math.random() * 500 - 50;
      if (i % 2 === 0) {
        smallSphere.position.z *= -1;
        smallSphere.position.x *= -1;
      }
      scene.add(smallSphere);
      spheres.push(smallSphere);
    }

    // med spheres
    for (let i = 0; i < 50; i++) {
      const medSphere = new THREE.Mesh(sphereMedGeo, metalMaterial);
      medSphere.position.x = Math.random() * 500 - 40;
      medSphere.position.y = Math.random() * 500 - 80;
      medSphere.position.z = Math.random() * 500 - 100;
      if (i % 2 === 0) {
        medSphere.position.z *= -1;
        medSphere.position.x *= -1;
      }
      scene.add(medSphere);
      spheres.push(medSphere);
    }

    // large spheres
    for (let i = 0; i < 50; i++) {
      const largeSphere = new THREE.Mesh(sphereLargeGeo, metalMaterial);
      largeSphere.position.x = Math.random() * 500 - 40;
      largeSphere.position.y = Math.random() * 500 - 50;
      largeSphere.position.z = Math.random() * 500 - 100;
      if (i % 2 === 0) {
        largeSphere.position.z *= -1;
        largeSphere.position.x *= -1;
      }
      scene.add(largeSphere);
      spheres.push(largeSphere);
    }
  }

  /*
  shaderTesting1() {
    const plane = new THREE.Mesh(
      new THREE.PlaneGeometry(100, 100, 10, 10),
      new THREE.MeshStandardMaterial({
        color: 0x808080,
      })
    );
    plane.castShadow = false;
    plane.receiveShadow = true;
    plane.rotation.x = -Math.PI / 2;
    //scene.add(plane);

    // make 2 spheres
    const sphere1 = new THREE.Mesh(
      new THREE.SphereGeometry(2, 32, 32),
      new THREE.MeshStandardMaterial({ color: 0xffffff })
    );
    sphere1.position.set(-10, 5, 0);
    sphere1.castShadow = true;
    scene.add(sphere1);

    uniforms = {
      uTime: { type: "f", value: 0.0 }, // float type
      uResolution: {
        type: "v2",
        value: new THREE.Vector2(
          window.innerWidth,
          window.innerHeight
        ).multiplyScalar(window.devicePixelRatio),
      },
      uMouse: { type: "v2", value: new THREE.Vector2(0.0, 0.0) },
    };

    // window.addEventListener("mousemove", (e) => {
    //   uniforms.uMouse.value.set(
    //     e.screenX / window.innerWidth,
    //     1 - e.screenY / window.innerHeight
    //   );
    // });

    const planeGeo = new THREE.PlaneGeometry(10, 10, 30, 30);
    const planeMat = new THREE.ShaderMaterial({
      vertexShader: document.getElementById("vertexShader").textContent,
      fragmentShader: document.getElementById("fragmentShader").textContent,
      //wireframe: true,
      uniforms: uniforms,
    });
    const planeMesh = new THREE.Mesh(planeGeo, planeMat);
    scene.add(planeMesh);
  }
  */

  resize(width, height) {
    // Update camera projections
    cameras.dev.aspect = width / height;
    cameras.main.aspect = width / height;
    cameras.dev.updateProjectionMatrix();
    cameras.main.updateProjectionMatrix();
    // Set webgl context size
    renderer.setSize(width, height);
  }

  updateMaterial(materialIndex, prevIndex) {
    // update textures
    const len = spheres.length;
    const lights_prev_len = lights[prevIndex].length;
    const lights_currMaterial_len = lights[materialIndex].length;

    for (let i = 0; i < len; i++) {
      spheres[i].material = materials[materialIndex];
    }

    // remove existing lighting
    for (let i = 0; i < lights_prev_len; i++) {
      lights[prevIndex][i].intensity = 0;
    }

    // update fog colour and lighting
    for (let i = 0; i < lights_currMaterial_len; i++) {
      lights[materialIndex][i].intensity = 3;
    }
    if (materialIndex === 0) {
      scene.fog.color = new THREE.Color(0x000000);
      renderer.setClearColor(scene.fog.color);
    } else if (materialIndex === 1) {
      scene.fog.color = new THREE.Color(0xffffff);
      renderer.setClearColor(scene.fog.color);
    } else if (materialIndex === 2) {
      scene.fog.color = new THREE.Color(0xa5dff2);
      renderer.setClearColor(scene.fog.color);
    } else {
      scene.fog.color = new THREE.Color(0xa0c293);
      renderer.setClearColor(scene.fog.color);
    }
    // update lighting
  }

  animate() {
    const timer = 0.0001 * Date.now();
    cameras.main.position.x +=
      (this.mousePosition.x - cameras.main.position.x) * 0.01;
    cameras.main.position.y +=
      (this.mousePosition.y - cameras.main.position.y) * 0.01;
    cameras.main.lookAt(scene.position);

    for (let i = 0, j = spheres.length; i < j; i++) {
      const currSphere = spheres[i];
      currSphere.position.x = 100 * Math.cos(timer + i);
      currSphere.position.y = 100 * Math.sin(timer + i * 1.1);
      if (i % 2 === 0) {
        currSphere.rotation.x += 0.02;
      } else {
        currSphere.rotation.x -= 0.02;
      }
    }
  }

  // Function to render viewport coordinates
  renderScene(camera, left, bottom, width, height) {
    left *= window.innerWidth;
    bottom *= window.innerHeight;
    width *= window.innerWidth;
    height *= window.innerHeight;
    renderer.setViewport(left, bottom, width, height);
    renderer.setScissor(left, bottom, width, height);
    renderer.render(scene, camera);
  }

  update = () => {
    requestAnimationFrame(this.update);
    // Enable main camera controls when not in dev mode
    //controls.main.enabled = !guiController.cameraDebug;
    controls.main.update();

    // shaders
    if (customShader != null) {
      customShader.uniforms.time.value += clock.getDelta();
    }
    //uniforms.uTime.value = clock.getElapsedTime();

    // Handle scene rendering
    // if (guiController.cameraDebug) {
    //   this.renderScene(cameras.dev, 0, 0, 1, 1);
    //   this.renderScene(cameras.main, 0, 0, 0.25, 0.25);
    // } else {
    //   this.renderScene(cameras.main, 0, 0, 1, 1);
    // }
    this.renderScene(cameras.main, 0, 0, 1, 1);
    this.animate();
    //renderStats.update(renderer);
  };
}

const artwork = new Artwork();

export default artwork;
