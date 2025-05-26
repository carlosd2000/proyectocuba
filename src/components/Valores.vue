<template>
  <div class="col-12 m-0 p-0">
    <div @click="toggleDetails" class="col-12 card-body m-0 p-0 d-flex flex-column justify-content-center align-items-center">
      <div class="col-11 m-0 my-2 p-0 d-flex flex-column justify-content-center align-items-center">
        <div class="col-12 m-0 p-0 d-flex flex-column justify-content-between align-items-center">
          
          <div class="d-flex justify-content-center align-items-center">
            <h5 class="card-title m-0 p-0">Fondo recaudado</h5>
          </div>
          <div class="d-flex justify-content-center align-items-center">
            <h5 class="dollar">$<span class="amount">{{ formattedMainAmount }}</span></h5>
          </div>
        </div>
        <div v-if="showDetails" :id="'details-' + _uid" class="col-12 details-section my-2 p-0">
          <div class="">
            <div class="recaudacion d-flex justify-content-between mb-2">
              <span class="text-span">Recaudación pendiente</span>
              <span class="text-span">{{ formattedPending }}</span>
            </div>
            <div class="contable">
              <div class="m-0 p-0 d-flex justify-content-between">
                <span class="text-span">Fondo</span>
                <span class="text-span">{{ formattedFund }}</span>
              </div>
              <div class="m-0 p-0 d-flex justify-content-between">
                <span class="text-span">Ganancia</span>
                <span class="text-span">{{ formattedProfit }}</span>
              </div>
            </div>
          </div>
        </div>
        <i class="detalles" :class="showDetails ? 'bi bi-chevron-up' : 'bi bi-chevron-down'"></i>
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
      mainAmount: 2000000000.00,
      pending: 16500.00,
      fund: 15000.00,
      profit: 1500.00
    }
  },
  computed: {
    formattedMainAmount() {
      return new Intl.NumberFormat('es-MX', { 
        style: 'decimal' 
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

.card-body {
  border: 3px solid hsl(0, 0%, 0%);
  border-radius: 0px 0px 10px 10px;
  box-shadow: 0px 2px 4px rgba(0, 0, 0, 0.716);
  background-color: #ffbf00;
}

.card-title {
  font-size: 0.9rem;
}

h5.dollar {
  font-size: 0.9rem;
  font-weight: bold;

}

.text-span {
  font-size: 0.9rem;
}

.detalles {
  color: #000; 
  text-shadow: 0 0 1.5px #000;
}

.amount {
  font-size: 1.8rem;
  font-weight: bold;
  color: #000000;
}

.recaudacion{
  border-bottom: 2px dotted #000000;
}

.details-section {
  border-top: 2px solid hsl(0, 0%, 0%);
  border-bottom: 2px solid hsl(0, 0%, 0%);
}
</style>