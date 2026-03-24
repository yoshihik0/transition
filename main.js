// ─── シーン・カメラ・レンダラー ────────────────────────────────
const canvas = document.getElementById('webgl')
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true })
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
renderer.setSize(window.innerWidth, window.innerHeight)

const scene = new THREE.Scene()
const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1)

// ─── 画像テクスチャを読み込み ─────────────────────────────────
const loader = new THREE.TextureLoader()

const textures = [
  loader.load('images/gallery1.jpg'),
  loader.load('images/gallery2.jpg'),
  loader.load('images/gallery3.jpg'),
]

// ─── シェーダーマテリアル ─────────────────────────────────────
const material = new THREE.ShaderMaterial({
  uniforms: {
    uTexture1:    { value: textures[0] },
    uTexture2:    { value: textures[1] },
    uProgress:    { value: 0 },
    uDistortion:  { value: 0 },
  },
  vertexShader:   document.getElementById('vertexShader').textContent,
  fragmentShader: document.getElementById('fragmentShader').textContent,
})

// フルスクリーン平面
const geometry = new THREE.PlaneGeometry(2, 2)
const mesh = new THREE.Mesh(geometry, material)
scene.add(mesh)

// ─── トランジション制御 ───────────────────────────────────────
let currentIndex = 0
let isAnimating = false

const buttons = document.querySelectorAll('nav button')
buttons[0].classList.add('active')

function transitionTo(nextIndex) {
  if (isAnimating || nextIndex === currentIndex) return
  isAnimating = true

  // テクスチャをセット
  material.uniforms.uTexture1.value = textures[currentIndex]
  material.uniforms.uTexture2.value = textures[nextIndex]
  material.uniforms.uProgress.value = 0

  // ボタンのactive切り替え
  buttons[currentIndex].classList.remove('active')
  buttons[nextIndex].classList.add('active')

  gsap.to(material.uniforms.uProgress, {
    value: 1,
    duration: 1.4,
    ease: 'power2.inOut',
    onUpdate: () => {
      // 歪み量: 中間（progress=0.5）が最大
      const p = material.uniforms.uProgress.value
      material.uniforms.uDistortion.value = Math.sin(p * Math.PI) * 0.15
    },
    onComplete: () => {
      currentIndex = nextIndex
      // 次のトランジションのためにテクスチャ1を更新してリセット
      material.uniforms.uTexture1.value = textures[currentIndex]
      material.uniforms.uProgress.value = 0
      material.uniforms.uDistortion.value = 0
      isAnimating = false
    }
  })
}

// ─── ボタンイベント ───────────────────────────────────────────
buttons.forEach((btn) => {
  btn.addEventListener('click', () => {
    transitionTo(parseInt(btn.dataset.index))
  })
})

// ─── レンダーループ ───────────────────────────────────────────
function render() {
  requestAnimationFrame(render)
  renderer.render(scene, camera)
}
render()

// ─── リサイズ対応 ─────────────────────────────────────────────
window.addEventListener('resize', () => {
  renderer.setSize(window.innerWidth, window.innerHeight)
})
