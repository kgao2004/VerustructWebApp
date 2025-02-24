<template>
  <div class="calculator">
    <h1>Wall Calculator</h1>
    
    <div class="input-section">
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
        <label for="wallLength">Single Wall Length:</label>
        <select v-model="wallLength" @change="calculateOutputs">
          <option v-for="length in wallLengthOptions" 
                  :key="length" 
                  :value="length">
            {{ length }} meters
          </option>
        </select>
      </div>

      <div class="form-group">
        <label for="layers">Number of Layers:</label>
        <select v-model="layers" @change="calculateOutputs">
          <option v-for="layer in layerOptions" 
                  :key="layer" 
                  :value="layer">
            {{ layer }} layers
          </option>
        </select>
      </div>
    </div>

    <div class="output-section">
      <h2>Calculation Results</h2>
      <div class="output-grid">
        <div class="output-item">
          <label>Concrete Cost Estimate:</label>
          <span>${{ outputs.concreteCost.toFixed(2) }}</span>
        </div>
        <div class="output-item">
          <label>Linear Length Traveled:</label>
          <span>{{ outputs.linearLength.toFixed(2) }} meters</span>
        </div>
        <div class="output-item">
          <label>Travel Rate:</label>
          <span>{{ outputs.travelRate.toFixed(2) }} m/min</span>
        </div>
        <div class="output-item">
          <label>Layer Print Time:</label>
          <span>{{ outputs.layerPrintTime.toFixed(2) }} minutes</span>
        </div>
        <div class="output-item">
          <label>Total Print Time:</label>
          <span>{{ outputs.totalPrintTime.toFixed(2) }} hours</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ClientCalculator',
  data() {
    return {
      roomCount: 1,
      wallLength: 3,
      layers: 10,
      wallLengthOptions: [2, 3, 4, 5, 6],
      layerOptions: [5, 10, 15, 20, 25],
      outputs: {
        concreteCost: 0,
        linearLength: 0,
        travelRate: 0,
        layerPrintTime: 0,
        totalPrintTime: 0
      }
    }
  },
  methods: {
    calculateOutputs() {
      // Placeholder calculations - these will be replaced with actual formulas
      const baseRate = 0.5; // meters per minute
      this.outputs.linearLength = this.roomCount * this.wallLength * 4;
      this.outputs.travelRate = baseRate;
      this.outputs.layerPrintTime = this.outputs.linearLength / baseRate;
      this.outputs.totalPrintTime = (this.outputs.layerPrintTime * this.layers) / 60;
      this.outputs.concreteCost = this.outputs.linearLength * this.layers * 2.5; // $2.50 per meter-layer
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
  font-weight: bold;
}

.form-group input,
.form-group select {
  width: 100%;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
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
  font-weight: bold;
  margin-bottom: 5px;
  color: #666;
}

.output-item span {
  font-size: 1.2em;
  color: #42b983;
}
</style> 