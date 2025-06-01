<!-- ConfigCanvas.vue -->
<template>
  <div>
    <canvas ref="canvas" width="400" height="400" class="border"></canvas>
  </div>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue'

const props = defineProps({
  shape: String,
  dimensions: Object
})

const canvas = ref(null)

const drawGrid = (ctx, width, height) => {
  const gridSize = 20
  ctx.strokeStyle = '#eee'
  for (let x = 0; x < width; x += gridSize) {
    ctx.beginPath()
    ctx.moveTo(x, 0)
    ctx.lineTo(x, height)
    ctx.stroke()
  }
  for (let y = 0; y < height; y += gridSize) {
    ctx.beginPath()
    ctx.moveTo(0, y)
    ctx.lineTo(width, y)
    ctx.stroke()
  }
}

const drawShape = () => {
  const ctx = canvas.value.getContext('2d')
  ctx.clearRect(0, 0, canvas.value.width, canvas.value.height)
  drawGrid(ctx, canvas.value.width, canvas.value.height)
  ctx.setLineDash([2, 3])
  ctx.strokeStyle = '#000'

  if (props.shape === 'square') {
    const { side = 80 } = props.dimensions
    ctx.strokeRect(100, 100, side, side)
  }

  if (props.shape === 'rectangle') {
    const { length = 100, width = 50 } = props.dimensions
    ctx.strokeRect(100, 100, length, width)
  }

  if (props.shape === 'triangle') {
    const { a = 100, b = 100, c = 100 } = props.dimensions
    if (a + b <= c || a + c <= b || b + c <= a) {
      ctx.fillText('Invalid triangle', 100, 100)
    } else {
      const angleC = Math.acos((a ** 2 + b ** 2 - c ** 2) / (2 * a * b))
      const x1 = 100, y1 = 300
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
  }

  if (props.shape === 'trapezoid') {
    const { a = 100, b = 60, height = 50 } = props.dimensions
    const startX = 100
    const startY = 300
    const offset = (a - b) / 2

    ctx.beginPath()
    ctx.moveTo(startX, startY)
    ctx.lineTo(startX + a, startY)
    ctx.lineTo(startX + a - offset, startY - height)
    ctx.lineTo(startX + offset, startY - height)
    ctx.closePath()
    ctx.stroke()
  }
}

watch(() => props.dimensions, drawShape, { deep: true })
watch(() => props.shape, drawShape)

onMounted(() => {
  if (!canvas.value) return
  drawShape()
})

const getShapeConfig = () => {
  return {
    type: props.shape,
    dimensions: props.dimensions
  }
}

defineExpose({ getShapeConfig })
</script>

<style scoped>
canvas {
  background-color: white;
  border: 1px dashed #aaa;
}
</style>
