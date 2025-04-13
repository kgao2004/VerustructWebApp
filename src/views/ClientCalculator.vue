<template>
  <div class="calculator">
    <h1>Verustruct Wall Calculator</h1>
    
    <div class="visualization-section">
      <WallVisualization
        :roomShape="roomShape"
        :wallHeight="parseFloat(totalWallHeight)"
        :wallWidth="store.state.systemParameters.wallGap.value + (2 * store.state.systemParameters.chamberB.value)"
        :numberOfLayers="numberOfLayers"
        :chamberA="store.state.systemParameters.chamberA.value"
      />
    </div>

    <div class="input-section">
      <div class="form-group">
        <label for="roomShape">Room Shape:</label>
        <select 
          id="roomShape" 
          v-model="roomShape"
          @change="calculateOutputs"
        >
          <option value="square">Square Room (270" × 270")</option>
          <option value="rectangle">Rectangle Room (360" × 270")</option>
        </select>
      </div>

      <div class="form-group">
        <label for="roomCount">Number of Rooms:</label>
        <input 
          type="number" 
          id="roomCount"
          v-model="roomCount"
          min="1"
          @input="calculateOutputs"
        >
      </div>

      <div class="form-group">
        <label for="totalWallHeight">Wall Height:</label>
        <select 
          id="totalWallHeight" 
          v-model="totalWallHeight"
          @change="calculateOutputs"
        >
          <option value="243.84">8 ft</option>
          <option value="304.8">10 ft</option>
          <option value="365.76">12 ft</option>
        </select>
      </div>
    </div>

    <div class="output-section">
      <h2>Calculation Results</h2>
      <div class="output-grid">
        <div class="output-item">
          <label>Number of Layers:</label>
          <span>{{ numberOfLayers }}</span>
        </div>
        <div class="output-item">
          <label>Concrete Cost Estimate:</label>
          <span>${{ outputs.concreteCost.toFixed(2) }}</span>
        </div>
        <div class="output-item">
          <label>Linear Length Traveled:</label>
          <span>{{ outputs.linearLength.toFixed(2) }} cm ({{ (outputs.linearLength * CONVERSIONS.cmToInch).toFixed(2) }} in)</span>
        </div>
        <div class="output-item">
          <label>Travel Rate:</label>
          <span>{{ outputs.travelRate.toFixed(2) }} cm/s ({{ (outputs.travelRate * CONVERSIONS.cmToInch).toFixed(2) }} in/s)</span>
        </div>
        <div class="output-item">
          <label>Layer Print Time:</label>
          <span>{{ outputs.layerPrintTime.toFixed(2) }} seconds ({{ (outputs.layerPrintTime / 60).toFixed(2) }} minutes)</span>
        </div>
        <div class="output-item">
          <label>Total Print Time:</label>
          <span>{{ outputs.totalPrintTime.toFixed(2) }} seconds ({{ (outputs.totalPrintTime / 60).toFixed(2) }} minutes)</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed } from 'vue'
import { useStore } from 'vuex'
import WallVisualization from '@/components/WallVisualization.vue'

// Add conversion constants
const CONVERSIONS = {
  cmToInch: 0.393701,
  cmToFeet: 0.0328084,
  kgToLbs: 2.20462,
  pcfToKgCm3: 0.0000160185,
  cm2ToIn2: 0.155,
  cm3ToIn3: 0.0610237
}

export default {
  name: 'ClientCalculator',
  components: {
    WallVisualization
  },
  setup() {
    const store = useStore()
    const roomShape = ref(store.state.systemParameters.roomShape.value)
    const roomCount = ref(store.state.systemParameters.numberOfRooms.value)
    const totalWallHeight = ref(store.state.systemParameters.totalWallHeight.value)

    // Compute number of layers
    const numberOfLayers = computed(() => {
      const chamberA = store.state.systemParameters.chamberA.value
      return Math.ceil(parseFloat(totalWallHeight.value) / chamberA)
    })

    const outputs = ref({
      concreteCost: 0,
      linearLength: 0,
      travelRate: 0,
      layerPrintTime: 0,
      totalPrintTime: 0
    })

    const calculateOutputs = () => {
      // Update store with current values
      store.commit('updateParameter', { key: 'roomShape', value: roomShape.value })
      store.commit('updateParameter', { key: 'numberOfRooms', value: roomCount.value })
      store.commit('updateParameter', { key: 'totalWallHeight', value: totalWallHeight.value })

      const p = store.state.systemParameters;
      
      // Calculate wall dimensions based on room shape
      const wallLength = roomShape.value === 'square' ? 685.8 : 914.4; // 270" or 360"
      const wallWidth = 685.8; // 270"
      
      // Total Linear Wall Length: T = (2*Single Wall Length) + (2*Single Wall Width)
      const totalLength = (2 * wallLength + 2 * wallWidth) * roomCount.value;
      
      // Layer Volume per unit length: (a×b)−(d×(a−c))
      const layerVolume = (p.chamberA.value * p.chamberB.value) - 
        (p.chamberD.value * (p.chamberA.value - p.chamberC.value));
      
      // Total Wall Volume: ((a×b)−(d×(a−c)))×T
      const totalWallVolume = layerVolume * totalLength;
      
      // Layer Mass for Full Footprint: ρ×Total Wall Volume
      const layerMass = p.concreteDensity.value * totalWallVolume * CONVERSIONS.pcfToKgCm3;
      
      // Total Mass of Walls: Layer Mass×n
      const totalMass = layerMass * numberOfLayers.value;
      
      // Linear Length Traveled = Total Linear Wall Length × number of layers
      outputs.value.linearLength = totalLength * numberOfLayers.value;
      outputs.value.travelRate = p.travelRate.value;
      outputs.value.layerPrintTime = totalLength / p.travelRate.value; // seconds
      outputs.value.totalPrintTime = outputs.value.layerPrintTime * numberOfLayers.value; // seconds
      // Concrete Cost Estimate: Total Mass in lbs×0.02
      outputs.value.concreteCost = totalMass * CONVERSIONS.kgToLbs * 0.02;
    }

    return {
      roomShape,
      roomCount,
      totalWallHeight,
      numberOfLayers,
      outputs,
      calculateOutputs,
      store,
      CONVERSIONS
    }
  },
  mounted() {
    this.calculateOutputs();
  }
}
</script>

<style scoped>
.calculator {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
}

.calculator h1 {
  font-family: 'K2D', sans-serif;
  font-weight: 700;
  margin-bottom: 20px;
}

.calculator h2 {
  font-family: 'K2D', sans-serif;
  font-weight: 500;
  margin-bottom: 15px;
}

.input-section {
  background-color: #f8f9fa;
  padding: 20px;
  border-radius: 8px;
  margin-bottom: 20px;
}

.form-group {
  margin-bottom: 15px;
}

.form-group label {
  display: block;
  margin-bottom: 5px;
  font-family: 'Kumbh Sans', sans-serif;
  font-weight: 600;
}

.form-group input,
.form-group select {
  width: 100%;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-family: 'Inter', sans-serif;
}

.output-section {
  background-color: #fff;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.output-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
}

.output-item {
  padding: 10px;
  background-color: #f8f9fa;
  border-radius: 4px;
}

.output-item label {
  display: block;
  font-family: 'Kumbh Sans', sans-serif;
  font-weight: 600;
  margin-bottom: 5px;
  color: #666;
}

.output-item span {
  font-family: 'Inter', sans-serif;
  font-size: 1.2em;
  color: #42b983;
}

.visualization-section {
  margin-bottom: 20px;
  background-color: #fff;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}
</style> 