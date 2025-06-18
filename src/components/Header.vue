<template>
  <div class="head d-flex flex-column justify-content-center align-items-center">
    <div class="col-12 row p-0 m-0 d-flex justify-content-center align-items-center header-border">
    <div class="col-5 m-0 p-0 d-flex justify-content-start align-items-center">
      <ButtonBack class="col-3 ml-2 d-flex justify-content-center" v-if="!back" />
        <img v-else src="../assets/icons/Logo.svg" class="ms-5" style="margin-left: 35px; 
          width:32px; height:32px;" alt="Logo" />
    </div>
      <div class="col-7 row p-0 m-0 d-flex justify-content-end align-items-center">
        <button class=" btn btn-light border-0 mx-1 p-0 bg-transparent" @click="$router.push(`/wallet/${$route.params.id}`)">
        </button>
        <div class="px-1 m-0 mr-2 d-flex justify-content-end align-items-center" v-if="bell">
          <i class="bi bi-bell" style="font-size: 24px; width: 24px; height: 24px;"></i>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import ButtonBack from '../components/ButtonBack.vue'
import { useHeader } from '../scripts/Header.js'

const { back, bell, cuentaRegresiva, irwallet } = useHeader()

const wallet = ref(0)
</script>

<style scoped>
/*.header-border {
  border-bottom: 3px solid #000;
}*/
.head{
  height: 100%;
}
p {
  font-weight: 450;
  color: #000000;
  font-size: 1.1rem;
}
.ms-2 {
  margin-left: 0.5rem;
}
i{
  color: #000000;
}
</style>
