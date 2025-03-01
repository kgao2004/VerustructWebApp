<template>
  <div class="visualization-container" ref="container"></div>
</template>

<script>
import { ref, onMounted, onBeforeUnmount, watch } from 'vue'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'

export default {
  name: 'WallVisualization',
  props: {
    roomShape: {
      type: String,
      required: true
    },
    wallHeight: {
      type: Number,
      required: true
    },
    wallWidth: {
      type: Number,
      required: true
    },
    numberOfLayers: {
      type: Number,
      required: true
    },
    chamberA: {
      type: Number,
      required: true
    }
  },
  setup(props) {
    const container = ref(null)
    let scene, camera, renderer, controls
    let wallMesh

    const init = () => {
      // Scene setup
      scene = new THREE.Scene()
      scene.background = new THREE.Color(0xf0f0f0)

      // Camera setup
      camera = new THREE.PerspectiveCamera(
        75,
        container.value.clientWidth / container.value.clientHeight,
        0.1,
        10000
      )
      camera.position.set(1000, 1000, 1000)

      // Renderer setup
      renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: true
      })
      renderer.setPixelRatio(window.devicePixelRatio)
      renderer.setSize(container.value.clientWidth, container.value.clientHeight)
      renderer.shadowMap.enabled = true
      renderer.shadowMap.type = THREE.PCFSoftShadowMap
      renderer.outputColorSpace = THREE.SRGBColorSpace
      container.value.appendChild(renderer.domElement)

      // Controls
      controls = new OrbitControls(camera, renderer.domElement)
      controls.enableDamping = true

      // Lighting
      const ambientLight = new THREE.AmbientLight(0xffffff, 0.5)
      scene.add(ambientLight)

      const directionalLight = new THREE.DirectionalLight(0xffffff, 1)
      directionalLight.position.set(10, 10, 10)
      directionalLight.castShadow = true
      scene.add(directionalLight)

      // Grid helper
      // Grid is 2000x2000cm, 20 divisions
      // Each grid square is 100x100cm
      const gridHelper = new THREE.GridHelper(2000, 20)
      scene.add(gridHelper)

      updateWalls()
      animate()
    }

    const updateWalls = () => {
      // Remove existing wall if any
      if (wallMesh) scene.remove(wallMesh)

      // Calculate dimensions
      const length = props.roomShape === 'square' ? 685.8 : 914.4 // in cm
      const width = 685.8 // in cm
      const height = props.wallHeight
      const layerHeight = props.chamberA

      // Create wall geometry
      const wallGeometry = new THREE.Group()

      // Create layers
      for (let i = 0; i < props.numberOfLayers; i++) {
        // Front wall
        createWallSegment(0, i * layerHeight, 0, length, layerHeight, props.wallWidth, wallGeometry)
        // Right wall
        createWallSegment(length - props.wallWidth, i * layerHeight, 0, props.wallWidth, layerHeight, width, wallGeometry)
        // Back wall
        createWallSegment(0, i * layerHeight, width - props.wallWidth, length, layerHeight, props.wallWidth, wallGeometry)
        // Left wall
        createWallSegment(0, i * layerHeight, 0, props.wallWidth, layerHeight, width, wallGeometry)
      }

      scene.add(wallGeometry)
      wallMesh = wallGeometry
    }

    const createWallSegment = (x, y, z, width, height, depth, group) => {
      const geometry = new THREE.BoxGeometry(width, height, depth)
      const material = new THREE.MeshStandardMaterial({
        roughness: 0.7,
        metalness: 0.0,
        side: THREE.DoubleSide
      })
      const segment = new THREE.Mesh(geometry, material)
      segment.position.set(x + width/2, y + height/2, z + depth/2)
      group.add(segment)
    }

    const animate = () => {
      requestAnimationFrame(animate)
      controls.update()
      renderer.render(scene, camera)
    }

    const handleResize = () => {
      if (container.value && camera && renderer) {
        camera.aspect = container.value.clientWidth / container.value.clientHeight
        camera.updateProjectionMatrix()
        renderer.setSize(container.value.clientWidth, container.value.clientHeight)
      }
    }

    // Lifecycle hooks
    onMounted(() => {
      init()
      window.addEventListener('resize', handleResize)
    })

    onBeforeUnmount(() => {
      window.removeEventListener('resize', handleResize)
      if (renderer) {
        renderer.dispose()
      }
    })

    // Watch for prop changes
    watch([
      () => props.roomShape,
      () => props.wallHeight,
      () => props.numberOfLayers,
      () => props.wallWidth,
      () => props.chamberA
    ], () => {
      if (scene) updateWalls()
    })

    return { container }
  }
}
</script>

<style scoped>
.visualization-container {
  width: 100%;
  height: 400px;
  border-radius: 8px;
  overflow: hidden;
}
</style> 