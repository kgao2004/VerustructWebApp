<template>
    <div class="visualization-container" ref="container"></div>
</template>

<script>
import { ref, onMounted, onBeforeUnmount, watch } from 'vue'
import * as THREE from 'three'

export default {
  name: 'WallVisualization',
  props: {
    shapes: {
      type: Array,
      default: () => []
    },
    wallHeight: {
      type: Number,
      default: 200 // Default wall height in cm
    },
    wallThickness: {
      type: Number,
      default: 10 // Default wall thickness in cm
    }
  },
  emits: ['wall-selected', 'wall-hovered', 'wall-projected', 'opening-added'],
  
  setup(props, { emit }) {
    const container = ref(null)
    let scene, camera, renderer, controls
    let wallGroup
    let animationId
    const selectedWall = ref(null)

    const init = () => {
      // Scene setup
      scene = new THREE.Scene()
      scene.background = new THREE.Color(0xf5f5f5)

      // Camera setup
      const aspect = container.value.clientWidth / container.value.clientHeight
      camera = new THREE.PerspectiveCamera(75, aspect, 0.1, 10000)
      camera.position.set(500, 400, 500)

      // Renderer setup
      renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: true
      })
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
      renderer.setSize(container.value.clientWidth, container.value.clientHeight)
      renderer.shadowMap.enabled = true
      renderer.shadowMap.type = THREE.PCFSoftShadowMap
      renderer.outputColorSpace = THREE.SRGBColorSpace
      container.value.appendChild(renderer.domElement)

      // Simple orbit controls (manual implementation)
      setupControls()

      // Lighting
      setupLighting()
      setupWallInteraction()
      
      // Grid helper
      const gridHelper = new THREE.GridHelper(2000, 40, 0x888888, 0xcccccc)
      gridHelper.position.y = -1
      scene.add(gridHelper)

      // Initialize wall group
      wallGroup = new THREE.Group()
      scene.add(wallGroup)

      updateWalls()
      animate()
    }

    const setupControls = () => {
      let isMouseDown = false
      let mouseX = 0
      let mouseY = 0

      const onMouseDown = (event) => {
        isMouseDown = true
        mouseX = event.clientX
        mouseY = event.clientY
      }

      const onMouseUp = () => {
        isMouseDown = false
      }

      const onMouseMove = (event) => {
        if (!isMouseDown) return

        const deltaX = event.clientX - mouseX
        const deltaY = event.clientY - mouseY

        // Rotate camera around the scene
        const spherical = new THREE.Spherical()
        spherical.setFromVector3(camera.position)
        spherical.theta -= deltaX * 0.01
        spherical.phi += deltaY * 0.01
        spherical.phi = Math.max(0.1, Math.min(Math.PI - 0.1, spherical.phi))

        camera.position.setFromSpherical(spherical)
        camera.lookAt(0, 0, 0)

        mouseX = event.clientX
        mouseY = event.clientY
      }

      const onWheel = (event) => {
        const distance = camera.position.length()
        const newDistance = distance + event.deltaY * 0.5
        const clampedDistance = Math.max(100, Math.min(2000, newDistance))
        
        camera.position.normalize().multiplyScalar(clampedDistance)
      }

      container.value.addEventListener('mousedown', onMouseDown)
      window.addEventListener('mouseup', onMouseUp)
      window.addEventListener('mousemove', onMouseMove)
      container.value.addEventListener('wheel', onWheel)
    }

    const setupLighting = () => {
      // Ambient light
      const ambientLight = new THREE.AmbientLight(0xffffff, 0.6)
      scene.add(ambientLight)

      // Main directional light
      const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8)
      directionalLight.position.set(500, 800, 300)
      directionalLight.castShadow = true
      directionalLight.shadow.mapSize.width = 2048
      directionalLight.shadow.mapSize.height = 2048
      scene.add(directionalLight)

      // Secondary light for better illumination
      const secondaryLight = new THREE.DirectionalLight(0xffffff, 0.3)
      secondaryLight.position.set(-300, 400, -200)
      scene.add(secondaryLight)
    }

    const updateWalls = () => {
      // Clear existing walls
      wallGroup.clear()

      if (!props.shapes || props.shapes.length === 0) {
          console.log('No shapes to render')
          return
      }

      console.log('Rendering shapes:', props.shapes)
      props.shapes.forEach((shape, index) => {
          console.log(`Shape ${index}:`, shape)
          createShapeWalls(shape, index)
      })
    }

    const createShapeWalls = (shape, index) => {
      const { type, dimensions, position } = shape
      const offsetX = (position?.x || 0) * 2
      const offsetZ = (position?.y || 0) * 2

      // Material for walls - make them thinner and more wall-like
      const colors = [0x4CAF50, 0x2196F3, 0xFF9800, 0x9C27B0, 0xF44336]
      const material = new THREE.MeshStandardMaterial({
          color: colors[index % colors.length],
          roughness: 0.8,
          metalness: 0.1,
          transparent: true,
          opacity: 0.8
      })

      switch (type) {
          case 'rectangle':
          createRectangleOutline(dimensions, material, offsetX, offsetZ)
          break
          case 'square':
          createSquareOutline(dimensions, material, offsetX, offsetZ)
          break
          case 'triangle':
          createTriangleOutline(dimensions, material, offsetX, offsetZ)
          break
          case 'trapezoid':
          createTrapezoidOutline(dimensions, material, offsetX, offsetZ)
          break
      }
    }

    const createRectangleOutline = (dimensions, material, offsetX, offsetZ) => {
        const { length, width } = dimensions
        const scaledLength = length * 2
        const scaledWidth = width * 2
        const height = props.wallHeight
        const thickness = props.wallThickness

        // Create 4 thin walls for the rectangle perimeter
        const walls = [
            // Bottom wall (along length)
            { 
            pos: [offsetX + scaledLength/2, height/2, offsetZ], 
            size: [scaledLength + thickness, height, thickness],
            rotation: 0
            },
            // Top wall (along length)
            { 
            pos: [offsetX + scaledLength/2, height/2, offsetZ + scaledWidth], 
            size: [scaledLength + thickness, height, thickness],
            rotation: 0
            },
            // Left wall (along width)
            { 
            pos: [offsetX, height/2, offsetZ + scaledWidth/2], 
            size: [thickness, height, scaledWidth],
            rotation: 0
            },
            // Right wall (along width)
            { 
            pos: [offsetX + scaledLength, height/2, offsetZ + scaledWidth/2], 
            size: [thickness, height, scaledWidth],
            rotation: 0
            }
        ]

        walls.forEach(wall => {
            const geometry = new THREE.BoxGeometry(...wall.size)
            const mesh = new THREE.Mesh(geometry, material)
            mesh.position.set(...wall.pos)
            if (wall.rotation) mesh.rotation.y = wall.rotation
            mesh.castShadow = true
            mesh.receiveShadow = true
            wallGroup.add(mesh)
        })
    }

    const createSquareOutline = (dimensions, material, offsetX, offsetZ) => {
        const { side } = dimensions
        const scaledSide = side * 2
        const height = props.wallHeight
        const thickness = props.wallThickness

        // Create 4 thin walls for the square perimeter
        const walls = [
            // Bottom wall
            { pos: [offsetX + scaledSide/2, height/2, offsetZ], size: [scaledSide + thickness, height, thickness] },
            // Top wall
            { pos: [offsetX + scaledSide/2, height/2, offsetZ + scaledSide], size: [scaledSide + thickness, height, thickness] },
            // Left wall
            { pos: [offsetX, height/2, offsetZ + scaledSide/2], size: [thickness, height, scaledSide] },
            // Right wall
            { pos: [offsetX + scaledSide, height/2, offsetZ + scaledSide/2], size: [thickness, height, scaledSide] }
        ]

        walls.forEach(wall => {
            const geometry = new THREE.BoxGeometry(...wall.size)
            const mesh = new THREE.Mesh(geometry, material)
            mesh.position.set(...wall.pos)
            mesh.castShadow = true
            mesh.receiveShadow = true
            wallGroup.add(mesh)
        })
    }

    const createTriangleOutline = (dimensions, material, offsetX, offsetZ) => {
        const { a, b, c, rotation = 0 } = dimensions
        console.log('Triangle dimensions:', { a, b, c, rotation })

        const scale = 2
        const height = props.wallHeight
        const thickness = props.wallThickness

        // Calculate triangle vertices using the same method as your 2D canvas
        const vertices = calculateTriangleVertices(a, b, c, scale)
        console.log('Triangle vertices before rotation:', vertices)

        // Apply rotation around the triangle's centroid
        if (rotation !== 0) {
            const rotationRad = (rotation * Math.PI) / 180
            
            // Calculate centroid
            const centerX = (vertices[0].x + vertices[1].x + vertices[2].x) / 3
            const centerZ = (vertices[0].z + vertices[1].z + vertices[2].z) / 3
            
            vertices.forEach(vertex => {
                // Translate to origin (relative to centroid)
                const x = vertex.x - centerX
                const z = vertex.z - centerZ
                
                // Apply rotation
                vertex.x = x * Math.cos(rotationRad) - z * Math.sin(rotationRad) + centerX
                vertex.z = x * Math.sin(rotationRad) + z * Math.cos(rotationRad) + centerZ
            })
        }

        // Apply offset to match canvas position
        vertices.forEach(vertex => {
            vertex.x += offsetX
            vertex.z += offsetZ
        })

        console.log('Final triangle vertices:', vertices)

        // Create thin walls along the triangle edges
        for (let i = 0; i < 3; i++) {
            const start = vertices[i]
            const end = vertices[(i + 1) % 3]
            createThinWallBetweenPoints(start, end, material, height, thickness)
        }
    }

    const setupWallInteraction = () => {
        const raycaster = new THREE.Raycaster()
        const mouse = new THREE.Vector2()
        let isMouseDown = false
        let dragStartTime = 0
        let hasDragged = false

        const onMouseDown = (event) => {
            isMouseDown = true
            dragStartTime = Date.now()
            hasDragged = false
        }

        const onMouseUp = (event) => {
            const clickDuration = Date.now() - dragStartTime
            
            // Only process click if it wasn't a drag operation
            if (!hasDragged && clickDuration < 300) {
            handleWallClick(event)
            }
            
            isMouseDown = false
            hasDragged = false
        }

        const onMouseMove = (event) => {
            if (isMouseDown) {
            hasDragged = true
            return // Don't process hover during drag
            }

            handleWallHover(event)
        }

        const handleWallClick = (event) => {
            const rect = container.value.getBoundingClientRect()
            mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1
            mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1

            raycaster.setFromCamera(mouse, camera)
            const intersects = raycaster.intersectObjects(wallGroup.children)
            
            console.log('Click detected, intersects:', intersects.length)
            
            if (intersects.length > 0) {
            const selectedWallMesh = intersects[0].object
            console.log('Wall clicked:', selectedWallMesh)
            
            // Highlight selected wall
            highlightSelectedWall(selectedWallMesh)
            
            emit('wall-selected', {
                mesh: selectedWallMesh,
                intersection: intersects[0]
            })
            } else {
            // Clear selection if clicking empty space
            clearWallHighlight()
            emit('wall-selected', null)
            }
        }

        const handleWallHover = (event) => {
            const rect = container.value.getBoundingClientRect()
            mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1
            mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1

            raycaster.setFromCamera(mouse, camera)
            const intersects = raycaster.intersectObjects(wallGroup.children)
            
            // Reset hover effects for all walls
            wallGroup.children.forEach(wall => {
            if (wall.userData.hoverMaterial && !wall.userData.isSelected) {
                wall.material = wall.userData.originalMaterial || wall.material
            }
            })

            if (intersects.length > 0) {
            const hoveredWallMesh = intersects[0].object
            
            // Don't change material if wall is selected
            if (!hoveredWallMesh.userData.isSelected) {
                // Store original material
                if (!hoveredWallMesh.userData.originalMaterial) {
                hoveredWallMesh.userData.originalMaterial = hoveredWallMesh.material
                }
                
                // Create hover material
                const hoverMaterial = hoveredWallMesh.userData.originalMaterial.clone()
                hoverMaterial.color.multiplyScalar(1.2)
                hoverMaterial.emissive.setHex(0x111111)
                
                hoveredWallMesh.material = hoverMaterial
                hoveredWallMesh.userData.hoverMaterial = hoverMaterial
            }
            
            // Change cursor to pointer
            container.value.style.cursor = 'pointer'
            
            emit('wall-hovered', {
                mesh: hoveredWallMesh,
                intersection: intersects[0]
            })
            } else {
            container.value.style.cursor = 'default'
            emit('wall-hovered', null)
            }
        }

        const highlightSelectedWall = (wallMesh) => {
            // Clear previous selection
            clearWallHighlight()
            
            // Store original material
            if (!wallMesh.userData.originalMaterial) {
            wallMesh.userData.originalMaterial = wallMesh.material
            }
            
            // Create selection material
            const selectedMaterial = wallMesh.userData.originalMaterial.clone()
            selectedMaterial.color.setHex(0xff6b35) // Orange selection color
            selectedMaterial.emissive.setHex(0x332211)
            
            wallMesh.material = selectedMaterial
            wallMesh.userData.isSelected = true
            wallMesh.userData.selectedMaterial = selectedMaterial
        }

        const clearWallHighlight = () => {
            wallGroup.children.forEach(wall => {
            if (wall.userData.isSelected) {
                wall.material = wall.userData.originalMaterial || wall.material
                wall.userData.isSelected = false
            }
            })
        }

        // Add event listeners
        container.value.addEventListener('mousedown', onMouseDown)
        container.value.addEventListener('mouseup', onMouseUp)
        container.value.addEventListener('mousemove', onMouseMove)
        
        // Prevent context menu on right click
        container.value.addEventListener('contextmenu', (e) => e.preventDefault())
    }

    const createTrapezoidOutline = (dimensions, material, offsetX, offsetZ) => {
        const { a, b, height: trapHeight } = dimensions
        const scale = 2
        const wallHeight = props.wallHeight
        const thickness = props.wallThickness

        // Calculate trapezoid vertices
        const vertices = [
            { x: 0, z: 0 },                                    // Bottom left
            { x: a * scale, z: 0 },                           // Bottom right
            { x: (a - b) * scale / 2 + b * scale, z: trapHeight * scale }, // Top right
            { x: (a - b) * scale / 2, z: trapHeight * scale }              // Top left
        ]

        // Offset vertices
        vertices.forEach(vertex => {
            vertex.x += offsetX
            vertex.z += offsetZ
        })

        // Create thin walls along the trapezoid edges
        for (let i = 0; i < 4; i++) {
            const start = vertices[i]
            const end = vertices[(i + 1) % 4]
            createThinWallBetweenPoints(start, end, material, wallHeight, thickness)
        }
    }

    const createThinWallBetweenPoints = (start, end, material, height, thickness, openings = []) => {
        const dx = end.x - start.x
        const dz = end.z - start.z
        const length = Math.sqrt(dx * dx + dz * dz)
        
        if (length < 0.01) return
        
        const angle = Math.atan2(dz, dx)
        const midX = (start.x + end.x) / 2
        const midZ = (start.z + end.z) / 2

        if (openings.length === 0) {
            // Create solid wall
            const geometry = new THREE.BoxGeometry(length, height, thickness)
            const mesh = new THREE.Mesh(geometry, material)
            mesh.position.set(midX, height / 2, midZ)
            mesh.rotation.y = angle
            mesh.castShadow = true
            mesh.receiveShadow = true
            mesh.userData.wallData = { start, end, length, angle }
            wallGroup.add(mesh)
        } else {
            // Create wall with openings
            createWallWithOpenings(start, end, height, thickness, material, openings, angle)
        }
    }

    const createWallWithOpenings = (start, end, height, thickness, material, openings, angle, wallData) => {
        const dx = end.x - start.x
        const dz = end.z - start.z
        const totalLength = Math.sqrt(dx * dx + dz * dz)
        
        console.log('Creating wall with openings:', {
            totalLength,
            openings,
            wallData: wallData.id
        })
        
        // Convert opening positions from cm to scene units and validate
        const processedOpenings = openings.map(opening => {
            // Convert cm to scene units: cm -> meters -> scene units
            const positionSceneUnits = (opening.position / 100) * 2
            const widthSceneUnits = (opening.width / 100) * 2
            const heightSceneUnits = (opening.height / 100) * 2
            
            // Clamp position and width to wall bounds
            const clampedPosition = Math.max(0, Math.min(positionSceneUnits, totalLength - widthSceneUnits))
            const clampedWidth = Math.min(widthSceneUnits, totalLength - clampedPosition)
            
            return {
                ...opening,
                position: clampedPosition,
                width: Math.max(0.1, clampedWidth), // Minimum width to ensure opening is visible
                height: Math.min(heightSceneUnits, height * 0.9) // Max 90% of wall height
            }
        }).filter(opening => opening.width > 0.05) // Remove tiny openings
        
        // Sort openings by position
        const sortedOpenings = [...processedOpenings].sort((a, b) => a.position - b.position)
        
        console.log('Processed openings:', sortedOpenings)
        
        let currentPos = 0
        const meshes = []
        
        sortedOpenings.forEach((opening, index) => {
            const { position, width, height: openingHeight } = opening
            
            console.log(`Processing opening ${index}:`, {
                position,
                width,
                height: openingHeight,
                currentPos,
                totalLength
            })
            
            // Create wall segment before opening
            if (position > currentPos) {
                const segmentLength = position - currentPos
                if (segmentLength > 0.01) { // Only create if segment is meaningful
                    const segmentMidPos = currentPos + segmentLength / 2
                    
                    const segmentX = start.x + (dx * segmentMidPos / totalLength)
                    const segmentZ = start.z + (dz * segmentMidPos / totalLength)
                    
                    const geometry = new THREE.BoxGeometry(segmentLength, height, thickness)
                    const mesh = new THREE.Mesh(geometry, material)
                    mesh.position.set(segmentX, height / 2, segmentZ)
                    mesh.rotation.y = angle
                    mesh.castShadow = true
                    mesh.receiveShadow = true
                    mesh.userData.wallData = wallData
                    mesh.userData.wallId = wallData.id
                    mesh.userData.isSegment = true
                    wallGroup.add(mesh)
                    meshes.push(mesh)
                    
                    console.log(`Created wall segment: length=${segmentLength.toFixed(2)}, pos=(${segmentX.toFixed(1)}, ${segmentZ.toFixed(1)})`)
                }
            }
            
            // Create lintel (header) above opening if opening doesn't reach ceiling
            if (openingHeight < height) {
                const lintelHeight = height - openingHeight
                const lintelY = openingHeight + lintelHeight / 2
                
                const openingMidPos = position + width / 2
                const lintelX = start.x + (dx * openingMidPos / totalLength)
                const lintelZ = start.z + (dz * openingMidPos / totalLength)
                
                const lintelGeometry = new THREE.BoxGeometry(width, lintelHeight, thickness)
                const lintelMesh = new THREE.Mesh(lintelGeometry, material)
                lintelMesh.position.set(lintelX, lintelY, lintelZ)
                lintelMesh.rotation.y = angle
                lintelMesh.castShadow = true
                lintelMesh.receiveShadow = true
                lintelMesh.userData.wallData = wallData
                lintelMesh.userData.wallId = wallData.id
                lintelMesh.userData.isLintel = true
                lintelMesh.userData.openingType = opening.type
                wallGroup.add(lintelMesh)
                meshes.push(lintelMesh)
                
                console.log(`Created lintel: width=${width.toFixed(2)}, height=${lintelHeight.toFixed(2)}, pos=(${lintelX.toFixed(1)}, ${lintelY.toFixed(1)}, ${lintelZ.toFixed(1)})`)
            }
            
            // Add visual indicator for the opening (optional - helps debugging)
            if (process.env.NODE_ENV === 'development') {
                const openingMidPos = position + width / 2
                const indicatorX = start.x + (dx * openingMidPos / totalLength)
                const indicatorZ = start.z + (dz * openingMidPos / totalLength)
                
                const indicatorGeometry = new THREE.BoxGeometry(width * 0.95, openingHeight * 0.95, thickness * 0.1)
                const indicatorMaterial = new THREE.MeshBasicMaterial({ 
                    color: opening.type === 'door' ? 0x8B4513 : 0x87CEEB, 
                    transparent: true, 
                    opacity: 0.3 
                })
                const indicatorMesh = new THREE.Mesh(indicatorGeometry, indicatorMaterial)
                indicatorMesh.position.set(indicatorX, openingHeight / 2, indicatorZ)
                indicatorMesh.rotation.y = angle
                indicatorMesh.userData.isOpeningIndicator = true
                wallGroup.add(indicatorMesh)
                meshes.push(indicatorMesh)
            }
            
            currentPos = position + width
        })
        
        // Create final wall segment after last opening
        if (currentPos < totalLength) {
            const segmentLength = totalLength - currentPos
            if (segmentLength > 0.01) {
                const segmentMidPos = currentPos + segmentLength / 2
                
                const segmentX = start.x + (dx * segmentMidPos / totalLength)
                const segmentZ = start.z + (dz * segmentMidPos / totalLength)
                
                const geometry = new THREE.BoxGeometry(segmentLength, height, thickness)
                const mesh = new THREE.Mesh(geometry, material)
                mesh.position.set(segmentX, height / 2, segmentZ)
                mesh.rotation.y = angle
                mesh.castShadow = true
                mesh.receiveShadow = true
                mesh.userData.wallData = wallData
                mesh.userData.wallId = wallData.id
                mesh.userData.isSegment = true
                wallGroup.add(mesh)
                meshes.push(mesh)
                
                console.log(`Created final segment: length=${segmentLength.toFixed(2)}, pos=(${segmentX.toFixed(1)}, ${segmentZ.toFixed(1)})`)
            }
        }
        
        console.log(`Wall with openings complete. Created ${meshes.length} meshes.`)
        return meshes
    }

    const calculateTriangleVertices = (a, b, c, scale) => {
      // Validate triangle inequality
      if (a + b <= c || a + c <= b || b + c <= a) {
          console.warn('Invalid triangle sides:', a, b, c)
          return [
              { x: 0, z: 0 },
              { x: 50 * scale, z: 0 },
              { x: 25 * scale, z: 43.3 * scale }
          ]
      }

      // Calculate vertex positions to match 2D canvas
      const v1 = { x: 0, z: 0 }
      const v2 = { x: c * scale, z: 0 }
      
      // Calculate third vertex position using law of cosines
      const cosA = (b * b + c * c - a * a) / (2 * b * c)
      const angleA = Math.acos(cosA)
      
      const v3 = {
          x: b * scale * Math.cos(angleA),
          z: b * scale * Math.sin(angleA)
      }

      return [v1, v2, v3]
    }

    const handleWallSelection = (wallData) => {
      selectedWall.value = wallData
      // Project wall onto 2D canvas for opening placement
      projectWallTo2D(wallData)
    }

    const projectWallTo2D = (wallData) => {
      const { mesh, intersection } = wallData
      const wallUserData = mesh.userData.wallData
      
      if (!wallUserData) return
      
      // Calculate 2D representation of the wall
      const wall2D = {
          start: { x: wallUserData.start.x, y: wallUserData.start.z },
          end: { x: wallUserData.end.x, y: wallUserData.end.z },
          length: wallUserData.length,
          angle: wallUserData.angle
      }
      
      // Update 2D canvas to show wall outline
      emit('wall-projected', wall2D)
    }

    const addOpeningToWall = (openingType, position, dimensions) => {
      if (!selectedWall.value) return
      
      const opening = {
          type: openingType, // 'window' or 'door'
          position: position, // Position along wall (0 to wall length)
          width: dimensions.width,
          height: dimensions.height,
          id: Date.now() // Simple ID generation
      }
      
      // Add opening to the selected wall's data
      if (!selectedWall.value.mesh.userData.openings) {
          selectedWall.value.mesh.userData.openings = []
      }
      
      selectedWall.value.mesh.userData.openings.push(opening)
      
      // Regenerate the wall with openings
      regenerateWallWithOpenings(selectedWall.value.mesh)
      
      // Update the shapes data to include openings
      emit('opening-added', {
          wallId: selectedWall.value.mesh.id,
          opening: opening
      })
    }

    const regenerateWallWithOpenings = (wallMesh) => {
      const userData = wallMesh.userData
      if (!userData.wallData) return
      
      // Remove the old wall mesh
      wallGroup.remove(wallMesh)
      
      // Create new wall with openings
      const { start, end } = userData.wallData
      const openings = userData.openings || []
      
      createThinWallBetweenPoints(
          start, 
          end, 
          wallMesh.material, 
          props.wallHeight, 
          props.wallThickness, 
          openings
      )
    }

    const animate = () => {
      animationId = requestAnimationFrame(animate)
      renderer.render(scene, camera)
    }

    const handleResize = () => {
      if (container.value && camera && renderer) {
        const width = container.value.clientWidth
        const height = container.value.clientHeight
        
        camera.aspect = width / height
        camera.updateProjectionMatrix()
        renderer.setSize(width, height)
      }
    }

    // Lifecycle hooks
    onMounted(() => {
      init()
      window.addEventListener('resize', handleResize)
    })

    onBeforeUnmount(() => {
      window.removeEventListener('resize', handleResize)
      if (animationId) {
        cancelAnimationFrame(animationId)
      }
      if (renderer) {
        renderer.dispose()
      }
    })

    // Watch for prop changes
    watch(() => props.shapes, () => {
      if (scene) updateWalls()
    }, { deep: true })

    watch([() => props.wallHeight, () => props.wallThickness], () => {
      if (scene) updateWalls()
    })

    // Expose methods that might be called from parent
    return { 
      container,
      handleWallSelection,
      addOpeningToWall,
      selectedWall,
      wallGroup
    }
  }
}
</script>

<style scoped>
.visualization-container {
  width: 100%;
  height: 400px;
  border-radius: 12px;
  overflow: hidden;
  border: 2px solid #e5e7eb;
  background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.visualization-container canvas {
  border-radius: 10px;
}
</style>