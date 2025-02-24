<template>
  <div class="admin-panel">
    <h1>Admin Panel</h1>
    
    <div class="parameters-section">
      <h2>System Parameters</h2>
      <div class="form-grid">
        <div 
          class="form-group" 
          v-for="(param, key) in parameters" 
          :key="key"
          :class="{ 'has-error': validationErrors[key] }"
        >
          <label :for="key">{{ formatLabel(key) }}:</label>
          <input 
            :type="param.type" 
            :id="key"
            v-model.number="param.value"
            @input="updateParameter(key, $event.target.value)"
            :min="param.constraints?.min"
            :max="param.constraints?.max"
          >
          <span class="unit" v-if="param.unit">{{ param.unit }}</span>
          <span class="imperial" v-if="param.getImperial">
            ({{ param.getImperial(param.value) }})
          </span>
          <span class="error-message" v-if="validationErrors[key]">
            {{ validationErrors[key] }}
          </span>
          <span class="constraint-info" v-if="param.constraints?.message">
            Note: {{ param.constraints.message }}
          </span>
        </div>
      </div>
    </div>

    <div class="calculated-section">
      <h2>Calculated Variables</h2>
      <div class="output-grid">
        <div class="output-item" v-for="(calc, key) in calculatedVariables" :key="key">
          <label>{{ formatLabel(key) }}:</label>
          <span>
            {{ calc.value.toFixed(2) }} {{ calc.unit }}
            <span v-if="calc.imperialValue" class="imperial-value">
              ({{ calc.imperialValue.toFixed(2) }} {{ calc.imperialUnit }})
            </span>
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { computed } from 'vue'
import { useStore } from 'vuex'

export default {
  name: 'AdminPanel',
  setup() {
    const store = useStore()
    
    const parameters = computed(() => store.state.systemParameters)
    const validationErrors = computed(() => store.state.validationErrors)
    
    const updateParameter = (key, value) => {
      // Convert string to number if needed
      const numValue = typeof value === 'string' ? parseFloat(value) : value;
      if (!isNaN(numValue)) {
        store.commit('updateParameter', { key, value: numValue });
        updateCalculations();
      }
    }

    const calculatedVariables = {
      wallWidth: { value: 0, unit: 'cm', imperialValue: 0, imperialUnit: 'in' },
      layerVolume: { value: 0, unit: 'cm²', imperialValue: 0, imperialUnit: 'in²' },
      layerDeadLoad: { value: 0, unit: 'kg/cm', imperialValue: 0, imperialUnit: 'lb/in' },
      totalWallLength: { value: 0, unit: 'cm', imperialValue: 0, imperialUnit: 'in' },
      totalWallHeight: { value: 0, unit: 'cm', imperialValue: 0, imperialUnit: 'in' },
      chamberVolume: { value: 0, unit: 'cm³', imperialValue: 0, imperialUnit: 'in³' },
      totalWallVolume: { value: 0, unit: 'cm³', imperialValue: 0, imperialUnit: 'in³' },
      layerMass: { value: 0, unit: 'kg', imperialValue: 0, imperialUnit: 'lbs' },
      totalMass: { value: 0, unit: 'kg', imperialValue: 0, imperialUnit: 'tons' },
      concreteCost: { value: 0, unit: 'USD' },
      linearLength: { value: 0, unit: 'cm', imperialValue: 0, imperialUnit: 'in' },
      layerPrintTime: { value: 0, unit: 'seconds', imperialValue: 0, imperialUnit: 'minutes' },
      totalPrintTime: { value: 0, unit: 'seconds', imperialValue: 0, imperialUnit: 'minutes' }
    }

    const formatLabel = (key) => {
      return key
        .replace(/([A-Z])/g, ' $1')
        .replace(/^./, str => str.toUpperCase());
    }

    const updateCalculations = () => {
      const p = parameters.value;
      
      // Wall total width
      calculatedVariables.wallWidth.value = p.wallGap.value + (2 * p.chamberB.value);
      calculatedVariables.wallWidth.imperialValue = calculatedVariables.wallWidth.value * 0.393701;
      
      // Layer Volume per unit length
      calculatedVariables.layerVolume.value = 
        (p.chamberA.value * p.chamberB.value) - (p.chamberD.value * (p.chamberA.value - p.chamberC.value));
      calculatedVariables.layerVolume.imperialValue = calculatedVariables.layerVolume.value * 0.155;
      
      // Layer Dead load per unit length
      calculatedVariables.layerDeadLoad.value = 
        p.concreteDensity.value * calculatedVariables.layerVolume.value * 0.0000160185;
      calculatedVariables.layerDeadLoad.imperialValue = 
        calculatedVariables.layerDeadLoad.value * 5.59974;
      
      // Total Linear Wall Length
      calculatedVariables.totalWallLength.value = 4 * p.singleWallLength.value;
      calculatedVariables.totalWallLength.imperialValue = 
        calculatedVariables.totalWallLength.value * 0.393701;
      
      // Total Wall Height
      calculatedVariables.totalWallHeight.value = p.chamberA.value * p.numberOfLayers.value;
      calculatedVariables.totalWallHeight.imperialValue = 
        calculatedVariables.totalWallHeight.value * 0.393701;
      
      // Chamber Volume
      calculatedVariables.chamberVolume.value = calculatedVariables.layerVolume.value * p.chamberE.value;
      calculatedVariables.chamberVolume.imperialValue = 
        calculatedVariables.chamberVolume.value * 0.0610237;
      
      // Total Wall Volume
      calculatedVariables.totalWallVolume.value = 
        calculatedVariables.layerVolume.value * calculatedVariables.totalWallLength.value;
      calculatedVariables.totalWallVolume.imperialValue = 
        calculatedVariables.totalWallVolume.value * 0.0610237;
      
      // Layer Mass for Full Footprint
      calculatedVariables.layerMass.value = 
        p.concreteDensity.value * calculatedVariables.totalWallVolume.value * 0.0000160185;
      calculatedVariables.layerMass.imperialValue = 
        calculatedVariables.layerMass.value * 2.20462;
      
      // Total Mass of Walls
      calculatedVariables.totalMass.value = calculatedVariables.layerMass.value * p.numberOfLayers.value;
      calculatedVariables.totalMass.imperialValue = 
        (calculatedVariables.totalMass.value * 2.20462) / 2000; // Converting to tons
      
      // Update concrete cost calculation with detailed breakdown
      const lbsOfConcrete = calculatedVariables.totalMass.value * 2.20462;
      const portlandCementCost = lbsOfConcrete * 0.04;
      const aggregatesCost = lbsOfConcrete * 0.015;
      calculatedVariables.concreteCost.value = portlandCementCost + aggregatesCost;
      
      // Linear Length Travelled
      calculatedVariables.linearLength.value = 
        calculatedVariables.totalWallLength.value * p.numberOfLayers.value;
      calculatedVariables.linearLength.imperialValue = 
        calculatedVariables.linearLength.value * 0.393701;
      
      // Layer Print Time
      calculatedVariables.layerPrintTime.value = 
        calculatedVariables.totalWallLength.value / p.travelRate.value;
      calculatedVariables.layerPrintTime.imperialValue = 
        calculatedVariables.layerPrintTime.value / 60;
      
      // Total Print Time
      calculatedVariables.totalPrintTime.value = 
        calculatedVariables.layerPrintTime.value * p.numberOfLayers.value;
      calculatedVariables.totalPrintTime.imperialValue = 
        calculatedVariables.totalPrintTime.value / 60;
    }

    return {
      parameters,
      validationErrors,
      calculatedVariables,
      formatLabel,
      updateCalculations,
      updateParameter
    }
  },
  mounted() {
    this.updateCalculations();
  }
}
</script>

<style scoped>
.admin-panel {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.parameters-section,
.calculated-section {
  background-color: #fff;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  margin-bottom: 20px;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
}

.form-group {
  position: relative;
  padding-bottom: 2rem;
  margin-bottom: 1.5rem;
}

.form-group label {
  display: block;
  margin-bottom: 5px;
  font-weight: bold;
}

.form-group input {
  width: 100%;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
  margin-bottom: 1.5rem;
}

.unit {
  position: absolute;
  right: 10px;
  top: 38px;
  color: #666;
}

.imperial {
  position: absolute;
  right: 10px;
  top: 60px;
  color: #666;
  font-size: 0.9em;
  font-style: italic;
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

.imperial-value {
  font-size: 0.9em;
  color: #666;
  margin-left: 8px;
}

.has-error input {
  border-color: #dc3545;
}

.error-message {
  color: #dc3545;
  font-size: 0.8em;
  margin-top: 4px;
  display: block;
}

.constraint-info {
  color: #666;
  font-size: 0.8em;
  margin-top: 4px;
  display: block;
  font-style: italic;
}
</style> 