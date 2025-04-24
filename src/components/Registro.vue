<template>
    <div class="container vh-100 d-flex justify-content-center align-items-center">
      <div class="container col-12 col-sm-8 py-3 my-3 box-shadow">
        <header class="col-12 m-1 p-1 d-flex justify-content-center align-items-center">
          <h2 class="text-center m-0 p-0">Registro</h2>
        </header>
        <main class="col-12 m-0 p-0 d-flex flex-column justify-content-center align-items-center">
          <div class="col-12 m-3 d-flex justify-content-center">
            <form>
              <div class="mb-3">
                <label for="nombre" class="form-label">Nombre completo</label>
                <input type="text" class="form-control" id="nombre" placeholder="Tu nombre">
              </div>
              <div class="mb-3">
                <label for="email" class="form-label">Correo electrónico</label>
                <input type="email" class="form-control" id="email" placeholder="correo@ejemplo.com">
              </div>
              <div class="mb-3">
                <label for="password" class="form-label">Contraseña</label>
                <input type="password" class="form-control" id="password" placeholder="********">
              </div>
            <div class="mb-3">
                <label for="opciones" class="form-label">cual es tu tipo de cuenta</label>
                    <select class="form-select" id="opciones">
                        <option value="" selected disabled>Seleccionar</option>
                        <option value="opcion1">Banco</option>
                        <option value="opcion2">Colector</option>
                        <option value="opcion3">Listero</option>
                    </select>
            </div>

              <button type="submit" class="col-12 btn btn-enter">Registrarse</button>
  
              <!-- Nueva fila con link -->
              <div class="text-end mt-2">
                <a href="/login" class="text-primary">Iniciar sesión</a>
              </div>
            </form>
          </div>
        </main>
      </div>
    </div>
  </template>
  
  <style scoped>
  .box-shadow {
    border-radius: 6px;
    border: 2px solid #000000;
    box-shadow: 2px 3px 2px rgba(0, 0, 0, 0.853);
  }
  .btn-enter {
    border: #000000 solid 2px;
    box-shadow: #000000 2px 2px 2px;
    border-radius: 6px;
    background-color: #ffc107;
    color: #000000;
  }
  </style>
  