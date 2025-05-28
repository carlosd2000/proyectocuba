<template>  
    <footer class="col-12 m-0 p-0">
        <div class="col-12 px-3 container d-flex justify-content-between align-items-center p-1">
            <div class="m-0 p-0 btn-color">
                <div class="d-flex justify-content-center align-items-center">
                    <i class="bi bi-house-door"></i>
                </div>
                <div class="d-flex justify-content-center align-items-center">
                    <p>Home</p>
                </div>
            </div>
            <div class="m-0 p-0 btn-color">
                <div class="d-flex justify-content-center align-items-center">
                    <i class="bi bi-card-list"></i>
                </div>
                <div class="d-flex justify-content-center align-items-center">
                    <p>Lista</p>
                </div>
            </div>
            <div class="m-0 p-0 btn-color">
                <div class="d-flex justify-content-center align-items-center">
                    <i class="bi bi-plus"></i>
                </div>
                <div class="d-flex justify-content-center align-items-center">
                    <p>Jugada</p>
                </div>
            </div>
            <div class="m-0 p-0 btn-color">
                <div class="d-flex justify-content-center align-items-center">
                    <i class="bi bi-wallet"></i>
                </div>
                <div class="d-flex justify-content-center align-items-center">
                    <p>Fondo</p>
                </div>
            </div>
            <div class="m-0 p-0 btn-color">
                <div class="d-flex justify-content-center align-items-center">
                    <i class="bi bi-person"></i>
                </div>
                <div class="d-flex justify-content-center align-items-center">
                    <p>Usuario</p>
                </div>
            </div>
        </div>
    </footer>
</template>

<style scoped>
    .container {
        max-width: 600px;
        border-top: 3px solid #000000;
    }
    .btn-color {
        background-color: #eeeeee;
        width: 14%;
        border-radius: 5px;
    }
    p{
        font-size: 0.6rem;
        margin: 0px;
    }
    i{
        color: #000; 
        text-shadow: 0 0 1.0px #000;
        font-size: 1.2rem;
    }
</style>