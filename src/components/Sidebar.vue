<template>
    <div class="sidebar">
      <h2>Select Shape</h2>
      <ul>
        <li v-for="shape in shapes" :key="shape" @click="selectShape(shape)">
          {{ shape }}
        </li>
      </ul>
  
      <div v-if="selectedShape">
        <h3>{{ selectedShape }} Dimensions</h3>
        <div v-for="(label, key) in getInputsForShape(selectedShape)" :key="key">
          <label>{{ label }}: </label>
          <input v-model="dimensions[key]" type="number" />
        </div>
  
        <div>
          <label>Wall Height:</label>
          <input v-model="dimensions.height" type="number" />
        </div>
  
        <button @click="submit">Visualize</button>
      </div>
    </div>
  </template>
  
  <script>
  export default {
    data() {
      return {
        shapes: ['Rectangle', 'Square', 'Triangle', 'Trapezoid'],
        selectedShape: null,
        dimensions: {},
      };
    },
    methods: {
      selectShape(shape) {
        this.selectedShape = shape;
        this.dimensions = {};
      },
      getInputsForShape(shape) {
        switch (shape) {
          case 'Rectangle':
            return { a: 'Length (a)', b: 'Width (b)' };
          case 'Square':
            return { a: 'Side (a)' };
          case 'Triangle':
            return { a: 'Base (a)', b: 'Height (b)' };
          case 'Trapezoid':
            return { a: 'Base 1 (a)', b: 'Base 2 (b)', c: 'Height (c)' };
          default:
            return {};
        }
      },
      submit() {
        // Emit data to parent (App.vue or HomeView.vue)
        this.$emit('shape-submitted', {
          shape: this.selectedShape,
          dimensions: this.dimensions,
        });
      },
    },
  };
  </script>
  
  <style scoped>
  .sidebar {
    width: 250px;
    padding: 1rem;
    border-right: 1px solid #ccc;
  }
  .sidebar ul {
    list-style: none;
    padding: 0;
  }
  .sidebar li {
    cursor: pointer;
    margin: 5px 0;
    font-weight: bold;
  }
  </style>
  