<script setup>
const props = defineProps({
    title: {
        type: String,
        default: null
    },
    tipo: {
        type: String,
        default: null
    },
    lista: {
        type: Object,
        default: () => ({ monto: '', numeros: [] })
    }
})

const emit = defineEmits(['eliminarNumero', 'editar', 'resetearMonto'])

const editar = () => {
    emit('editar', { 
        tipo: props.tipo,
        title: props.title,
    })
}

const eliminarNumero = (index) => {
    emit('eliminarNumero', { 
        tipo: props.tipo,
        title: props.title,
        index 
    })
    if (props.lista.numeros.length === 1) {
        emit('resetearMonto', {
            tipo: props.tipo,
            title: props.title
        })
    }
}
</script>
<template>
    <div v-if="lista.numeros && lista.numeros.length > 0" class="d-flex flex-column justify-content-start align-items-center gap-2 w-100">
        <div class="d-flex flex-row justify-content-between align-items-center gap-1 w-100">
            <h5 class="input-label">
                {{ tipo === 'Limitado' ? title +' limitado' : ' Números que no juegan' }}
            </h5>
            <h5 v-if="tipo === 'Limitado'" class="subtitle">
                ${{ lista.monto }}
            </h5>
        </div>
        <div class="d-flex flex-row justify-content-start align-items-center flex-wrap gap-1 w-100">
            <div v-for="value in lista.numeros" class="d-flex flex-row justify-content-start align-items-center">
                <div class="circle-numeros">
                    <h5 v-if="props.title !== 'Parlet'" class="small">
                        {{ value }}
                    </h5>
                    <div v-else class="d-flex flex-row justify-content-center align-items-center gap-1">
                        <h5 class="small">
                            {{ value[0] }}
                        </h5>
                        <h5 class="small">
                            -
                        </h5>
                        <h5 class="small">
                            {{ value[1] }}
                        </h5>
                    </div>
                    <img src="../assets/icons/Cerrar.svg" alt="" @click="eliminarNumero(index)" style="cursor: pointer;">
                </div>
            </div>
            <div class="circle-editar" @click="editar()">
                <img src="../assets/icons/Editar.svg" alt="">
            </div>
        </div>
    </div>
</template>
<style scoped>
.circle-numeros{
    box-sizing: border-box;
    display: flex;
    flex-direction: row;
    justify-content: center;
    align-items: center;
    padding: 8px;
    gap: 4px;
    height: 32px;
    background: #F3F3F3;
    border: 1px solid #F3F3F3;
    border-radius: 30px;
    flex: none;
    order: 0;
    flex-grow: 0;
}
.circle-editar{
    display: flex;
    flex-direction: row;
    justify-content: center;
    align-items: center;
    padding: 8px;
    gap: 4px;
    width: 32px;
    height: 32px;
    background: #E0E0F8;
    border-radius: 30px;
    flex: none;
    flex-grow: 0;
}
</style>