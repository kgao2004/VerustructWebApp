<template>
  <div class="build-container">
    <!-- Sidebar -->
    <div class="sidebar">
      
      <h2>Select a Shape</h2>
      <button class="shape-btn" @click="toggleForm('rectangle')">Rectangle</button>
      <button class="shape-btn" @click="toggleForm('square')">Square</button>
      <button class="shape-btn" @click="toggleForm('triangle')">Triangle</button>
      <!-- this is for the roation buttons -->

      


      <div v-if="selectedCanvasShape" class="delete-section">
        <button class="control-btn delete-btn" @click="deleteSelectedShape">
          🗑️ Delete Selected Shape
        </button>
      </div>

      <button class="shape-btn" @click="toggleForm('trapezoid')">Trapezoid</button>
      <button class="add-shape-btn" @click="submit">Add Shape to Canvas</button>
      
      <!-- Shape Controls -->
      <div v-if="selectedCanvasShape" class="shape-controls">
      
        <!-- Shape Info Display -->
        <!-- Shape Info Display with Editable Inputs -->
        <div class="shape-info">
          <!-- Rotation controls for selected triangle on canvas -->
          <div v-if="selectedCanvasShape && selectedCanvasShape.type === 'triangle'" class="selected-triangle-rotation">
            <h4>Triangle Rotation</h4>
            <div class="rotation-control-group">
              <div class="input-group">
                <label>Rotation Step (°)</label>
                <input type="number" v-model="rotationStep" min="1" max="180" class="rotation-input" />
              </div>
              
              <!-- ADD LIVE ROTATION DISPLAY HERE TOO -->
              <div class="input-group">
                <label>Current Angle (°)</label>
                <input type="number" :value="Math.round(selectedCanvasShape.dimensions.rotation || 0)" disabled class="rotation-display" />
              </div>
              
              <div class="rotation-buttons">
                <button class="control-btn rotate-btn" @click="rotateSelectedTriangle">
                  🔄 Rotate {{ rotationStep }}°
                </button>
                <button class="control-btn rotate-btn" @click="rotateSelectedTriangleCounterClockwise">
                  🔄 Rotate -{{ rotationStep }}°
                </button>
                <button class="control-btn reset-btn" @click="resetSelectedTriangleRotation">
                  ↺ Reset Rotation
                </button>
              </div>
            </div>
          </div>


          <h4>Edit {{ selectedCanvasShape.type.charAt(0).toUpperCase() + selectedCanvasShape.type.slice(1) }}</h4>
          
          <!-- Rectangle Edit -->
          <div v-if="selectedCanvasShape.type === 'rectangle'" class="edit-grid">
            <div class="input-group">
              <label>Length:</label>
              <input type="number" v-model="selectedCanvasShape.dimensions.length" @input="updateCanvas" />
            </div>
            <div class="input-group">
              <label>Width:</label>
              <input type="number" v-model="selectedCanvasShape.dimensions.width" @input="updateCanvas" />
            </div>
            <div class="info-item area-item">
              <label>Area:</label>
              <span>{{ calculateArea(selectedCanvasShape) }} ft²</span>
            </div>
          </div>
          
          <!-- Square Edit -->
          <div v-if="selectedCanvasShape.type === 'square'" class="edit-grid">
            <div class="input-group">
              <label>Side:</label>
              <input type="number" v-model="selectedCanvasShape.dimensions.side" @input="updateCanvas" />
            </div>
            <div class="info-item area-item">
              <label>Area:</label>
              <span>{{ calculateArea(selectedCanvasShape) }} ft²</span>
            </div>
          </div>
          
          <!-- Triangle Edit -->
          <div v-if="selectedCanvasShape.type === 'triangle'" class="edit-grid">
            <div class="input-group">
              <label>Side A:</label>
              <input type="number" v-model="selectedCanvasShape.dimensions.a" @input="updateCanvas" />
            </div>
            <div class="input-group">
              <label>Side B:</label>
              <input type="number" v-model="selectedCanvasShape.dimensions.b" @input="updateCanvas" />
            </div>
            <div class="input-group">
              <label>Side C:</label>
              <input type="number" v-model="selectedCanvasShape.dimensions.c" @input="updateCanvas" />
            </div>
            <div class="info-item area-item">
              <label>Area:</label>
              <span>{{ calculateArea(selectedCanvasShape) }} ft²</span>
            </div>
          </div>
          
          <!-- Trapezoid Edit -->
          <div v-if="selectedCanvasShape.type === 'trapezoid'" class="edit-grid">
            <div class="input-group">
              <label>Base 1:</label>
              <input type="number" v-model="selectedCanvasShape.dimensions.a" @input="updateCanvas" />
            </div>
            <div class="input-group">
              <label>Base 2:</label>
              <input type="number" v-model="selectedCanvasShape.dimensions.b" @input="updateCanvas" />
            </div>
            <div class="input-group">
              <label>Height:</label>
              <input type="number" v-model="selectedCanvasShape.dimensions.height" @input="updateCanvas" />
            </div>
            <div class="info-item area-item">
              <label>Area:</label>
              <span>{{ calculateArea(selectedCanvasShape) }} ft²</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 3D View and Animated Inputs -->
    <div class="main-content">

      <h1 class="title">Verustruct Wall Calculator</h1>

      <!-- First attempt of 3d visualizatio -->
      <!-- 3D Visualization Toggle -->
        <div class="visualization-section">
          <div class="visualization-header">
            <h3>3D Wall Visualization</h3>
            <button 
              class="toggle-3d-btn" 
              @click="toggle3DView"
              :class="{ active: show3DView }"
            >
              {{ show3DView ? 'Hide 3D View' : 'Show 3D View' }}
            </button>
          </div>
          
          <!-- 3D Visualization Component -->
          <div v-if="show3DView" class="visualization-container">
            <WallVisualization 
              ref="wallVisualizationRef"
              :shapes="canvasShapes" 
              :wallHeight="200" 
              :wallThickness="20"
              @wall-selected="handleWallSelected"
              @wall-hovered="handleWallHovered"
              @opening-added="(data) => console.log('Opening added:', data)"
            />
          </div>
        </div>
      <!--  -->


      <!-- <div class="visualization-placeholder">3D View Goes Here</div> -->

      <!-- Canvas Section -->
      <div class="flex gap-4">
          <div>
              <ShapeCanvas 
                ref="canvasRef" 
                :shape="selectedShape" 
                :dimensions="getCurrentDimensions()" 
                @shape-selected="handleShapeSelection"
                @shape-deleted="handleShapeDeleted"
                @triangle-rotated="handleTriangleRotated"
              />
          </div>
      </div>
      
      <!-- Rectangle Form -->
      <AnimatePresence :initial="false">
        <motion.div
          v-if="selectedShape === 'rectangle' && showForm"
          :initial="{ opacity: 0, y: 20 }"
          :animate="{ opacity: 1, y: 0 }"
          :exit="{ opacity: 0, y: 20 }"
          class="form-container"
        >
          <div class="input-group">
            <label>Length (ft)</label>
            <input type="number" v-model="rectangle.length" />
          </div>
          <div class="input-group">
            <label>Width (ft)</label>
            <input type="number" v-model="rectangle.width" />
          </div>
          <div class="input-group">
            <label>Height (ft)</label>
            <input type="number" v-model="rectangle.height" />
          </div>
        </motion.div>

        <!-- Square Form -->
        <motion.div
          v-if="selectedShape === 'square' && showForm"
          :initial="{ opacity: 0, y: 20 }"
          :animate="{ opacity: 1, y: 0 }"
          :exit="{ opacity: 0, y: 20 }"
          class="form-container"
        >
          <div class="input-group">
            <label>Side Length (ft)</label>
            <input type="number" v-model="square.side" />
          </div>
          <div class="input-group">
            <label>Height (ft)</label>
            <input type="number" v-model="square.height" />
          </div>
        </motion.div>

        <!-- Triangle Form -->
        <motion.div
          v-if="selectedShape === 'triangle' && showForm"
          :initial="{ opacity: 0, y: 20 }"
          :animate="{ opacity: 1, y: 0 }"
          :exit="{ opacity: 0, y: 20 }"
          class="form-container"
          >
          <div class="input-group">
              <label>Side a</label>
              <input type="number" v-model="triangle.a" />
          </div>
          <div class="input-group">
              <label>Side b</label>
              <input type="number" v-model="triangle.b" />
          </div>
          <div class="input-group">
              <label>Side c</label>
              <input type="number" v-model="triangle.c" />
          </div>

          <div class="input-group">
              <label>Angle A (°)</label>
              <input type="number" :value="triangle.A" disabled />
          </div>
          <div class="input-group">
              <label>Angle B (°)</label>
              <input type="number" :value="triangle.B" disabled />
          </div>
          <div class="input-group">
              <label>Angle C (°)</label>
              <input type="number" :value="triangle.C" disabled />
          </div>

          <div class="input-group">
              <label>Height</label>
              <input type="number" v-model="triangle.height" />
          </div>

          <p v-if="triangle.error" style="color: red; font-weight: bold;">{{ triangle.error }}</p>
        </motion.div>

        <!-- Trapezoid Form -->
        <motion.div
          v-if="selectedShape === 'trapezoid' && showForm"
          :initial="{ opacity: 0, y: 20 }"
          :animate="{ opacity: 1, y: 0 }"
          :exit="{ opacity: 0, y: 20 }"
          class="form-container"
        >
          <div class="input-group">
            <label>Base 1 (ft)</label>
            <input type="number" v-model="trapezoid.base1" />
          </div>
          <div class="input-group">
            <label>Base 2 (ft)</label>
            <input type="number" v-model="trapezoid.base2" />
          </div>
          <div class="input-group">
            <label>Angle 1 (°)</label>
            <input type="number" v-model="trapezoid.angle1" />
          </div>
          <div class="input-group">
            <label>Angle 2 (°)</label>
            <input type="number" v-model="trapezoid.angle2" />
          </div>
          <div class="input-group">
            <label>Height (ft)</label>
            <input type="number" v-model="trapezoid.height" />
          </div>
        </motion.div>
      </AnimatePresence>

      <!-- REPLACE the window-door-panel div in BuildHome.vue template -->
      <div v-if="showWindowDoorPanel" class="window-door-panel">
        <div class="panel-header">
          <h3>Add Opening to Wall</h3>
          <div class="wall-info">
            <span>Wall Length: {{ wallLengthDisplay }} cm</span>
          </div>
          <button @click="closePanel" class="close-btn">×</button>
        </div>
        
        <div class="opening-type-selector">
          <button 
            @click="setOpeningType('window')" 
            :class="{ active: windowDoorMode === 'window' }"
            class="type-btn"
          >
            🪟 Window
          </button>
          <button 
            @click="setOpeningType('door')" 
            :class="{ active: windowDoorMode === 'door' }"
            class="type-btn"
          >
            🚪 Door
          </button>
        </div>
        
        <div v-if="windowDoorMode" class="dimensions-panel">
          <h4>{{ windowDoorMode === 'window' ? 'Window' : 'Door' }} Dimensions</h4>
          
          <div class="input-group">
            <label>Width (cm)</label>
            <input 
              type="number" 
              v-model="currentDimensions.width"
              min="20"
              :max="Math.min(300, wallLengthDisplay * 0.8)"
              step="5"
            />
            <small>Max: {{ Math.round(wallLengthDisplay * 0.8) }} cm</small>
          </div>
          
          <div class="input-group">
            <label>Height (cm)</label>
            <input 
              type="number" 
              v-model="currentDimensions.height"
              min="30"
              :max="windowDoorMode === 'door' ? 250 : 200"
              step="5"
            />
          </div>
          
          <div class="input-group">
            <label>Position from wall start (cm)</label>
            <input 
              type="range"
              v-model="openingPosition"
              min="0"
              :max="maxPosition"
              step="5"
              class="position-slider"
            />
            <input 
              type="number" 
              v-model="openingPosition"
              min="0"
              :max="maxPosition"
              step="5"
              class="position-input"
            />
            <small>Range: 0 - {{ maxPosition }} cm</small>
          </div>
          
          <!-- Preview section -->
          <div class="opening-preview">
            <div class="preview-wall">
              <div 
                class="preview-opening"
                :style="{
                  left: `${(openingPosition / wallLengthDisplay) * 100}%`,
                  width: `${(currentDimensions.width / wallLengthDisplay) * 100}%`
                }"
              ></div>
            </div>
            <div class="preview-labels">
              <span class="start-label">Start</span>
              <span class="end-label">End</span>
            </div>
          </div>
          
          <button 
            @click="addOpening" 
            class="add-opening-btn"
            :disabled="openingPosition + currentDimensions.width > wallLengthDisplay"
          >
            Add {{ windowDoorMode === 'window' ? 'Window' : 'Door' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, computed } from 'vue'
import ShapeCanvas from '../views/ShapeCanvas.vue'
import WallVisualization from '../components/WallVisualization_1.0.vue'


// Add these reactive variables with your other refs
const show3DView = ref(false)
const canvasShapes = ref([])

/////////////////////////////  New window and door////////////////////

// Add to your existing data/reactive variables:
const selectedWall = ref(null)
const hoveredWall = ref(null)
const showWindowDoorPanel = ref(false)
const windowDoorMode = ref(null) // 'window' or 'door'
const openingPosition = ref(0)
const wallVisualizationRef = ref(null)

// Window/Door dimensions
const windowDimensions = ref({
  width: 60,  // cm
  height: 120, // cm
})

const doorDimensions = ref({
  width: 80,  // cm  
  height: 200, // cm
})



////////// this for window and door registration///////////


const currentDimensions = computed(() => {
  return windowDoorMode.value === 'window' ? windowDimensions.value : doorDimensions.value
})

const maxPosition = computed(() => {
  if (!selectedWall.value || !selectedWall.value.data) return 0
  
  // Convert wall length from scene units back to cm for position input
  const wallLengthCm = (selectedWall.value.data.length / 2) * 100
  const openingWidthCm = currentDimensions.value.width
  
  return Math.max(0, wallLengthCm - openingWidthCm)
})


// ADD this computed property in BuildHome.vue
const wallLengthDisplay = computed(() => {
  if (!selectedWall.value || !selectedWall.value.data) return '0'
  
  const wallLengthCm = (selectedWall.value.data.length / 2) * 100
  return Math.round(wallLengthCm)
})

const setOpeningType = (type) => {
  windowDoorMode.value = type
}

const closePanel = () => {
  showWindowDoorPanel.value = false
  selectedWall.value = null
  windowDoorMode.value = null
}

const addOpening = () => {
  console.log('Add opening called:', {
    windowDoorMode: windowDoorMode.value,
    selectedWall: selectedWall.value,
    position: openingPosition.value,
    dimensions: currentDimensions.value
  })
  
  if (!windowDoorMode.value || !selectedWall.value) {
    console.warn('Missing required data for adding opening')
    return
  }
  
  // Call the WallVisualization component method directly
  if (wallVisualizationRef.value && wallVisualizationRef.value.addOpeningToWall) {
    wallVisualizationRef.value.addOpeningToWall(
      windowDoorMode.value,
      openingPosition.value,
      currentDimensions.value
    )
    console.log('Opening added successfully')
  } else {
    console.error('WallVisualization component not available')
  }
  
  closePanel()
}


//////////////////////////////////// this is for windows and door implementation

const handleWallSelected = (wallData) => {
  console.log('Wall selected in BuildHome:', wallData)
  selectedWall.value = wallData
  showWindowDoorPanel.value = true
  
  // Reset opening position when selecting a new wall
  openingPosition.value = 0
}

const handleWallHovered = (wallData) => {
  hoveredWall.value = wallData
  if (wallData) {
    console.log('Wall hovered:', wallData)
  }
}

// Fix the addOpeningToWall function
const addOpeningToWall = (openingType, position, dimensions) => {
  console.log('Adding opening:', { openingType, position, dimensions })
  
  if (!selectedWall.value) {
    console.warn('No wall selected')
    return
  }
  
  // Get the WallVisualization component reference
  const wallVisualizationRef = document.querySelector('.visualization-container')
  if (wallVisualizationRef && wallVisualizationRef.__vueParentComponent) {
    const wallComponent = wallVisualizationRef.__vueParentComponent.refs.wallVisualization
    if (wallComponent && wallComponent.addOpeningToWall) {
      wallComponent.addOpeningToWall(openingType, position, dimensions)
    }
  }
}


/////////////////////////////////////////////

const selectedShape = ref('')
const showForm = ref(false)
const canvasRef = ref(null)
const selectedCanvasShape = ref(null)
const rotationStep = ref(90)
const currentRotation = ref(0)

// Form data - these are used for the input forms only
const rectangle = ref({ length: 100, width: 50, height: 0 })
const square = ref({ side: 80, height: 0 })

// Triangle with validation
const triangle = ref({
  a: 100,
  b: 100,
  c: 100,
  A: 60,
  B: 60,
  C: 60,
  height: 80,
  rotation: 0,  // Add this line
  error: ''
})

const trapezoid = ref({ base1: 100, base2: 60, angle1: 70, angle2: 110, height: 0 })

// Triangle validation functions
function isValidTriangle(a, b, c) {
  return a + b > c && a + c > b && b + c > a
}

function computeAngles(a, b, c) {
  const angleA = radToDeg(Math.acos((b ** 2 + c ** 2 - a ** 2) / (2 * b * c)))
  const angleB = radToDeg(Math.acos((a ** 2 + c ** 2 - b ** 2) / (2 * a * c)))
  const angleC = 180 - angleA - angleB
  return { A: angleA, B: angleB, C: angleC }
}

function degToRad(deg) {
  return (deg * Math.PI) / 180
}

function radToDeg(rad) {
  return (rad * 180) / Math.PI
}

///////////////////////////////////// 3D Vizualization Code ///////////////////////////////////////////////////////////
// Add this function with your other functions
function toggle3DView() {
  show3DView.value = !show3DView.value
  if (show3DView.value) {
    // Get shapes from canvas when showing 3D view
    updateCanvasShapes()
  }
}

function updateCanvasShapes() {
  if (canvasRef.value) {
    canvasShapes.value = canvasRef.value.getAllShapes?.() || []
  }
}

// Watch for canvas changes to update 3D view
watch(() => selectedCanvasShape.value, () => {
  if (show3DView.value) {
    updateCanvasShapes()
  }
})

////////////////////////////////////////////////////////////////////////////////////////////////



// Watch triangle changes for validation
watch([() => triangle.value.a, () => triangle.value.b, () => triangle.value.c], () => {
  const { a, b, c } = triangle.value

  if (!isValidTriangle(a, b, c)) {
      triangle.value.error = 'Invalid triangle: sum of any two sides must be greater than the third.'
      triangle.value.A = triangle.value.B = triangle.value.C = 0
      return
  }

  triangle.value.error = ''
  const angles = computeAngles(a, b, c)
  triangle.value.A = Math.round(angles.A)
  triangle.value.B = Math.round(angles.B)
  triangle.value.C = Math.round(angles.C)
}, { immediate: true })

function toggleForm(shape) {
  if (selectedShape.value === shape && showForm.value) {
      showForm.value = false
      selectedShape.value = ''
  } else {
      selectedShape.value = shape
      showForm.value = true
  }
}


const handleTriangleRotated = (data) => {
  // Update the rotation step in UI to match what was actually rotated
  if (data.rotationStep > 0) {
    rotationStep.value = data.rotationStep
  }
  
  // Update current rotation display
  currentRotation.value = data.rotation
  
  console.log(`Triangle rotated to ${data.rotation}° with step ${data.rotationStep}°`)
}

// FIXED: Create independent copies of dimensions
const getCurrentDimensions = () => {
  if (selectedShape.value === 'rectangle') {
      // Create a new object with copied values
      return {
          length: rectangle.value.length,
          width: rectangle.value.width,
          height: rectangle.value.height
      }
  }
  
  if (selectedShape.value === 'square') {
      return {
          side: square.value.side,
          height: square.value.height
      }
  }
  
  if (selectedShape.value === 'triangle') {
    return {
        a: triangle.value.a,
        b: triangle.value.b,
        c: triangle.value.c,
        A: triangle.value.A,
        B: triangle.value.B,
        C: triangle.value.C,
        height: triangle.value.height,
        rotation: triangle.value.rotation,  // Add this line
        error: triangle.value.error
    }
  } 
  
  if (selectedShape.value === 'trapezoid') {
      return {
          a: trapezoid.value.base1,
          b: trapezoid.value.base2,
          height: trapezoid.value.height,
          angle1: trapezoid.value.angle1,
          angle2: trapezoid.value.angle2
      }
  }
  
  return {}
}

// Submit function to add shape to canvas
function submit() {
  const dimensions = getCurrentDimensions()
  const shape = selectedShape.value

  if (!shape || !dimensions || Object.keys(dimensions).length === 0) {
      console.warn("No shape or dimensions selected")
      return
  }

  // Validate triangle before adding
  if (shape === 'triangle' && dimensions.error) {
      alert('Cannot add invalid triangle to canvas')
      return
  }

  console.log('Adding shape:', shape, 'with dimensions:', dimensions)
  canvasRef.value?.addShapeFromSidebar(shape.toLowerCase(), dimensions)
}

// Handle shape selection from canvas
function handleShapeSelection(shape) {
  selectedCanvasShape.value = shape
  
  // Hide the form when selecting a canvas shape to focus on editing
  if (shape) {
    showForm.value = false
    selectedShape.value = ''
  }
  
  console.log('Shape selected:', shape)
}

// Handle shape deletion
function handleShapeDeleted() {
  selectedCanvasShape.value = null
}

// Control functions
// Replace the existing rotateShape function with these:
function rotateShape() {
  if (selectedCanvasShape.value && selectedCanvasShape.value.type === 'triangle') {
    canvasRef.value?.rotateTriangleByAngle(selectedCanvasShape.value.id, rotationStep.value)
  }
}

function rotateShapeCounterClockwise() {
  if (selectedCanvasShape.value && selectedCanvasShape.value.type === 'triangle') {
    canvasRef.value?.rotateTriangleByAngle(selectedCanvasShape.value.id, -rotationStep.value)
  }
}

function resetRotation() {
  if (selectedCanvasShape.value && selectedCanvasShape.value.type === 'triangle') {
    canvasRef.value?.resetTriangleRotation(selectedCanvasShape.value.id)
  }
}

function deleteShape() {
  if (selectedCanvasShape.value) {
    canvasRef.value?.deleteShape(selectedCanvasShape.value.id)
    selectedCanvasShape.value = null
  }
}

// Calculate area for display
function calculateArea(shape) {
  if (!shape || !shape.dimensions) return 0
  
  if (shape.type === 'square') {
    return Math.round(shape.dimensions.side * shape.dimensions.side)
  } 
  else if (shape.type === 'rectangle') {
    return Math.round(shape.dimensions.length * shape.dimensions.width)
  } 
  else if (shape.type === 'triangle') {
    const { a, b, c } = shape.dimensions
    const s = (a + b + c) / 2
    const area = Math.sqrt(s * (s - a) * (s - b) * (s - c))
    return Math.round(isNaN(area) ? 0 : area)
  } 
  else if (shape.type === 'trapezoid') {
    const { a, b, height } = shape.dimensions
    return Math.round(((a + b) / 2) * height)
  }
  
  return 0
}

// Update canvas when dimensions change

function updateCanvas() {
  // Force canvas redraw for selected shape changes
  canvasRef.value?.updateSelectedShape?.()
}


// 2. ADD WATCHER FOR SELECTED SHAPE CHANGES - Add this watcher to watch for selected shape dimension changes:

// Watch for changes in selected canvas shape dimensions
watch(() => selectedCanvasShape.value?.dimensions, () => {
  if (selectedCanvasShape.value) {
    updateCanvas()
  }
}, { deep: true })


// Delete selected shape
function deleteSelectedShape() {
  if (selectedCanvasShape.value) {
    canvasRef.value?.deleteSelectedShape()
    selectedCanvasShape.value = null
  }
}

// For fixing drag and drop problem (if needed later)
const handleShapeAdd = ({ shape, dimensions }) => {
  canvasRef.value?.addShapeFromSidebar(shape.toLowerCase(), dimensions)
}

// ok here we will implement the new fucntion that we will use for 90 º rotation 




// Replace the existing rotation functions in BuildHome.vue with these:

function rotateSelectedTriangle() {
  if (selectedCanvasShape.value && selectedCanvasShape.value.type === 'triangle') {
    canvasRef.value?.rotateTriangleByAngle(selectedCanvasShape.value.id, rotationStep.value)
    // Update current rotation immediately
    currentRotation.value = (selectedCanvasShape.value.dimensions.rotation || 0) + rotationStep.value
  } else {
    const triangleShapes = canvasRef.value?.getTriangleShapes() || []
    if (triangleShapes.length > 0) {
      const lastTriangle = triangleShapes[triangleShapes.length - 1]
      canvasRef.value?.rotateTriangleByAngle(lastTriangle.id, rotationStep.value)
      currentRotation.value = (lastTriangle.dimensions.rotation || 0) + rotationStep.value
    }
  }
}

function rotateSelectedTriangleCounterClockwise() {
  if (selectedCanvasShape.value && selectedCanvasShape.value.type === 'triangle') {
    canvasRef.value?.rotateTriangleByAngle(selectedCanvasShape.value.id, -rotationStep.value)
    currentRotation.value = (selectedCanvasShape.value.dimensions.rotation || 0) - rotationStep.value
  } else {
    const triangleShapes = canvasRef.value?.getTriangleShapes() || []
    if (triangleShapes.length > 0) {
      const lastTriangle = triangleShapes[triangleShapes.length - 1]
      canvasRef.value?.rotateTriangleByAngle(lastTriangle.id, -rotationStep.value)
      currentRotation.value = (lastTriangle.dimensions.rotation || 0) - rotationStep.value
    }
  }
}

function resetSelectedTriangleRotation() {
  if (selectedCanvasShape.value && selectedCanvasShape.value.type === 'triangle') {
    canvasRef.value?.resetTriangleRotation(selectedCanvasShape.value.id)
    currentRotation.value = 0
  } else {
    const triangleShapes = canvasRef.value?.getTriangleShapes() || []
    if (triangleShapes.length > 0) {
      const lastTriangle = triangleShapes[triangleShapes.length - 1]
      canvasRef.value?.resetTriangleRotation(lastTriangle.id)
      currentRotation.value = 0
    }
  }
}




</script>

<style scoped>


/* ADD to BuildHome.vue style section */
.wall-info {
  font-size: 0.9em;
  color: #666;
  margin-top: 5px;
}

.position-slider {
  width: 100%;
  margin: 5px 0;
}

.position-input {
  width: 80px;
  margin-left: 10px;
}

.opening-preview {
  margin: 15px 0;
  padding: 10px;
  background: #f5f5f5;
  border-radius: 8px;
}

.preview-wall {
  width: 100%;
  height: 30px;
  background: #ddd;
  position: relative;
  border-radius: 4px;
  margin-bottom: 5px;
}

.preview-opening {
  position: absolute;
  top: 5px;
  height: 20px;
  background: #fff;
  border: 2px solid #007bff;
  border-radius: 2px;
  transition: all 0.2s ease;
}

.preview-labels {
  display: flex;
  justify-content: space-between;
  font-size: 0.8em;
  color: #666;
}

.add-opening-btn:disabled {
  background: #ccc;
  cursor: not-allowed;
}

small {
  display: block;
  font-size: 0.8em;
  color: #666;
  margin-top: 2px;
}


.window-door-panel {
  position: fixed;
  top: 50%;
  right: 20px;
  transform: translateY(-50%);
  background: white;
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  padding: 20px;
  width: 300px;
  z-index: 1000;
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.close-btn {
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: #666;
}

.close-btn:hover {
  color: #333;
}

.opening-type-selector {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
}

.type-btn {
  flex: 1;
  padding: 12px;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  background: white;
  cursor: pointer;
  transition: all 0.2s;
}

.type-btn:hover {
  border-color: #3b82f6;
}

.type-btn.active {
  border-color: #3b82f6;
  background: #eff6ff;
  color: #3b82f6;
}

.dimensions-panel {
  margin-bottom: 20px;
}

.add-opening-btn {
  width: 100%;
  padding: 12px;
  background: #3b82f6;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  transition: background-color 0.2s;
}

.add-opening-btn:hover {
  background: #2563eb;
}






/* Visualization Code 3D */

.visualization-section {
  margin-bottom: 2rem;
}

.visualization-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.toggle-3d-btn {
  padding: 0.75rem 1.5rem;
  background-color: #6366f1;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: bold;
  transition: all 0.3s ease;
}

.toggle-3d-btn:hover {
  background-color: #4f46e5;
  transform: translateY(-1px);
}

.toggle-3d-btn.active {
  background-color: #ef4444;
}

.toggle-3d-btn.active:hover {
  background-color: #dc2626;
}

.visualization-container {
  width: 100%;
  height: 500px;
  margin-bottom: 2rem;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}


/* End Here */







/* Add this to your <style scoped> section */
.rotation-display {
  background-color: #f8f9fa !important;
  color: #6c757d !important;
  font-weight: bold !important;
  text-align: center !important;
  border: 2px solid #28a745 !important;
}

.rotation-control-group {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

/* Enhanced live rotation indicator */
.selected-triangle-rotation .rotation-display {
  background: linear-gradient(135deg, #d4edda 0%, #c3e6cb 100%) !important;
  border: 2px solid #28a745 !important;
  color: #155724 !important;
  font-weight: bold !important;
  animation: pulse-glow 2s infinite;
}

@keyframes pulse-glow {
  0%, 100% {
    box-shadow: 0 0 5px rgba(40, 167, 69, 0.3);
  }
  50% {
    box-shadow: 0 0 15px rgba(40, 167, 69, 0.6);
  }
}





/* this might be extra so coulf be deleted after this test case */
.selected-triangle-rotation {
  margin-top: 1rem;
  padding: 1rem;
  background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
  border-radius: 12px;
  border: 2px solid #0ea5e9;
  box-shadow: 0 4px 12px rgba(14, 165, 233, 0.15);
}

.selected-triangle-rotation h4 {
  color: #0369a1;
  margin-bottom: 0.75rem;
  font-weight: bold;
}

.selected-triangle-rotation .rotation-control-group {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.selected-triangle-rotation .rotation-buttons {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.selected-triangle-rotation .control-btn {
  padding: 0.5rem;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: bold;
  transition: all 0.3s ease;
  font-size: 0.85rem;
}

.selected-triangle-rotation .rotate-btn {
  background-color: #0ea5e9;
  color: white;
}

.selected-triangle-rotation .rotate-btn:hover {
  background-color: #0284c7;
  transform: translateY(-1px);
}

.selected-triangle-rotation .reset-btn {
  background-color: #6b7280;
  color: white;
}

.selected-triangle-rotation .reset-btn:hover {
  background-color: #4b5563;
}


/* Test case ends */



/* Enhanced styling for selected shape editing */
.shape-info {
  background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
  padding: 1.5rem;
  border-radius: 12px;
  border: 2px solid #22c55e;
  box-shadow: 0 4px 12px rgba(34, 197, 94, 0.15);
  transition: all 0.3s ease;
}

.shape-info:hover {
  box-shadow: 0 6px 16px rgba(34, 197, 94, 0.2);
  transform: translateY(-1px);
}

.edit-grid .input-group input {
  width: 80px;
  text-align: right;
  border: 2px solid #e5e7eb;
  border-radius: 6px;
  padding: 0.5rem;
  transition: border-color 0.3s ease;
}

.edit-grid .input-group input:focus {
  border-color: #22c55e;
  outline: none;
  box-shadow: 0 0 0 3px rgba(34, 197, 94, 0.1);
}

.area-item {
  background: linear-gradient(135deg, #dcfce7 0%, #bbf7d0 100%);
  padding: 0.75rem;
  border-radius: 8px;
  border: 2px solid #22c55e;
  margin-top: 0.75rem;
  animation: pulse-subtle 2s infinite;
}

@keyframes pulse-subtle {
  0%, 100% { 
    box-shadow: 0 0 0 0 rgba(34, 197, 94, 0.4);
  }
  50% { 
    box-shadow: 0 0 0 4px rgba(34, 197, 94, 0.1);
  }
}

.area-item label,
.area-item span {
  color: #15803d;
  font-weight: bold;
}





/* Add CSS for Delete Button */
.delete-section {
  margin-top: 1rem;
  padding: 1rem;
  background-color: #fff5f5;
  border-radius: 8px;
  border: 1px solid #fed7d7;
}

.delete-btn {
  background-color: #dc3545;
  color: white;
  width: 100%;
}

.delete-btn:hover {
  background-color: #c82333;
}

.edit-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 0.75rem;
}

.edit-grid .input-group {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.edit-grid .input-group input {
  width: 80px;
  text-align: right;
}



/* Add these styles to the <style scoped> section */
/* Add these styles to your existing <style scoped> section */
.triangle-rotation-controls {
  margin-top: 1rem;
  padding: 1rem;
  background-color: #f8f9fa;
  border-radius: 8px;
  border: 1px solid #e9ecef;
}

.rotation-control-group {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.rotation-buttons {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.rotation-input {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid #ccc;
  border-radius: 4px;
  font-size: 0.9rem;
}

.control-btn {
  padding: 0.5rem;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: bold;
  transition: all 0.3s ease;
  font-size: 0.85rem;
}

.rotate-btn {
  background-color: #17a2b8;
  color: white;
}

.rotate-btn:hover {
  background-color: #138496;
}

.reset-btn {
  background-color: #6c757d;
  color: white;
}

.reset-btn:hover {
  background-color: #5a6268;
}

.build-container {
  display: flex;
  padding: 2rem;
  gap: 2rem;
  min-height: 100vh;
}





.sidebar {
  width: 280px;
  background: white;
  padding: 1rem;
  border-radius: 12px;
  box-shadow: 0 2px 6px rgba(0,0,0,0.1);
}

.shape-btn {
  width: 100%;
  margin-top: 1rem;
  padding: 0.75rem;
  background-color: #0cdcf7;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: bold;
  transition: background-color 0.3s ease;
}

.shape-btn:hover {
  background-color: #0bb0c3;
}

.add-shape-btn {
  width: 100%;
  margin-top: 1rem;
  padding: 0.75rem;
  background-color: #28a745;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: bold;
  transition: background-color 0.3s ease;
}

.add-shape-btn:hover {
  background-color: #218838;
}

.shape-controls {
  margin-top: 2rem;
  padding-top: 1rem;
  border-top: 2px solid #eee;
}

.shape-controls h3 {
  margin-bottom: 1rem;
  color: #333;
}

.control-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.control-btn {
  padding: 0.5rem;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: bold;
  transition: all 0.3s ease;
}

.rotate-btn {
  background-color: #17a2b8;
  color: white;
}

.rotate-btn:hover {
  background-color: #138496;
}

.delete-btn {
  background-color: #dc3545;
  color: white;
}

.delete-btn:hover {
  background-color: #c82333;
}

.shape-info {
  background-color: #f8f9fa;
  padding: 1rem;
  border-radius: 8px;
  border: 1px solid #e9ecef;
}

.shape-info h4 {
  margin-bottom: 0.75rem;
  color: #495057;
}

.info-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 0.5rem;
}

.info-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.25rem 0;
  border-bottom: 1px solid #dee2e6;
}

.info-item label {
  font-weight: 600;
  color: #495057;
}

.info-item span {
  color: #6c757d;
  font-family: monospace;
}

.area-item {
  background-color: #e3f2fd;
  padding: 0.5rem;
  border-radius: 4px;
  border: 1px solid #2196f3;
  margin-top: 0.5rem;
}

.area-item label {
  color: #1976d2;
}

.area-item span {
  color: #1976d2;
  font-weight: bold;
}

.main-content {
  flex: 1;
}

.title {
  font-size: 2rem;
  margin-bottom: 1rem;
}

.visualization-placeholder {
  width: 100%;
  height: 300px;
  background-color: #ccc;
  border-radius: 12px;
  margin-bottom: 2rem;
}

.form-container {
  background-color: white;
  padding: 1.5rem;
  border-radius: 12px;
  box-shadow: 0 2px 6px rgba(0,0,0,0.1);
  display: flex;
  flex-wrap: wrap;
  gap: 2rem;
}

.input-group {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  min-width: 150px;
}

input {
  padding: 0.5rem;
  border-radius: 8px;
  border: 1px solid #ccc;
}
</style>