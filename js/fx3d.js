// 3D 공용 효과: 버블 가계도(js/bubble.js)에서 다듬은 셰이더와 HDR 후처리를 다른 3D 페이지(세계사 연관도)가 함께 쓴다.
//   유리 구슬·껍질·고리·흐르는 연결선·축 빛기둥·밤하늘·홀로그램 바닥·먼지 입자, 블룸·ACES 합성(휴대폰 GPU의 NaN 방지 포함).
// 사용: const fx = Genealogy.FX3D({ renderer, scene, camera });
(function (G) {
  'use strict';
  const T = window.THREE;
  const isNarrow = () => window.matchMedia('(max-width: 820px)').matches;

  G.FX3D = function ({ renderer, scene, camera }) {
    const GLSL_NOISE = /* glsl */`
      float hash13(vec3 p) { p = fract(p * 0.1031); p += dot(p, p.zyx + 31.32); return fract((p.x + p.y) * p.z); }
      float vnoise(vec3 p) {
        vec3 i = floor(p), f = fract(p); f = f * f * (3.0 - 2.0 * f);
        return mix(mix(mix(hash13(i), hash13(i + vec3(1,0,0)), f.x), mix(hash13(i + vec3(0,1,0)), hash13(i + vec3(1,1,0)), f.x), f.y),
                   mix(mix(hash13(i + vec3(0,0,1)), hash13(i + vec3(1,0,1)), f.x), mix(hash13(i + vec3(0,1,1)), hash13(i + vec3(1,1,1)), f.x), f.y), f.z);
      }
      float fbm(vec3 p) { float a = 0.5, s = 0.0; for (int i = 0; i < 5; i++) { s += a * vnoise(p); p = p * 2.03 + 11.7; a *= 0.5; } return s; }
    `;

    const uTime = { value: 0 };

    function sphereMaterial() {
      return new T.ShaderMaterial({
        uniforms: { uTime, uLight: { value: new T.Vector3(0.5, 0.75, 0.42).normalize() } },
        vertexShader: /* glsl */`
          attribute vec3 aColor;
          attribute vec4 aParams; // x 밝기, y 강조(마우스·선택), z 미상(채도 낮춤), w 고유값
          varying vec3 vN, vV, vObj, vColor; varying vec4 vP;
          void main() {
            vec4 wp = modelMatrix * instanceMatrix * vec4(position, 1.0);
            vN = normalize(mat3(modelMatrix * instanceMatrix) * normal);
            vV = normalize(cameraPosition - wp.xyz);
            vObj = position; vColor = aColor; vP = aParams;
            gl_Position = projectionMatrix * viewMatrix * wp;
          }`,
        fragmentShader: /* glsl */`
          uniform float uTime; uniform vec3 uLight;
          varying vec3 vN, vV, vObj, vColor; varying vec4 vP;
          ${GLSL_NOISE}
          // 스튜디오 조명을 흉내 낸 절차적 환경: 위는 밝은 남청, 아래는 어둡고, 소프트박스 두 개
          vec3 env(vec3 r) {
            vec3 c = mix(vec3(0.012, 0.018, 0.035), vec3(0.09, 0.15, 0.27), smoothstep(-0.2, 1.0, r.y));
            c += vec3(1.0, 0.95, 0.88) * 2.6 * smoothstep(0.93, 0.985, dot(r, normalize(vec3(0.5, 0.75, 0.42))));
            c += vec3(0.35, 0.75, 1.0) * 1.6 * smoothstep(0.86, 0.97, dot(r, normalize(vec3(-0.75, 0.15, -0.55))));
            c += vec3(1.0, 0.45, 0.75) * 0.5 * smoothstep(0.0, -0.9, r.y);
            return c;
          }
          void main() {
            vec3 N = normalize(vN), V = normalize(vV);
            float ndv = clamp(dot(N, V), 0.0, 1.0);
            float fres = pow(1.0 - ndv, 3.0);
            vec3 R = reflect(-V, N);
            // 유리 속에서 은은히 흐르는 빛(속심): 가운데가 밝고, 잡음이 천천히 흐른다
            float flow = fbm(vObj * 1.8 + vec3(0.0, -uTime * 0.22, vP.w * 17.0));
            vec3 c = vColor * (0.05 + 0.62 * pow(ndv, 2.2)) * (0.55 + 0.9 * flow) * vP.x;
            // 유리 껍질 안쪽으로 번지는 제 색(가장자리 쪽이 진하다)
            c += vColor * pow(1.0 - ndv, 1.8) * 0.75 * (0.5 + 0.5 * vP.x);
            // 반사: 슐릭 근사 프레넬 × 절차적 환경, 가장자리에 얇은 막의 무지갯빛
            float F = 0.04 + 0.96 * pow(1.0 - ndv, 5.0);
            vec3 film = 0.5 + 0.5 * cos(6.2831 * (vec3(0.0, 0.33, 0.67) + fres * 1.3 + ndv * 0.25 + uTime * 0.02));
            c += env(R) * (0.05 + F * 1.25) * mix(vec3(1.0), film, 0.45);
            // 주광의 날카로운 반짝임
            vec3 H = normalize(uLight + V);
            c += vec3(1.0, 0.97, 0.92) * pow(max(dot(N, H), 0.0), 260.0) * 2.4;
            // 마우스·선택 강조
            c += vColor * vP.y * (0.12 + 0.9 * pow(1.0 - ndv, 1.6)) * (0.85 + 0.15 * sin(uTime * 4.0));
            float l = dot(c, vec3(0.2126, 0.7152, 0.0722));
            c = mix(c, vec3(l) * vec3(0.8, 0.86, 1.0) * 0.7, vP.z);
            gl_FragColor = vec4(clamp(c, 0.0, 32.0), 1.0);
          }`,
      });
    }

    // 접힌 자손을 담은 반투명 껍질: 가장자리만 빛나고 가로 줄무늬가 천천히 흐른다.
    function shellMaterial() {
      return new T.ShaderMaterial({
        uniforms: { uTime },
        transparent: true, depthWrite: false, blending: T.AdditiveBlending,
        vertexShader: /* glsl */`
          attribute vec3 aColor; attribute vec4 aParams; // x 보임(0..1), y 강조, w 고유값
          varying vec3 vN, vV, vObj, vColor; varying vec4 vP;
          void main() {
            vec4 wp = modelMatrix * instanceMatrix * vec4(position, 1.0);
            vN = normalize(mat3(modelMatrix * instanceMatrix) * normal);
            vV = normalize(cameraPosition - wp.xyz);
            vObj = position; vColor = aColor; vP = aParams;
            gl_Position = projectionMatrix * viewMatrix * wp;
          }`,
        fragmentShader: /* glsl */`
          uniform float uTime;
          varying vec3 vN, vV, vObj, vColor; varying vec4 vP;
          void main() {
            float ndv = clamp(abs(dot(normalize(vN), normalize(vV))), 0.0, 1.0);
            float fres = pow(1.0 - ndv, 2.4);
            float band = smoothstep(0.42, 0.5, abs(fract(vObj.y * 4.0 - uTime * 0.35 + vP.w * 3.0) - 0.5));
            float dots = step(0.86, fract(sin(dot(floor(vObj * 9.0), vec3(12.9898, 78.233, 37.719))) * 43758.5453));
            float a = (fres * 0.85 + band * 0.07 * (0.3 + fres) + dots * 0.05 * fres) * vP.x * (1.0 + vP.y * 0.8);
            a = clamp(a, 0.0, 4.0);
            gl_FragColor = vec4(vColor * 1.35 * a, min(a, 1.0));
          }`,
      });
    }

    // 이름난 인물·기준 인물의 고리: 스스로 빛난다.
    function ringMaterial() {
      return new T.ShaderMaterial({
        uniforms: { uTime },
        transparent: true, depthWrite: false, blending: T.AdditiveBlending,
        vertexShader: /* glsl */`
          attribute vec3 aColor; attribute vec4 aParams;
          varying vec3 vColor; varying float vA, vU;
          void main() {
            vColor = aColor; vA = aParams.x; vU = atan(position.y, position.x);
            gl_Position = projectionMatrix * viewMatrix * modelMatrix * instanceMatrix * vec4(position, 1.0);
          }`,
        fragmentShader: /* glsl */`
          uniform float uTime; varying vec3 vColor; varying float vA, vU;
          void main() {
            float s = 0.55 + 0.45 * sin(vU * 3.0 - uTime * 2.2);
            gl_FragColor = vec4(clamp(vColor * (1.2 + 1.8 * s) * vA, 0.0, 32.0), 1.0);
          }`,
      });
    }

    // 연결선: 곡선을 짧은 원통 토막으로 잇고, 위(조상)에서 아래(자손)로 빛 알갱이가 흐른다.
    function edgeMaterial() {
      return new T.ShaderMaterial({
        uniforms: { uTime },
        transparent: true, depthWrite: false, blending: T.AdditiveBlending,
        vertexShader: /* glsl */`
          attribute vec3 aColA, aColB; attribute vec2 aSeg; attribute vec4 aParams; // x 세기, y 흐름 속도, z 직계, w 보임
          varying float vT, vNdv; varying vec3 vCol; varying vec4 vP;
          void main() {
            vT = mix(aSeg.x, aSeg.y, position.y + 0.5);
            vCol = mix(aColA, aColB, smoothstep(0.0, 1.0, vT));
            vP = aParams;
            vec4 wp = modelMatrix * instanceMatrix * vec4(position, 1.0);
            vec3 n = normalize(mat3(modelMatrix * instanceMatrix) * normal);
            vNdv = clamp(abs(dot(n, normalize(cameraPosition - wp.xyz))), 0.0, 1.0);
            gl_Position = projectionMatrix * viewMatrix * wp;
          }`,
        fragmentShader: /* glsl */`
          uniform float uTime; varying float vT, vNdv; varying vec3 vCol; varying vec4 vP;
          void main() {
            float p = fract(vT * 1.6 - uTime * vP.y);
            float pulse = smoothstep(0.0, 0.05, p) * (1.0 - smoothstep(0.05, 0.32, p));
            float core = pow(vNdv, 1.3);
            float a = (0.18 + 0.82 * core) * vP.w;
            vec3 c = vCol * (vP.x * (0.55 + 0.45 * core) + pulse * (0.6 + 2.2 * vP.z));
            a = clamp(a, 0.0, 2.0);
            gl_FragColor = vec4(clamp(c * a, 0.0, 32.0), min(a, 1.0));
          }`,
      });
    }

    // 가운데 축 빛기둥(직계 자손 축 옵션): 가는 금빛 기둥에 빛 마디가 아래로 흐른다.
    function axisMaterial() {
      return new T.ShaderMaterial({
        uniforms: { uTime, uVis: { value: 0 } },
        transparent: true, depthWrite: false, blending: T.AdditiveBlending,
        vertexShader: /* glsl */`
          varying float vY, vNdv;
          void main() {
            vY = position.y + 0.5;
            vec4 wp = modelMatrix * vec4(position, 1.0);
            vec3 n = normalize(mat3(modelMatrix) * normal);
            vNdv = clamp(abs(dot(n, normalize(cameraPosition - wp.xyz))), 0.0, 1.0);
            gl_Position = projectionMatrix * viewMatrix * wp;
          }`,
        fragmentShader: /* glsl */`
          uniform float uTime, uVis; varying float vY, vNdv;
          void main() {
            float core = pow(vNdv, 2.0);
            float p = fract(vY * 9.0 + uTime * 0.45);
            float pulse = smoothstep(0.0, 0.06, p) * (1.0 - smoothstep(0.06, 0.4, p));
            float ends = smoothstep(0.0, 0.04, vY) * smoothstep(1.0, 0.96, vY);
            float a = clamp((0.12 + 0.6 * core + pulse * 0.5 * core) * ends * uVis, 0.0, 1.0);
            gl_FragColor = vec4(vec3(1.0, 0.78, 0.36) * a * 1.6, a);
          }`,
      });
    }

    // 밤하늘: 깊은 남색 그라데이션 + 성운(fbm) + 반짝이는 별
    function skyMaterial() {
      return new T.ShaderMaterial({
        uniforms: { uTime },
        side: T.BackSide, depthWrite: false,
        vertexShader: /* glsl */`
          varying vec3 vDir;
          void main() { vDir = normalize(position); gl_Position = projectionMatrix * viewMatrix * modelMatrix * vec4(position, 1.0); }`,
        fragmentShader: /* glsl */`
          uniform float uTime; varying vec3 vDir;
          ${GLSL_NOISE}
          void main() {
            vec3 d = normalize(vDir);
            vec3 c = mix(vec3(0.004, 0.006, 0.013), vec3(0.012, 0.022, 0.045), smoothstep(-0.4, 0.7, d.y));
            float n1 = fbm(d * 2.2 + vec3(0.0, 0.0, uTime * 0.004));
            float n2 = fbm(d * 3.6 + 7.3);
            c += vec3(0.02, 0.07, 0.10) * pow(n1, 2.6) * 1.6;
            c += vec3(0.07, 0.02, 0.10) * pow(n2, 3.2) * 1.8;
            vec3 p = d * 220.0; vec3 id = floor(p);
            float h = hash13(id);
            if (h > 0.972) {
              vec3 f = fract(p) - 0.5 - (vec3(hash13(id + 1.7), hash13(id + 4.1), hash13(id + 9.3)) - 0.5) * 0.5;
              float tw = 0.55 + 0.45 * sin(uTime * (1.0 + h * 3.0) + h * 80.0);
              c += mix(vec3(0.7, 0.85, 1.0), vec3(1.0, 0.9, 0.75), hash13(id + 3.3)) * smoothstep(0.12, 0.0, length(f)) * (h - 0.972) * 70.0 * tw;
            }
            gl_FragColor = vec4(c, 1.0);
          }`,
      });
    }

    // 홀로그램 바닥: 동심원·방사선 격자가 가운데에서 멀어질수록 흐려진다.
    function floorMaterial() {
      return new T.ShaderMaterial({
        uniforms: { uTime, uScale: { value: 1 } },
        transparent: true, depthWrite: false, blending: T.AdditiveBlending,
        vertexShader: /* glsl */`
          varying vec2 vXZ; void main() { vec4 wp = modelMatrix * vec4(position, 1.0); vXZ = wp.xz; gl_Position = projectionMatrix * viewMatrix * wp; }`,
        fragmentShader: /* glsl */`
          uniform float uTime, uScale; varying vec2 vXZ;
          void main() {
            float r = length(vXZ) / uScale;
            // 원점에서 atan(0, 0)은 GPU에 따라 NaN이 되므로 살짝 비켜 계산한다.
            float ang = atan(vXZ.y, vXZ.x + 1e-4) / 6.2831 * 48.0;
            float aaR = fwidth(r * 0.25) * 1.5, aaA = fwidth(ang) * 1.5;
            float rings = 1.0 - smoothstep(0.0, aaR, abs(fract(r * 0.25) - 0.5) - 0.5 + aaR);
            float rays = (1.0 - smoothstep(0.0, aaA, abs(fract(ang) - 0.5) - 0.5 + aaA)) * smoothstep(4.0, 10.0, r);
            float sweep = pow(max(0.0, sin(r * 0.18 - uTime * 0.9)), 18.0);
            float fade = exp(-r * 0.028);
            float glow = exp(-r * 0.12) * 0.1;
            float a = ((rings * 0.5 + rays * 0.22) * (0.45 + sweep * 0.9) + glow) * fade;
            a = clamp(a, 0.0, 1.0);
            gl_FragColor = vec4(vec3(0.25, 0.7, 1.0) * a * 0.32, a);
          }`,
        extensions: { derivatives: true },
      });
    }

    // 떠다니는 먼지(빛 입자)
    function makeDust() {
      const n = isNarrow() ? 700 : 1400;
      const pos = new Float32Array(n * 3), seed = new Float32Array(n);
      for (let i = 0; i < n; i++) {
        const r = 20 + Math.random() * 160, a = Math.random() * Math.PI * 2;
        pos[i * 3] = Math.cos(a) * r; pos[i * 3 + 1] = 30 - Math.random() * 200; pos[i * 3 + 2] = Math.sin(a) * r;
        seed[i] = Math.random();
      }
      const g = new T.BufferGeometry();
      g.setAttribute('position', new T.BufferAttribute(pos, 3));
      g.setAttribute('aSeed', new T.BufferAttribute(seed, 1));
      const m = new T.ShaderMaterial({
        uniforms: { uTime, uPR: { value: renderer.getPixelRatio() } },
        transparent: true, depthWrite: false, blending: T.AdditiveBlending,
        vertexShader: /* glsl */`
          uniform float uTime, uPR; attribute float aSeed; varying float vA; varying float vS;
          void main() {
            vec3 p = position; p.y += sin(uTime * 0.2 + aSeed * 30.0) * 1.5;
            vec4 mv = modelViewMatrix * vec4(p, 1.0);
            gl_PointSize = (1.2 + aSeed * 2.4) * uPR * (120.0 / -mv.z);
            vA = (0.25 + 0.75 * (0.5 + 0.5 * sin(uTime * (0.6 + aSeed) + aSeed * 50.0))) * smoothstep(400.0, 60.0, -mv.z);
            vS = aSeed;
            gl_Position = projectionMatrix * mv;
          }`,
        fragmentShader: /* glsl */`
          varying float vA; varying float vS;
          void main() {
            float d = length(gl_PointCoord - 0.5);
            float a = smoothstep(0.5, 0.0, d) * vA * 0.55;
            gl_FragColor = vec4(mix(vec3(0.45, 0.8, 1.0), vec3(1.0, 0.85, 0.7), vS) * a, a);
          }`,
      });
      return new T.Points(g, m);
    }

    function instanced(geo, mat, count, attrs) {
      for (const [name, size] of attrs) {
        geo.setAttribute(name, new T.InstancedBufferAttribute(new Float32Array(count * size), size).setUsage(T.DynamicDrawUsage));
      }
      const m = new T.InstancedMesh(geo, mat, count);
      m.instanceMatrix.setUsage(T.DynamicDrawUsage);
      m.frustumCulled = false;
      m.count = 0;
      return m;
    }

    // ── 후처리: HDR 장면 → 밝은 부분 추출 → 3단 흐림 → 합성(블룸, ACES 톤 매핑, 비네트, 색수차, 입자감) ──
    function makePost() {
      const quadGeo = new T.PlaneGeometry(2, 2);
      const quadCam = new T.OrthographicCamera(-1, 1, 1, -1, 0, 1);
      const quad = new T.Mesh(quadGeo);
      const quadScene = new T.Scene();
      quadScene.add(quad);
      const vs = /* glsl */`varying vec2 vUv; void main() { vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }`;
      // 휴대폰 GPU에서는 셰이더의 작은 오차가 NaN·무한대를 만들 수 있다. 그런 화소 하나가 흐림 단계를 거치며
      // 큰 검은 네모로 번지므로, 후처리에 들어가는 값은 모두 0 이상 유한한 값으로 바로잡는다.
      const SANE = /* glsl */`
        vec3 sane(vec3 c) {
          if (any(isnan(c)) || any(isinf(c)) || !(c.r == c.r && c.g == c.g && c.b == c.b)) return vec3(0.0);
          return clamp(c, 0.0, 64.0);
        }`;
      const rtOpts = { type: T.HalfFloatType, minFilter: T.LinearFilter, magFilter: T.LinearFilter, depthBuffer: false };
      const sceneRT = new T.WebGLRenderTarget(1, 1, { type: T.HalfFloatType, samples: isNarrow() ? 2 : 4 });
      const levels = [0, 1, 2, 3].map(() => ({ a: new T.WebGLRenderTarget(1, 1, rtOpts), b: new T.WebGLRenderTarget(1, 1, rtOpts) }));
      const bright = new T.ShaderMaterial({
        uniforms: { tSrc: { value: null }, uTh: { value: 1.0 } }, vertexShader: vs,
        fragmentShader: /* glsl */`uniform sampler2D tSrc; uniform float uTh; varying vec2 vUv; ${SANE}
          void main() { vec3 c = sane(texture2D(tSrc, vUv).rgb); float l = max(c.r, max(c.g, c.b));
            gl_FragColor = vec4(c * smoothstep(uTh, uTh + 0.8, l), 1.0); }`,
      });
      const blur = new T.ShaderMaterial({
        uniforms: { tSrc: { value: null }, uDir: { value: new T.Vector2() } }, vertexShader: vs,
        fragmentShader: /* glsl */`uniform sampler2D tSrc; uniform vec2 uDir; varying vec2 vUv; ${SANE}
          void main() {
            vec3 c = texture2D(tSrc, vUv).rgb * 0.2270270270;
            c += texture2D(tSrc, vUv + uDir * 1.3846153846).rgb * 0.3162162162;
            c += texture2D(tSrc, vUv - uDir * 1.3846153846).rgb * 0.3162162162;
            c += texture2D(tSrc, vUv + uDir * 3.2307692308).rgb * 0.0702702703;
            c += texture2D(tSrc, vUv - uDir * 3.2307692308).rgb * 0.0702702703;
            gl_FragColor = vec4(sane(c), 1.0); }`,
      });
      const copy = new T.ShaderMaterial({
        uniforms: { tSrc: { value: null } }, vertexShader: vs,
        fragmentShader: /* glsl */`uniform sampler2D tSrc; varying vec2 vUv; void main() { gl_FragColor = vec4(texture2D(tSrc, vUv).rgb, 1.0); }`,
      });
      const comp = new T.ShaderMaterial({
        uniforms: {
          tScene: { value: sceneRT.texture }, uTime,
          tB0: { value: levels[0].a.texture }, tB1: { value: levels[1].a.texture }, tB2: { value: levels[2].a.texture }, tB3: { value: levels[3].a.texture },
          uStrength: { value: 1.0 }, uRes: { value: new T.Vector2(1, 1) },
        },
        vertexShader: vs,
        fragmentShader: /* glsl */`
          uniform sampler2D tScene, tB0, tB1, tB2, tB3; uniform float uTime, uStrength; uniform vec2 uRes; varying vec2 vUv;
          ${SANE}
          vec3 aces(vec3 x) { const float a = 2.51, b = 0.03, c = 2.43, d = 0.59, e = 0.14; return clamp((x * (a * x + b)) / (x * (c * x + d) + e), 0.0, 1.0); }
          vec3 toSRGB(vec3 c) { return mix(c * 12.92, 1.055 * pow(c, vec3(1.0 / 2.4)) - 0.055, step(0.0031308, c)); }
          float hash(vec2 p) { return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453); }
          void main() {
            vec2 dc = vUv - 0.5;
            float r2 = dot(dc, dc);
            vec2 off = dc * r2 * 0.012;
            vec3 c = sane(vec3(texture2D(tScene, vUv + off).r, texture2D(tScene, vUv).g, texture2D(tScene, vUv - off).b));
            vec3 b = sane(texture2D(tB0, vUv).rgb) * 0.9 + sane(texture2D(tB1, vUv).rgb) * 0.8 + sane(texture2D(tB2, vUv).rgb) * 0.75 + sane(texture2D(tB3, vUv).rgb) * 0.7;
            c += b * uStrength * 0.42;
            c *= 1.08;
            c = aces(c);
            c *= mix(1.0, 0.55, smoothstep(0.12, 0.62, r2 * 1.6));
            c = toSRGB(clamp(c, 0.0, 1.0));
            c += (hash(vUv * uRes + fract(uTime) * 100.0) - 0.5) * 0.018;
            gl_FragColor = vec4(c, 1.0);
          }`,
      });
      const pass = (mat, target) => { quad.material = mat; renderer.setRenderTarget(target); renderer.render(quadScene, quadCam); };
      return {
        setSize(w, h, pr) {
          const W = Math.max(1, Math.floor(w * pr)), H = Math.max(1, Math.floor(h * pr));
          sceneRT.setSize(W, H);
          levels.forEach((l, i) => { const s = 2 ** (i + 1); l.a.setSize(Math.max(1, W / s | 0), Math.max(1, H / s | 0)); l.b.setSize(Math.max(1, W / s | 0), Math.max(1, H / s | 0)); });
          comp.uniforms.uRes.value.set(W, H);
        },
        render() {
          renderer.setRenderTarget(sceneRT);
          renderer.render(scene, camera);
          bright.uniforms.tSrc.value = sceneRT.texture;
          pass(bright, levels[0].a);
          for (let i = 0; i < levels.length; i++) {
            const L = levels[i];
            if (i > 0) { copy.uniforms.tSrc.value = levels[i - 1].a.texture; pass(copy, L.a); }
            blur.uniforms.tSrc.value = L.a.texture; blur.uniforms.uDir.value.set(1 / L.a.width, 0); pass(blur, L.b);
            blur.uniforms.tSrc.value = L.b.texture; blur.uniforms.uDir.value.set(0, 1 / L.a.height); pass(blur, L.a);
          }
          pass(comp, null);
        },
      };
    }

    return { uTime, GLSL_NOISE, sphereMaterial, shellMaterial, ringMaterial, edgeMaterial, axisMaterial, skyMaterial, floorMaterial,
      makeDust, instanced, makePost };
  };
})(globalThis.Genealogy = globalThis.Genealogy || {});
