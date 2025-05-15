<template>
  <div class="funds-container">
    <div class="card">
      <div class="card-body">
        <div class="d-flex justify-content-between align-items-center">
          <h5 class="card-title mb-0">Fondo recaudado</h5>
          <span class="amount">{{ formattedMainAmount }}</span>
        </div>
        
        <button 
          class="btn btn-link p-0 mt-2 d-flex align-items-center" 
          @click="toggleDetails"
          aria-expanded="false" 
          :aria-controls="'details-' + _uid"
        >
          <span>Detalles</span>
          <i class="ml-1" :class="showDetails ? 'bi bi-chevron-up' : 'bi bi-chevron-down'"></i>
        </button>
        
        <div v-if="showDetails" :id="'details-' + _uid" class="mt-3 details-section">
          <div class="d-flex justify-content-between mb-2">
            <span>Recaudación pendiente</span>
            <span class="text-muted">{{ formattedPending }}</span>
          </div>
          <div class="d-flex justify-content-between mb-2">
            <span>Fondo</span>
            <span class="text-muted">{{ formattedFund }}</span>
          </div>
          <div class="d-flex justify-content-between">
            <span>Ganancia</span>
            <span class="text-muted">{{ formattedProfit }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'FundsCollected',
  data() {
    return {
      showDetails: false,
      mainAmount: 20000000.00,
      pending: 16500.00,
      fund: 15000.00,
      profit: 1500.00
    }
  },
  computed: {
    formattedMainAmount() {
      return new Intl.NumberFormat('es-MX', { 
        style: 'currency', 
        currency: 'MXN' 
      }).format(this.mainAmount)
    },
    formattedPending() {
      return new Intl.NumberFormat('es-MX', { 
        style: 'currency', 
        currency: 'MXN' 
      }).format(this.pending)
    },
    formattedFund() {
      return new Intl.NumberFormat('es-MX', { 
        style: 'currency', 
        currency: 'MXN' 
      }).format(this.fund)
    },
    formattedProfit() {
      return new Intl.NumberFormat('es-MX', { 
        style: 'currency', 
        currency: 'MXN' 
      }).format(this.profit)
    }
  },
  methods: {
    toggleDetails() {
      this.showDetails = !this.showDetails
    }
  }
}
</script>

<style scoped>
.funds-container {
  max-width: 400px;
  margin: 0 auto;
}

.card {
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.card-title {
  font-size: 1.1rem;
  color: #333;
}

.amount {
  font-size: 1.3rem;
  font-weight: bold;
  color: #2c3e50;
}

.btn-link {
  color: #6c757d;
  text-decoration: none;
}

.btn-link:hover {
  color: #0056b3;
  text-decoration: none;
}

.details-section {
  border-top: 1px solid #eee;
  padding-top: 12px;
}
</style>