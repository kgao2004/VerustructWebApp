import { createStore } from 'vuex'

// Hardcoded admin credentials for testing
const ADMIN_CREDENTIALS = {
  email: 'admin@example.com',
  password: 'admin123'
}

// Validation rules and constraints
const CONSTRAINTS = {
  chamberA: {
    min: 6.7,
    message: 'Must be greater than 6.7 cm to accommodate supply plumbing with 2x safety factor'
  },
  wallGap: {
    min: 6.7,
    message: 'Must be greater than 6.7 cm to accommodate supply plumbing with 2x safety factor'
  },
  concreteDensity: {
    min: 50,
    max: 120,
    message: 'Must be between 50-120 pcf'
  },
  numberOfLayers: {
    // For 10 ft height (2 ft above standard 8 ft ceiling)
    // Converting 10 ft to cm and dividing by chamber A height
    calculate: (chamberA) => Math.ceil((304.8) / chamberA),
    message: 'Calculated based on desired 10 ft wall height'
  }
}

// Add conversion functions
const CONVERSIONS = {
  cmToInch: 0.393701,
  pcfToKgCm3: 0.0000160185,
  cm2ToIn2: 0.155,
  cm3ToIn3: 0.0610237
}

export default createStore({
  state: {
    isAuthenticated: false,
    user: null,
    systemParameters: {
      chamberA: { 
        value: 7, 
        type: 'number', 
        unit: 'cm', 
        getImperial: (val) => `${(val * CONVERSIONS.cmToInch).toFixed(2)} in`,
        constraints: CONSTRAINTS.chamberA
      },
      chamberB: { 
        value: 10, 
        type: 'number', 
        unit: 'cm', 
        getImperial: (val) => `${(val * CONVERSIONS.cmToInch).toFixed(2)} in`
      },
      chamberC: { 
        value: 4, 
        type: 'number', 
        unit: 'cm', 
        getImperial: (val) => `${(val * CONVERSIONS.cmToInch).toFixed(2)} in`
      },
      chamberD: { 
        value: 4, 
        type: 'number', 
        unit: 'cm', 
        getImperial: (val) => `${(val * CONVERSIONS.cmToInch).toFixed(2)} in`
      },
      chamberE: { 
        value: 30, 
        type: 'number', 
        unit: 'cm', 
        getImperial: (val) => `${(val * CONVERSIONS.cmToInch).toFixed(2)} in`
      },
      wallGap: { 
        value: 7, 
        type: 'number', 
        unit: 'cm', 
        getImperial: (val) => `${(val * CONVERSIONS.cmToInch).toFixed(2)} in`,
        constraints: CONSTRAINTS.wallGap
      },
      concreteDensity: { 
        value: 120, 
        type: 'number', 
        unit: 'pcf', 
        getImperial: (val) => `${(val * CONVERSIONS.pcfToKgCm3).toFixed(5)} kg/cm³`,
        constraints: CONSTRAINTS.concreteDensity
      },
      travelRate: { 
        value: 0.833, 
        type: 'number', 
        unit: 'cm/s', 
        getImperial: (val) => `${(val * CONVERSIONS.cmToInch).toFixed(3)} in/s`
      },
      singleWallLength: { 
        value: 300, 
        type: 'number', 
        unit: 'cm', 
        getImperial: (val) => `${(val * CONVERSIONS.cmToInch).toFixed(2)} in`
      },
      numberOfRooms: { value: 1, type: 'number', unit: 'rooms' },
      numberOfLayers: { 
        value: 10, 
        type: 'number', 
        unit: 'layers',
        constraints: CONSTRAINTS.numberOfLayers
      }
    },
    validationErrors: {}
  },
  mutations: {
    setAuthenticated(state, value) {
      state.isAuthenticated = value;
    },
    setUser(state, user) {
      state.user = user;
    },
    updateParameter(state, { key, value }) {
      state.systemParameters[key].value = value;
      
      // Validate the new value
      if (state.systemParameters[key].constraints) {
        const constraints = state.systemParameters[key].constraints;
        if (constraints.min && value < constraints.min) {
          state.validationErrors[key] = constraints.message;
        } else if (constraints.max && value > constraints.max) {
          state.validationErrors[key] = constraints.message;
        } else {
          delete state.validationErrors[key];
        }
      }

      // Update number of layers when chamber A changes
      if (key === 'chamberA') {
        const numberOfLayers = CONSTRAINTS.numberOfLayers.calculate(value);
        state.systemParameters.numberOfLayers.value = numberOfLayers;
      }
    }
  },
  actions: {
    async login({ commit }, credentials) {
      // Simulated API delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Check against hardcoded credentials
      if (credentials.email === ADMIN_CREDENTIALS.email && 
          credentials.password === ADMIN_CREDENTIALS.password) {
        const user = {
          email: credentials.email,
          role: 'admin',
          name: 'Admin User'
        };
        commit('setUser', user);
        commit('setAuthenticated', true);
        // Store auth state in localStorage to persist across refreshes
        localStorage.setItem('user', JSON.stringify(user));
        localStorage.setItem('isAuthenticated', 'true');
        return true;
      }
      return false;
    },
    logout({ commit }) {
      commit('setUser', null);
      commit('setAuthenticated', false);
      localStorage.removeItem('user');
      localStorage.removeItem('isAuthenticated');
    },
    // Initialize auth state from localStorage
    initAuth({ commit }) {
      const user = JSON.parse(localStorage.getItem('user'));
      const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';
      
      if (user && isAuthenticated) {
        commit('setUser', user);
        commit('setAuthenticated', true);
      }
    }
  },
  getters: {
    isAdmin: state => state.user?.role === 'admin'
  }
}) 