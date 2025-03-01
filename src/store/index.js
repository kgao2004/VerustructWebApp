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
  }
}

// Add conversion functions
const CONVERSIONS = {
  cmToInch: 0.393701,
  pcfToKgCm3: 0.0000160185,
  cm2ToIn2: 0.155,
  cm3ToIn3: 0.0610237,
  cmToFeet: 0.0328084
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
        value: 4, 
        type: 'number', 
        unit: 'cm/s', 
        getImperial: (val) => `${(val * CONVERSIONS.cmToInch).toFixed(3)} in/s`
      },
      singleWallLength: { 
        value: 685.8, // 270 inches in cm
        type: 'number', 
        unit: 'cm', 
        getImperial: (val) => `${(val * CONVERSIONS.cmToInch).toFixed(2)} in`
      },
      singleWallWidth: { 
        value: 685.8, // 270 inches in cm
        type: 'number', 
        unit: 'cm', 
        getImperial: (val) => `${(val * CONVERSIONS.cmToInch).toFixed(2)} in`
      },
      numberOfRooms: { value: 1, type: 'number', unit: 'rooms' },
      totalWallHeight: {
        value: '304.8', // 10 ft in cm
        type: 'select',
        options: [
          { value: '243.84', label: '8 ft' },
          { value: '304.8', label: '10 ft' },
          { value: '365.76', label: '12 ft' }
        ],
        unit: 'cm',
        getImperial: (val) => `${(parseFloat(val) * CONVERSIONS.cmToFeet).toFixed(0)} ft`
      },
      roomShape: {
        value: 'square',
        type: 'select',
        options: [
          { value: 'square', label: 'Square (270" × 270")' },
          { value: 'rectangle', label: 'Rectangle (360" × 270")' }
        ],
        unit: ''
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

      // Update wall dimensions when room shape changes
      if (key === 'roomShape') {
        if (value === 'square') {
          state.systemParameters.singleWallLength.value = 685.8;
          state.systemParameters.singleWallWidth.value = 685.8;
        } else {
          state.systemParameters.singleWallLength.value = 914.4;
          state.systemParameters.singleWallWidth.value = 685.8;
        }
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