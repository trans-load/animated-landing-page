// Three.js point cloud viewer with pixel-aligned image-to-cloud transition.
// Each point is rendered with its UV in the original camera image; on scroll,
// it lerps from its 2D image-plane position to its true 3D PLY position.
const { useEffect: useEffectPc, useRef: useRefPc } = React;

function decodeScene() {
  const b64 = window.__SCENE_B64;
  const bin = atob(b64);
  const buf = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) buf[i] = bin.charCodeAt(i);
  const dv = new DataView(buf.buffer);
  const n = dv.getUint32(0, true);
  const xyz = new Float32Array(buf.buffer, 16, n * 3);
  const rgb = new Uint8Array(buf.buffer, 16 + n * 3 * 4, n * 3);
  return { n, xyz, rgb };
}

// Camera intrinsics fit from the data:
//   half-fov-x = atan(0.85) ~ 40.4°,  half-fov-y = atan(0.483) ~ 25.8°
//   image aspect 756/420 ≈ 1.80, point-cloud aspect ≈ 1.76 (very close match)
const CAM_HALF_TAN_X = 0.851;
const CAM_HALF_TAN_Y = 0.483;
const CAM_FOV_Y_DEG = 2 * Math.atan(CAM_HALF_TAN_Y) * 180 / Math.PI; // ≈51.5°

function PointCloud({
  progress = 0,
  pointSize = 1.6,
  accent = '#f97315',
  autoRotate = true,
}) {
  const containerRef = useRefPc(null);
  const stateRef = useRefPc(null);
  const progressRef = useRefPc(progress);
  const rotateRef = useRefPc(autoRotate);
  const sizeRef = useRefPc(pointSize);
  const accentRef = useRefPc(accent);

  useEffectPc(() => { progressRef.current = progress; }, [progress]);
  useEffectPc(() => { rotateRef.current = autoRotate; }, [autoRotate]);
  useEffectPc(() => { sizeRef.current = pointSize; }, [pointSize]);
  useEffectPc(() => { accentRef.current = accent; }, [accent]);

  useEffectPc(() => {
    if (!window.__SCENE_B64 || !window.THREE) return;
    const THREE = window.THREE;
    const container = containerRef.current;

    const scene = new THREE.Scene();
    scene.background = null;

    const w = container.clientWidth;
    const h = container.clientHeight;
    const camera = new THREE.PerspectiveCamera(CAM_FOV_Y_DEG, w / h, 0.1, 1000);
    // PLY data uses +Y = down (CV camera convention). Set camera up to -Y so
    // the scene renders with the ground at the bottom of the frame.
    camera.up.set(0, -1, 0);

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance',
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(w, h);
    renderer.setClearColor(0x000000, 0);
    if ('outputColorSpace' in renderer && THREE.SRGBColorSpace) {
      renderer.outputColorSpace = THREE.SRGBColorSpace;
    } else if ('outputEncoding' in renderer && THREE.sRGBEncoding) {
      renderer.outputEncoding = THREE.sRGBEncoding;
    }
    container.appendChild(renderer.domElement);

    // ---- Decode point data
    const { n, xyz, rgb } = decodeScene();

    // ---- Build per-point attributes in ORIGINAL camera-space coords:
    //   pos3D : true 3D position
    //   uv    : pixel coordinate on the source image (computed by projection)
    //   t     : per-point reveal time offset (0..1) so dissolve is staggered
    const pos3D = new Float32Array(n * 3);
    const uvs = new Float32Array(n * 2);
    const tOffsets = new Float32Array(n);

    // We also flip horizontally on the FINAL displayed cloud (you preferred that),
    // but UV mapping into the photo must match the unflipped image. So:
    //   * flip x in the displayed 3D position
    //   * UV uses the original (unflipped) x
    let zMin = Infinity, zMax = -Infinity;
    for (let i = 0; i < n; i++) {
      const x = xyz[i*3], y = xyz[i*3+1], z = xyz[i*3+2];
      // Display coords: match native PLY orientation. We'll adjust camera up
      // and UV computation to produce a correct viewing frame.
      pos3D[i*3]   = x;
      pos3D[i*3+1] = y;
      pos3D[i*3+2] = z;
      // UV from pinhole projection in image-file coords (v=0 top).
      const u = 0.5 + (x / z) / (2 * CAM_HALF_TAN_X);
      const v = 0.5 + (y / z) / (2 * CAM_HALF_TAN_Y);
      uvs[i*2]   = u;
      uvs[i*2+1] = v;
      if (z < zMin) zMin = z;
      if (z > zMax) zMax = z;
    }
    // Stagger by depth — closer points materialize first
    const zRange = zMax - zMin || 1;
    for (let i = 0; i < n; i++) {
      const z = xyz[i*3+2];
      const depthT = (z - zMin) / zRange; // 0 = closest, 1 = farthest
      // Mostly depth-driven with small random jitter for organic feel
      tOffsets[i] = depthT * 0.7 + Math.random() * 0.3;
    }

    // ---- The "image-plane" position for each point: where it sits when
    // pinned to the photo. We build the photo as a plane at distance D in front
    // of the camera; the point at UV (u,v) on that plane has 3D coords:
    //   x_plane = (u - 0.5) * planeW
    //   y_plane = (0.5 - v) * planeH  (image-space y → world-space y)
    //   z_plane = D
    // Because the camera is at origin looking +Z, this is straightforward.
    const PLANE_DIST = 6.0;
    const planeH = 2 * CAM_HALF_TAN_Y * PLANE_DIST;
    const planeW = 2 * CAM_HALF_TAN_X * PLANE_DIST;
    const posPlane = new Float32Array(n * 3);
    for (let i = 0; i < n; i++) {
      const u = uvs[i*2], v = uvs[i*2+1];
      // Image-plane home: pos3D ends at (x, y, z) where PLY y>0 = down. Match that.
      posPlane[i*3]   = (u - 0.5) * planeW;
      posPlane[i*3+1] = (v - 0.5) * planeH;
      posPlane[i*3+2] = PLANE_DIST;
    }

    // Cloud target offset: push points farther back (+Z) and down (+Y, since
    // PLY uses +Y = down). This lengthens each point's travel distance from
    // its image-plane home to its final 3D target, making the straight-line
    // journey read clearly as you scroll.
    const CLOUD_OFFSET_Y = 1.5;
    const CLOUD_OFFSET_Z = 9.0;
    let cx = 0, cy = 0, cz = 0;
    for (let i = 0; i < n; i++) {
      pos3D[i*3+1] += CLOUD_OFFSET_Y;
      pos3D[i*3+2] += CLOUD_OFFSET_Z;
      cx += pos3D[i*3];
      cy += pos3D[i*3+1];
      cz += pos3D[i*3+2];
    }
    cx /= n; cy /= n; cz /= n;
    const cloudCenter = { x: cx, y: cy, z: cz };

    // ---- Geometry
    const geom = new THREE.BufferGeometry();
    geom.setAttribute('aPos3D',  new THREE.BufferAttribute(pos3D, 3));
    geom.setAttribute('aPosImg', new THREE.BufferAttribute(posPlane, 3));
    geom.setAttribute('aUV',     new THREE.BufferAttribute(uvs, 2));
    geom.setAttribute('aT',      new THREE.BufferAttribute(tOffsets, 1));
    // Per-point RGB from the PLY — used as the point color directly.
    const colors = new Float32Array(n * 3);
    for (let i = 0; i < n * 3; i++) colors[i] = rgb[i] / 255;
    geom.setAttribute('aColor', new THREE.BufferAttribute(colors, 3));
    // PlaceHolder position attribute (required by some pipelines); ignored in shader
    geom.setAttribute('position', new THREE.BufferAttribute(pos3D, 3));

    // ---- Texture (sampled by the point cloud to color each point from the image)
    const tex = new THREE.TextureLoader().load('assets/warehouse.png?v=5');
    if ('SRGBColorSpace' in THREE) tex.colorSpace = THREE.SRGBColorSpace;
    else if ('sRGBEncoding' in THREE) tex.encoding = THREE.sRGBEncoding;
    tex.minFilter = THREE.LinearFilter;
    tex.magFilter = THREE.LinearFilter;
    tex.generateMipmaps = false;
    // Disable Y-flip on upload; our UVs use image-file coords (v=0 top, v=1 bottom)
    tex.flipY = false;
    // Dedicated texture for the backdrop so we can orient it independently
    // of the point-cloud color sampling.
    const bgTex = new THREE.TextureLoader().load('assets/warehouse.png?v=5');
    if ('SRGBColorSpace' in THREE) bgTex.colorSpace = THREE.SRGBColorSpace;
    else if ('sRGBEncoding' in THREE) bgTex.encoding = THREE.sRGBEncoding;
    bgTex.minFilter = THREE.LinearFilter;
    bgTex.magFilter = THREE.LinearFilter;
    bgTex.generateMipmaps = false;
    bgTex.flipY = false;
    bgTex.wrapS = THREE.ClampToEdgeWrapping;
    bgTex.wrapT = THREE.ClampToEdgeWrapping;

    // ---- Shader
    const mat = new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      uniforms: {
        uTex:      { value: tex },
        uReveal:   { value: 0 },        // 0 = pinned to image, 1 = full 3D
        uPointSize:{ value: pointSize },
        uPxRatio:  { value: renderer.getPixelRatio() },
        uOpacity:  { value: 1 },
      },
      vertexShader: `
        attribute vec3 aPos3D;
        attribute vec3 aPosImg;
        attribute vec2 aUV;
        attribute vec3 aColor;
        attribute float aT;
        uniform float uReveal;
        uniform float uPointSize;
        uniform float uPxRatio;
        varying vec3 vColor;
        varying float vK;
        void main() {
          // Per-point reveal: staggered by aT, each takes ~0.5 of normalized time.
          // First ~6% of scroll is held at 0 so the image stays untouched.
          float hold = 0.04;
          float t = max(0.0, uReveal - hold) / (1.0 - hold);
          float k = clamp((t - aT * 0.45) / 0.8, 0.0, 1.0);
          float kS = k * k * k * (k * (k * 6.0 - 15.0) + 10.0);

          // Straight-line interpolation: image-plane home -> true 3D position.
          vec3 pos = mix(aPosImg, aPos3D, kS);

          vec4 mv = modelViewMatrix * vec4(pos, 1.0);
          gl_Position = projectionMatrix * mv;
          vColor = aColor;
          vK = kS;
          float sizeBoost = mix(0.85, 1.0, smoothstep(0.0, 0.3, kS));
          gl_PointSize = uPointSize * sizeBoost * uPxRatio;
        }
      `,
      fragmentShader: `
        precision highp float;
        uniform float uOpacity;
        varying vec3 vColor;
        varying float vK;
        void main() {
          vec2 d = gl_PointCoord - 0.5;
          float r = dot(d, d);
          if (r > 0.25) discard;
          float alpha = smoothstep(0.0, 0.18, vK) * uOpacity;
          gl_FragColor = vec4(vColor, alpha);
        }
      `,
    });

    const points = new THREE.Points(geom, mat);
    points.frustumCulled = false;
    scene.add(points);

    // ---- Backdrop photo plane: the actual image, fully visible at start,
    // fading out as the points fly into 3D. Sized to fill the camera FOV at
    // the same distance as the points' image-plane home, sitting just behind.
    const backdropGeom = new THREE.PlaneGeometry(planeW, planeH);
    const backdropMat = new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      side: THREE.DoubleSide,
      uniforms: {
        uTex: { value: bgTex },
        uOpacity: { value: 1 },
      },
      vertexShader: `
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        precision highp float;
        varying vec2 vUv;
        uniform sampler2D uTex;
        uniform float uOpacity;
        void main() {
          vec4 c = texture2D(uTex, vUv);
          gl_FragColor = vec4(c.rgb, c.a * uOpacity);
        }
      `,
    });
    const backdrop = new THREE.Mesh(backdropGeom, backdropMat);
    // Place a hair behind the image-plane home so points draw on top
    backdrop.position.set(0, 0, PLANE_DIST + 0.05);
    backdrop.renderOrder = -1;
    backdrop.visible = false; // DOM <img> handles the photo instead
    scene.add(backdrop);

    // Initial camera at the original photo vantage (origin in ORIGINAL space).
    // Because we flipped X for display, mirror the camera too: still origin.
    const camHome = new THREE.Vector3(0, 0, 0);
    // Look-at: a point along +Z (forward axis of original camera).
    const lookAt = new THREE.Vector3(0, 0, 10);

    camera.position.copy(camHome);
    camera.lookAt(lookAt);

    stateRef.current = {
      THREE, scene, camera, renderer, points, mat, container,
      backdrop, backdropMat,
      camHome, lookAt, cloudCenter,
      autoT: 0,
    };

    const onResize = () => {
      const W = container.clientWidth;
      const H = container.clientHeight;
      camera.aspect = W / H;
      camera.updateProjectionMatrix();
      renderer.setSize(W, H);
      mat.uniforms.uPxRatio.value = renderer.getPixelRatio();
    };
    window.addEventListener('resize', onResize);

    let rafId;
    const tick = () => {
      const s = stateRef.current;
      if (!s) return;
      const p = progressRef.current;
      const auto = rotateRef.current;

      // Two-phase scroll:
      //   p in [0, 0.7]  -> "reveal" phase: points fly from image into 3D
      //   p in [0.7, 1]  -> "rotate" phase: scroll-driven camera rotation
      const revealP = Math.min(1, p / 0.7);
      const rotateP = Math.max(0, (p - 0.7) / 0.3);

      s.mat.uniforms.uReveal.value = revealP;
      s.mat.uniforms.uPointSize.value = sizeRef.current;
      // Backdrop photo: fully opaque initially; fades as points peel away.
      const bgFade = Math.max(0, (revealP - 0.1) / 0.75);
      s.backdropMat.uniforms.uOpacity.value = Math.max(0, 1 - bgFade);

      // Camera: dolly back a touch during reveal, then rotate by scroll.
      const back = new s.THREE.Vector3().subVectors(s.camHome, s.lookAt).normalize();
      const dollyDist = revealP * 2.0; // small pullback only
      const pos = new s.THREE.Vector3()
        .copy(s.camHome)
        .add(back.multiplyScalar(dollyDist));
      // Scroll-driven rotation around the CLOUD's centroid so the cloud
      // appears to rotate about its own axis (rather than orbiting off-screen).
      const a = rotateP * Math.PI * 0.52;
      const center = s.cloudCenter;
      const dx = pos.x - center.x;
      const dz = pos.z - center.z;
      pos.x = center.x + dx * Math.cos(a) - dz * Math.sin(a);
      pos.z = center.z + dx * Math.sin(a) + dz * Math.cos(a);
      s.camera.position.copy(pos);
      s.camera.lookAt(center.x, s.lookAt.y, center.z);

      s.renderer.render(s.scene, s.camera);
      rafId = requestAnimationFrame(tick);
    };
    rafId = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener('resize', onResize);
      renderer.dispose();
      geom.dispose();
      mat.dispose();
      tex.dispose();
      if (renderer.domElement.parentNode === container) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <div
      ref={containerRef}
      style={{
        position: 'absolute',
        inset: 0,
        pointerEvents: 'none',
      }}
    />
  );
}

window.PointCloud = PointCloud;
