<template>
  <div>
    <canvas ref="canvas" width="400" height="400" class="border"></canvas>
  </div>
</template>

<script setup>
import { onMounted, ref, watch } from 'vue'
// import { calculateTriangleVertices } from '../components/shapeCalculation';



const props = defineProps({
  shape: String,
  dimensions: Object
})

// === 1. ADD ANIMATION STATE VARIABLES (at the top of script setup) ===

// ADD THESE NEW ANIMATION VARIABLES:

///////////// 3D Visualization Code ////////////////
const getAllShapes = () => {
  return shapes.value.map(shape => ({
    id: shape.id,
    type: shape.type,
    dimensions: shape.dimensions,
    position: { 
      x: shape.x || 0, 
      y: shape.y || 0 
    }
  }))
}

/////////////////////////////////////////////////////


const emit = defineEmits(['shape-selected', 'shape-deleted'])
const canvas = ref(null)
const shapes = ref([])
const draggingShape = ref(null)
const offset = { x: 0, y: 0 }
const SNAP_THRESHOLD = 15

const animationId = ref(null)
const isAnimating = ref(false)
//////////////////////////

// adding this for triangle rotation 

const rotatingShape = ref(null)
const rotationStartAngle = ref(0)
const rotationCenter = { x: 0, y: 0 }

// Grid drawing function
function drawGrid(ctx, width, height) {
  const gridSize = 20
  ctx.strokeStyle = '#ddd'
  ctx.lineWidth = 1

  for (let x = 0; x <= width; x += gridSize) {
    ctx.beginPath()
    ctx.moveTo(x, 0)
    ctx.lineTo(x, height)
    ctx.stroke()
  }

  for (let y = 0; y <= height; y += gridSize) {
    ctx.beginPath()
    ctx.moveTo(0, y)
    ctx.lineTo(width, y)
    ctx.stroke()
  }
}

// Triangle drawing function
function drawTriangle(ctx, a, b, c) {
  if (a + b <= c || a + c <= b || b + c <= a) {
    ctx.fillStyle = 'red'
    ctx.font = '16px Arial'
    ctx.fillText('Invalid triangle dimensions', 100, 100)
    return
  }

  const angleC = Math.acos((a ** 2 + b ** 2 - c ** 2) / (2 * a * b))
  const startX = 100
  const startY = 300

  const x1 = startX
  const y1 = startY
  const x2 = x1 + a
  const y2 = y1
  const x3 = x1 + b * Math.cos(angleC)
  const y3 = y1 - b * Math.sin(angleC)

  ctx.beginPath()
  ctx.moveTo(x1, y1)
  ctx.lineTo(x2, y2)
  ctx.lineTo(x3, y3)
  ctx.closePath()
  ctx.stroke()
}

// Watch for dimension changes in preview mode
watch(() => props.dimensions, (newDim) => {
  if (props.shape) {
    drawShape(props.shape, newDim)
  }
}, { deep: true })

// 3. UPDATE PREVIEW DRAWING - Replace the drawShape function with this enhanced version:

const drawShape = () => {
  const ctx = canvas.value.getContext('2d')
  ctx.clearRect(0, 0, canvas.value.width, canvas.value.height)
  
  // Enhanced preview styling
  ctx.strokeStyle = '#6366f1'
  ctx.lineWidth = 2.5
  ctx.setLineDash([8, 6])

  if (props.shape === 'rectangle') {
    const { length = 100, width = 50 } = props.dimensions
    ctx.strokeRect(50, 50, length, width)
  }

  if (props.shape === 'square') {
    const { side = 80 } = props.dimensions
    ctx.strokeRect(50, 50, side, side)
  }

  if (props.shape === 'triangle') {
    const { a = 100, b = 100, c = 100 } = props.dimensions
    drawTriangle(ctx, a, b, c)
  }

  if (props.shape === 'trapezoid') {
    const { a = 100, b = 60, height = 50 } = props.dimensions
    const startX = 100
    const startY = 200
    const offset = (a - b) / 2

    ctx.beginPath()
    ctx.moveTo(startX, startY)
    ctx.lineTo(startX + a, startY)
    ctx.lineTo(startX + a - offset, startY - height)
    ctx.lineTo(startX + offset, startY - height)
    ctx.closePath()
    ctx.stroke()
  }

  drawGrid(ctx, canvas.value.width, canvas.value.height)
}


const updateSelectedShape = () => {
  // Force canvas redraw when selected shape dimensions change
  draw()
}



// Replace the entire draw function in ShapeCanvas.vue with this:

// === 2. REPLACE THE draw() FUNCTION WITH ANIMATED VERSION ===
const draw = () => {
  const ctx = canvas.value.getContext('2d')
  ctx.clearRect(0, 0, canvas.value.width, canvas.value.height)

  drawGrid(ctx, canvas.value.width, canvas.value.height)

  for (const shape of shapes.value) {
    ctx.save()
    ctx.translate(shape.x, shape.y)

    // Dynamic dashed line style - FASTER ANIMATION
    const time = Date.now() * 0.008 // Increased speed from 0.005
    const dashOffset = (time % 30)
    ctx.setLineDash([6, 4])
    ctx.lineDashOffset = -dashOffset
    ctx.strokeStyle = '#2563eb'
    ctx.lineWidth = 2

    if (shape.type === 'square') {
      const { side } = shape.dimensions
      ctx.strokeRect(0, 0, side, side)
    } else if (shape.type === 'rectangle') {
      const { length, width } = shape.dimensions
      ctx.strokeRect(0, 0, length, width)
    } else if (shape.type === 'trapezoid') {
      const { a, b, height } = shape.dimensions
      const offset = (a - b) / 2

      ctx.beginPath()
      ctx.moveTo(0, 0)
      ctx.lineTo(a, 0)
      ctx.lineTo(a - offset, -height)
      ctx.lineTo(offset, -height)
      ctx.closePath()
      ctx.stroke()
    } // Replace the entire triangle drawing logic in draw() method:
      // else if (shape.type === 'triangle') {
      //   const { a, b, c, rotation = 0 } = shape.dimensions;
      //   const vertices = calculateTriangleVertices(a, b, c);
        
      //   if (!vertices) {
      //     ctx.fillStyle = 'red';
      //     ctx.font = '16px Arial';
      //     ctx.fillText('Invalid triangle', 0, 0);
      //   } else {
      //     // Calculate centroid for rotation
      //     const centerX = (vertices[0].x + vertices[1].x + vertices[2].x) / 3;
      //     const centerY = (vertices[0].y + vertices[1].y + vertices[2].y) / 3;
          
      //     ctx.translate(centerX, centerY);
      //     ctx.rotate((rotation * Math.PI) / 180);
      //     ctx.translate(-centerX, -centerY);
          
      //     ctx.beginPath();
      //     ctx.moveTo(vertices[0].x, vertices[0].y);
      //     vertices.forEach(v => ctx.lineTo(v.x, v.y));
      //     ctx.closePath();
      //     ctx.stroke();
      //   }
      // } 






    else if (shape.type === 'triangle') {
      const { a, b, c } = shape.dimensions
      const rotation = shape.dimensions.rotation || 0
      
      if (a + b <= c || a + c <= b || b + c <= a) {
        ctx.fillStyle = 'red'
        ctx.font = '16px Arial'
        ctx.fillText('Invalid triangle', 0, 0)
      } else {
        const s = (a + b + c) / 2
        const area = Math.sqrt(s * (s - a) * (s - b) * (s - c))
        const height = (2 * area) / a
        
        const x1 = 0
        const y1 = 0
        const x2 = a
        const y2 = 0
        
        const angleC = Math.acos((a * a + b * b - c * c) / (2 * a * b))
        const x3 = b * Math.cos(angleC)
        const y3 = -b * Math.sin(angleC)

        const centerX = (x1 + x2 + x3) / 3
        const centerY = (y1 + y2 + y3) / 3
        
        ctx.translate(centerX, centerY)
        ctx.rotate((rotation * Math.PI) / 180)
        ctx.translate(-centerX, -centerY)

        ctx.beginPath()
        ctx.moveTo(x1, y1)
        ctx.lineTo(x2, y2)
        ctx.lineTo(x3, y3)
        ctx.closePath()
        ctx.stroke()
      }
    }



    // Enhanced animated selection indicator - FASTER ANIMATION
    if (shape.selected) {
      const selectionTime = Date.now() * 0.012 // Increased speed
      const dashOffset = (selectionTime % 20)
      
      ctx.setLineDash([8, 4])
      ctx.lineDashOffset = -dashOffset
      ctx.strokeStyle = '#22c55e'
      ctx.lineWidth = 3
      
      const bounds = getShapeVisualBounds(shape)
      
      const padding = 8
      ctx.strokeRect(-padding, -padding, bounds.width + padding * 2, bounds.height + padding * 2)
      
      // Faster pulsing selection handles
      const pulseAlpha = 0.7 + 0.3 * Math.sin(selectionTime * 0.15) // Increased speed
      const handleSize = 8
      ctx.fillStyle = `rgba(34, 197, 94, ${pulseAlpha})`
      ctx.shadowColor = 'rgba(34, 197, 94, 0.5)'
      ctx.shadowBlur = 6
      
      ctx.setLineDash([])
      
      const positions = [
        [-handleSize/2, -handleSize/2],
        [bounds.width - handleSize/2, -handleSize/2], 
        [-handleSize/2, bounds.height - handleSize/2],
        [bounds.width - handleSize/2, bounds.height - handleSize/2]
      ]
      
      positions.forEach(([x, y]) => {
        ctx.fillRect(x, y, handleSize, handleSize)
      })
      
      ctx.shadowBlur = 0
    }

    drawAreaLabel(ctx, shape)
    ctx.restore()
  }

  // Continue animation if shapes are selected
  if (shapes.value.some(s => s.selected)) {
    animationId.value = requestAnimationFrame(draw)
  } else {
    isAnimating.value = false
  }
}





const startAnimation = () => {
  if (!isAnimating.value) {
    isAnimating.value = true
    draw()
  }
}

const stopAnimation = () => {
  if (animationId.value) {
    cancelAnimationFrame(animationId.value)
    animationId.value = null
    isAnimating.value = false
  }
}





// Area calculation and labeling
const drawAreaLabel = (ctx, shape) => {
  ctx.font = '14px Arial'
  ctx.fillStyle = 'black'
  let area = 0

  if (shape.type === 'square') {
    const s = shape.dimensions.side
    area = s * s
  } else if (shape.type === 'rectangle') {
    const { length, width } = shape.dimensions
    area = length * width
  } else if (shape.type === 'triangle') {
    const { a, b, c } = shape.dimensions
    const s = (a + b + c) / 2
    const A = Math.sqrt(s * (s - a) * (s - b) * (s - c))
    area = isNaN(A) ? 0 : A
  } else if (shape.type === 'trapezoid') {
    const { a, b, height } = shape.dimensions
    area = ((a + b) / 2) * height
  }

  const centerX = 40
  const centerY = 20
  ctx.fillText(`${Math.round(area)} ft²`, centerX, centerY)
}

// FIXED: Mouse event handlers with proper rectangle support
// Update the startDrag function to detect rotation mode
const startDrag = (e) => {
  const rect = canvas.value.getBoundingClientRect()
  const mouseX = e.clientX - rect.left
  const mouseY = e.clientY - rect.top

  // Clear all selections first
  shapes.value.forEach(shape => shape.selected = false)
  stopAnimation() // Stop previous animation

  for (const shape of shapes.value.slice().reverse()) {
    if (isInsideShape(mouseX, mouseY, shape)) {
      shape.selected = true
      
      // START ANIMATION when shape is selected
      startAnimation()
      
      emit('shape-selected', shape)
      
      if (shape.type === 'triangle' && e.shiftKey) {
        rotatingShape.value = shape
        const bounds = getShapeBounds(shape)
        rotationCenter.x = bounds.left + bounds.width / 2
        rotationCenter.y = bounds.top + bounds.height / 2
        rotationStartAngle.value = Math.atan2(mouseY - rotationCenter.y, mouseX - rotationCenter.x)
        if (!shape.dimensions.rotation) shape.dimensions.rotation = 0
        return
      }
      
      draggingShape.value = shape
      offset.x = mouseX - shape.x
      offset.y = mouseY - shape.y
      return
    }
  }
  
  // No shape selected, clear selection and stop animation
  emit('shape-selected', null)
  stopAnimation()
  draw()
}




// New Version: 
// Update the onDrag function to handle rotation
const onDrag = (e) => {
  const rect = canvas.value.getBoundingClientRect()
  const mouseX = e.clientX - rect.left
  const mouseY = e.clientY - rect.top

  if (rotatingShape.value) {
  const currentAngle = Math.atan2(mouseY - rotationCenter.y, mouseX - rotationCenter.x)
  const angleDiff = (currentAngle - rotationStartAngle.value) * (180 / Math.PI)
  // Change this line:
  rotatingShape.value.dimensions.rotation = (rotatingShape.value.dimensions.rotation || 0) + angleDiff
  rotationStartAngle.value = currentAngle
  draw()
  return
  }

  if (!draggingShape.value) return

  draggingShape.value.x = mouseX - offset.x
  draggingShape.value.y = mouseY - offset.y

  snapToNearbyShapes(draggingShape.value)
  draw()
}


// New version
// Update the endDrag function
const endDrag = () => {
  if (rotatingShape.value) {
    console.log(`Stopped rotating ${rotatingShape.value.type}`)
    rotatingShape.value = null
  }
  if (draggingShape.value) {
    console.log(`Stopped dragging ${draggingShape.value.type}`)
  }
  draggingShape.value = null
}


// Add these functions before defineExpose
// Replace the existing rotateTriangle function with these:
const rotateTriangle = (shapeId) => {
  const shape = shapes.value.find(s => s.id === shapeId)
  if (shape && shape.type === 'triangle') {
    shape.dimensions.rotation = (shape.dimensions.rotation || 0) + 90
    if (shape.dimensions.rotation >= 360) shape.dimensions.rotation = 0
    draw()
  }
}

const rotateTriangleByAngle = (shapeId, angle) => {
  const shape = shapes.value.find(s => s.id === shapeId)
  if (shape && shape.type === 'triangle') {
    shape.dimensions.rotation = (shape.dimensions.rotation || 0) + angle
    shape.dimensions.rotation = ((shape.dimensions.rotation % 360) + 360) % 360
    
    // EMIT ROTATION UPDATE FOR LIVE SYNC
    emit('triangle-rotated', {
      shapeId: shape.id,
      rotation: shape.dimensions.rotation,
      rotationStep: Math.abs(angle)
    })
    
    // Only draw if canvas exists
    if (canvas.value) {
      draw()
    }
  }
}




const resetTriangleRotation = (shapeId) => {
  const shape = shapes.value.find(s => s.id === shapeId)
  if (shape && shape.type === 'triangle') {
    shape.dimensions.rotation = 0
    
    // EMIT ROTATION RESET FOR LIVE SYNC
    emit('triangle-rotated', {
      shapeId: shape.id,
      rotation: 0,
      rotationStep: 0
    })
    
    // Only draw if canvas exists
    if (canvas.value) {
      draw()
    }
  }
}



// Delete function

const deleteShape = (shapeId) => {
  const index = shapes.value.findIndex(s => s.id === shapeId)
  if (index !== -1) {
    shapes.value.splice(index, 1)
    draw()
    emit('shape-deleted')
  }
}

const deleteSelectedShape = () => {
  const selectedShape = shapes.value.find(s => s.selected)
  if (selectedShape) {
    deleteShape(selectedShape.id)
  }
}








// FIXED: Complete isInsideShape function with all shape types
const isInsideShape = (x, y, shape) => {
  console.log(`Checking if point (${x}, ${y}) is inside ${shape.type} at (${shape.x}, ${shape.y})`)
  
  if (shape.type === 'square') {
    const { side } = shape.dimensions
    const inside = x >= shape.x && x <= shape.x + side && y >= shape.y && y <= shape.y + side
    console.log(`Square check: ${inside}`)
    return inside
  } 
  
  // FIXED: Added rectangle support!
  else if (shape.type === 'rectangle') {
    const { length, width } = shape.dimensions
    const inside = x >= shape.x && x <= shape.x + length && y >= shape.y && y <= shape.y + width
    console.log(`Rectangle check: bounds(${shape.x}, ${shape.y}, ${shape.x + length}, ${shape.y + width}), result: ${inside}`)
    return inside
  } 
  
  else if (shape.type === 'triangle') {
    // Simplified triangle hit detection using bounding box
    const { a, b } = shape.dimensions
    const inside = x >= shape.x && x <= shape.x + a && y >= shape.y - b && y <= shape.y
    console.log(`Triangle check: ${inside}`)
    return inside
  } 
  
  else if (shape.type === 'trapezoid') {
    const { a, height } = shape.dimensions
    const inside = x >= shape.x && x <= shape.x + a && y >= shape.y - height && y <= shape.y
    console.log(`Trapezoid check: ${inside}`)
    return inside
  }
  
  return false
}

// Snapping functionality
const snapToNearbyShapes = (currentShape) => {
  const currentBounds = getShapeBounds(currentShape)

  for (const other of shapes.value) {
    if (currentShape.id === other.id) continue

    const otherBounds = getShapeBounds(other)

    // Snap Left to Right
    if (Math.abs(currentBounds.left - otherBounds.right) < SNAP_THRESHOLD &&
        isVerticallyAligned(currentBounds, otherBounds)) {
      currentShape.x = otherBounds.right
    }

    // Snap Right to Left
    if (Math.abs(currentBounds.right - otherBounds.left) < SNAP_THRESHOLD &&
        isVerticallyAligned(currentBounds, otherBounds)) {
      currentShape.x = otherBounds.left - currentBounds.width
    }

    // Snap Top to Bottom
    if (Math.abs(currentBounds.top - otherBounds.bottom) < SNAP_THRESHOLD &&
        isHorizontallyAligned(currentBounds, otherBounds)) {
      currentShape.y = otherBounds.bottom
    }

    // Snap Bottom to Top
    if (Math.abs(currentBounds.bottom - otherBounds.top) < SNAP_THRESHOLD &&
        isHorizontallyAligned(currentBounds, otherBounds)) {
      currentShape.y = otherBounds.top - currentBounds.height
    }
  }
}

// Helper functions for bounds and alignment
const getShapeBounds = (shape) => {
  let width = getShapeWidth(shape)
  let height = getShapeHeight(shape)

  return {
    left: shape.x,
    right: shape.x + width,
    top: shape.y,
    bottom: shape.y + height,
    width,
    height
  }
}

const getShapeHeight = (shape) => {
  if (shape.type === 'square') return shape.dimensions.side
  if (shape.type === 'rectangle') return shape.dimensions.width  // Note: using width as height
  if (shape.type === 'triangle') return shape.dimensions.b
  if (shape.type === 'trapezoid') return shape.dimensions.height
  return 0
}

const getShapeWidth = (shape) => {
  if (shape.type === 'square') return shape.dimensions.side
  if (shape.type === 'rectangle') return shape.dimensions.length
  if (shape.type === 'triangle') return shape.dimensions.a
  if (shape.type === 'trapezoid') return shape.dimensions.a
  return 0
}

const isHorizontallyAligned = (a, b) => {
  return !(a.bottom < b.top || a.top > b.bottom)
}

const isVerticallyAligned = (a, b) => {
  return !(a.right < b.left || a.left > b.right)
}

// Add shape from sidebar
const addShapeFromSidebar = (type, dimensions) => {
  const id = crypto.randomUUID()
  const newShape = {
    id,
    type,
    x: 50 + Math.random() * 200,
    y: 50 + Math.random() * 200,
    dimensions
      // Add this line
  }
  
  console.log('Adding new shape:', newShape)
  shapes.value.push(newShape)
  draw()
}

const getTriangleShapes = () => {
  return shapes.value.filter(shape => shape.type === 'triangle')
}



/// Replace the getShapeVisualBounds function in ShapeCanvas.vue with this:

const getShapeVisualBounds = (shape) => {
  if (shape.type === 'triangle') {
    const { a, b, c } = shape.dimensions
    if (a + b <= c || a + c <= b || b + c <= a) {
      return { width: 100, height: 20 }
    }
    
    // Calculate triangle vertices properly
    const s = (a + b + c) / 2
    const area = Math.sqrt(s * (s - a) * (s - b) * (s - c))
    
    // Triangle vertices with base 'a' horizontal
    const x1 = 0
    const y1 = 0
    const x2 = a
    const y2 = 0
    
    // Calculate third vertex using law of cosines
    const angleC = Math.acos((a * a + b * b - c * c) / (2 * a * b))
    const x3 = b * Math.cos(angleC)
    const y3 = -b * Math.sin(angleC)
    
    // Find actual bounds
    const minX = Math.min(x1, x2, x3)
    const maxX = Math.max(x1, x2, x3)
    const minY = Math.min(y1, y2, y3)
    const maxY = Math.max(y1, y2, y3)
    
    return {
      width: maxX - minX,
      height: maxY - minY
    }
  }
  
  // For other shapes
  return {
    width: getShapeWidth(shape),
    height: getShapeHeight(shape)
  }
}










onMounted(() => {
  const handleKeyDown = (e) => {
    // ADD CANVAS CHECK HERE TO PREVENT ERROR
    if (!canvas.value) return
    
    const selectedShape = shapes.value.find(s => s.selected)
    if (!selectedShape || selectedShape.type !== 'triangle') return
    
    if (e.key === 'r' || e.key === 'R') {
      rotateTriangleByAngle(selectedShape.id, 15)
      e.preventDefault()
    }
    if (e.key === 'e' || e.key === 'E') {
      rotateTriangleByAngle(selectedShape.id, -15)
      e.preventDefault()
    }
    if (e.key === 'q' || e.key === 'Q') {
      resetTriangleRotation(selectedShape.id)
      e.preventDefault()
    }
  }

  if (!canvas.value) {
    console.error('Canvas not mounted yet!')
    return
  }

  const ctx = canvas.value.getContext('2d')
  if (!ctx) {
    console.error('2D context not available on canvas')
    return
  }

  draw()
  
  canvas.value.addEventListener('mousedown', startDrag)
  canvas.value.addEventListener('mousemove', onDrag)
  canvas.value.addEventListener('mouseup', endDrag)
  document.addEventListener('keydown', handleKeyDown)
  
  canvas.value.addEventListener('contextmenu', (e) => e.preventDefault())
})

// Expose function for parent component
defineExpose({ 
  addShapeFromSidebar,
  rotateTriangle,
  rotateTriangleByAngle,
  resetTriangleRotation,
  getTriangleShapes,
  deleteShape,
  deleteSelectedShape,
  updateSelectedShape,
  startAnimation,  // ADD THESE
  stopAnimation,// ADD THESE
  getAllShapes   
})

</script>

<style scoped>
canvas {
  background-color: white;
  border: 1px solid #ccc;
  cursor: grab;
}

canvas:active {
  cursor: grabbing;
}
</style>
