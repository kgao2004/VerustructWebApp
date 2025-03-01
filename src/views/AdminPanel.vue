<template>
  <div class="admin-panel">
    <h1>Admin Panel</h1>
    
    <div class="parameters-section">
      <h2>System Parameters</h2>
      <div class="form-grid">
        <!-- Room shape selector -->
        <div class="form-group">
          <label for="roomShape">Room Shape:</label>
          <select 
            id="roomShape"
            v-model="parameters.roomShape.value"
            @change="updateParameter('roomShape', $event.target.value)"
          >
            <option 
              v-for="option in parameters.roomShape.options"
              :key="option.value"
              :value="option.value"
            >
              {{ option.label }}
            </option>
          </select>
        </div>

        <!-- Existing parameters -->
        <div 
          v-for="(param, key) in filteredParameters" 
          :key="key"
          class="form-group"
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
import { computed, watch } from 'vue'
import { useStore } from 'vuex'
import { useRouter } from 'vue-router'

// Add conversion constants
const CONVERSIONS = {
  cmToInch: 0.393701,
  cmToFeet: 0.0328084,
  cmToYard: 0.0109361,
  kgToLbs: 2.20462,
  cubicCmToCubicInch: 0.0610237,
  squareCmToSquareInch: 0.155,
  cm2ToIn2: 0.155,
  cm3ToIn3: 0.0610237,
  pcfToKgCm3: 0.0000160185
}

export default {
  name: 'AdminPanel',
  setup() {
    const store = useStore()
    
    const parameters = computed(() => store.state.systemParameters)
    const validationErrors = computed(() => store.state.validationErrors)
    
    // Calculate number of layers as a computed property
    const numberOfLayers = computed(() => {
      const p = parameters.value;
      return Math.ceil(parseFloat(p.totalWallHeight.value) / p.chamberA.value);
    })

    // Watch for changes in parameters and update calculations
    watch(parameters, () => {
      updateCalculations()
    }, { deep: true })

    const updateParameter = (key, value) => {
      // Convert string to number if needed
      const numValue = typeof value === 'string' ? parseFloat(value) : value;
      if (!isNaN(numValue)) {
        store.commit('updateParameter', { key, value: numValue });
        updateCalculations();
      }
    }

    const calculatedVariables = {
      numberOfLayers: { 
        get value() { return numberOfLayers.value }, 
        unit: 'layers' 
      },
      wallWidth: { value: 0, unit: 'cm', imperialValue: 0, imperialUnit: 'in' },
      layerVolume: { value: 0, unit: 'cm²', imperialValue: 0, imperialUnit: 'in²' },
      layerDeadLoad: { value: 0, unit: 'kg/cm', imperialValue: 0, imperialUnit: 'lb/in' },
      totalWallLength: { value: 0, unit: 'cm', imperialValue: 0, imperialUnit: 'in' },
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

    // Filter out parameters we don't want to show as regular inputs
    const filteredParameters = computed(() => {
      const params = { ...parameters.value };
      delete params.roomShape;
      return params;
    });

    const updateCalculations = () => {
      const p = parameters.value;
      
      // Wall total width: w+2b
      calculatedVariables.wallWidth.value = p.wallGap.value + (2 * p.chamberB.value);
      calculatedVariables.wallWidth.imperialValue = 
        calculatedVariables.wallWidth.value * CONVERSIONS.cmToInch;
      
      // Layer Volume per unit length: (a×b)−(d×(a−c))
      calculatedVariables.layerVolume.value = 
        (p.chamberA.value * p.chamberB.value) - (p.chamberD.value * (p.chamberA.value - p.chamberC.value));
      calculatedVariables.layerVolume.imperialValue = 
        calculatedVariables.layerVolume.value * CONVERSIONS.cm2ToIn2;
      
      // Layer Dead load per unit length: ρ×Layer Volume
      calculatedVariables.layerDeadLoad.value = 
        p.concreteDensity.value * calculatedVariables.layerVolume.value * CONVERSIONS.pcfToKgCm3;
      calculatedVariables.layerDeadLoad.imperialValue = 
        calculatedVariables.layerDeadLoad.value * 5.59974;
      
      // Total Linear Wall Length: T = (2*Single Wall Length) + (2*Single Wall Width)
      calculatedVariables.totalWallLength.value = 
        (2 * p.singleWallLength.value) + (2 * p.singleWallWidth.value);
      calculatedVariables.totalWallLength.imperialValue = 
        calculatedVariables.totalWallLength.value * CONVERSIONS.cmToInch;
      
      // Chamber Volume: ((a×b)−(d×(a−c)))×e
      calculatedVariables.chamberVolume.value = 
        calculatedVariables.layerVolume.value * p.chamberE.value;
      calculatedVariables.chamberVolume.imperialValue = 
        calculatedVariables.chamberVolume.value * CONVERSIONS.cm3ToIn3;
      
      // Total Wall Volume: ((a×b)−(d×(a−c)))×T
      calculatedVariables.totalWallVolume.value = 
        calculatedVariables.layerVolume.value * calculatedVariables.totalWallLength.value;
      calculatedVariables.totalWallVolume.imperialValue = 
        calculatedVariables.totalWallVolume.value * CONVERSIONS.cm3ToIn3;
      
      // Layer Mass for Full Footprint: ρ×Total Wall Volume
      calculatedVariables.layerMass.value = 
        p.concreteDensity.value * calculatedVariables.totalWallVolume.value * CONVERSIONS.pcfToKgCm3;
      calculatedVariables.layerMass.imperialValue = 
        calculatedVariables.layerMass.value * CONVERSIONS.kgToLbs;
      
      // Total Mass of Walls: Layer Mass×n
      calculatedVariables.totalMass.value = 
        calculatedVariables.layerMass.value * calculatedVariables.numberOfLayers.value;
      calculatedVariables.totalMass.imperialValue = 
        (calculatedVariables.totalMass.value * CONVERSIONS.kgToLbs) / 2000; // Converting to tons
      
      // Concrete Cost Estimate: Total Mass in lbs×0.02
      calculatedVariables.concreteCost.value = 
        calculatedVariables.totalMass.value * CONVERSIONS.kgToLbs * 0.02;
      
      // Linear Length Travelled: T×n
      calculatedVariables.linearLength.value = 
        calculatedVariables.totalWallLength.value * calculatedVariables.numberOfLayers.value;
      calculatedVariables.linearLength.imperialValue = 
        calculatedVariables.linearLength.value * CONVERSIONS.cmToInch;
      
      // Layer Print Time: T/v
      calculatedVariables.layerPrintTime.value = 
        calculatedVariables.totalWallLength.value / p.travelRate.value; // seconds
      calculatedVariables.layerPrintTime.imperialValue = 
        calculatedVariables.layerPrintTime.value / 60; // minutes
      
      // Total Print Time: Layer print time * n
      calculatedVariables.totalPrintTime.value = 
        calculatedVariables.layerPrintTime.value * calculatedVariables.numberOfLayers.value;
      calculatedVariables.totalPrintTime.imperialValue = 
        calculatedVariables.totalPrintTime.value / 60; // minutes
    }

    // Call updateCalculations immediately in setup
    updateCalculations()

    return {
      parameters,
      filteredParameters,
      validationErrors,
      calculatedVariables,
      formatLabel,
      updateCalculations,
      updateParameter
    }
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

.checkbox-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.checkbox-group label {
  display: flex;
  align-items: center;
  gap: 8px;
}

.checkbox-group input[type="checkbox"] {
  width: auto;
  margin: 0;
}

.info-text {
  font-size: 0.9em;
  color: #666;
  font-style: italic;
}
</style> 