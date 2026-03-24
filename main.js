// ── レンダラー・シーン・カメラ ──────────────────────────────────
const canvas   = document.getElementById('webgl')
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true })
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
renderer.setSize(window.innerWidth, window.innerHeight)

const scene  = new THREE.Scene()
const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1)

// ── テクスチャ読み込み ──────────────────────────────────────────
const loader   = new THREE.TextureLoader()
const textures = [
  loader.load('images/gallery1.jpg'),
  loader.load('images/gallery2.jpg'),
  loader.load('images/gallery3.jpg'),
]

// ── シェーダーマテリアル ────────────────────────────────────────
const material = new THREE.ShaderMaterial({
  uniforms: {
    uTexture1: { value: textures[0] },
    uTexture2: { value: textures[1] },
    uProgress: { value: 0 },
    uTime:     { value: 0 },
  },
  vertexShader:   document.getElementById('vertexShader').textContent,
  fragmentShader: document.getElementById('fragmentShader').textContent,
})

const mesh = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), material)
scene.add(mesh)

// ── トランジション制御 ─────────────────────────────────────────
let currentIndex = 0
let isAnimating  = false

const buttons = document.querySelectorAll('nav button')
buttons[0].classList.add('active')

function transitionTo(nextIndex) {
  if (isAnimating || nextIndex === currentIndex) return
  isAnimating = true

  material.uniforms.uTexture1.value = textures[currentIndex]
  material.uniforms.uTexture2.value = textures[nextIndex]
  material.uniforms.uProgress.value = 0

  buttons[currentIndex].classList.remove('active')
  buttons[nextIndex].classList.add('active')

  gsap.to(material.uniforms.uProgress, {
    value:    1,
    duration: 1.6,
    ease:     'power3.inOut',   // 最初と最後をゆっくり、中間を速く
    onComplete() {
      currentIndex = nextIndex
      material.uniforms.uTexture1.value = textures[currentIndex]
      material.uniforms.uProgress.value = 0
      isAnimating = false
    }
  })
}

// ── ボタン ─────────────────────────────────────────────────────
buttons.forEach(btn => {
  btn.addEventListener('click', () => {
    transitionTo(parseInt(btn.dataset.index))
  })
})

// ── レンダーループ ─────────────────────────────────────────────
const clock = new THREE.Clock()

function render() {
  requestAnimationFrame(render)
  material.uniforms.uTime.value = clock.getElapsedTime()
  renderer.render(scene, camera)
}
render()

// ── リサイズ ───────────────────────────────────────────────────
window.addEventListener('resize', () => {
  renderer.setSize(window.innerWidth, window.innerHeight)
})
