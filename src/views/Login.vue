<template>
    <div class="container d-flex justify-content-center align-items-center container-login">
        <div class="container col-12 col-sm-8 py-3 my-3 box-shadow">
            <header class="col-12 m-1 p-1 d-flex justify-content-center align-items-center">
                <h2 class="text-center m-0 p-0">Iniciar Sesión</h2>
            </header>
            <main class="col-12 m-0 p-0 d-flex flex-column justify-content-center align-items-center">
                <div class="col-12 m-3 d-flex justify-content-center">
                    <form>
                        <div class="mb-3">
                            <label for="exampleInputEmail1" class="form-label">Email address</label>
                            <input type="email" class="form-control" id="exampleInputEmail1" aria-describedby="emailHelp">
                        </div>
                        <div class="mb-3">
                            <label for="exampleInputPassword1" class="form-label">Password</label>
                            <input type="password" class="form-control" id="exampleInputPassword1">
                        </div>
                        <button type="submit" class="col-12 btn btn-enter">Submit</button>
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
.btn-enter{
    border: #000000 solid 2px;
    box-shadow: #000000 2px 2px 2px;
    border-radius: 6px;
    background-color: #ffc107; /* Color original */
    color: #000000; /* Texto negro */
}
.container-login{
    height: 100vh;
    width: 100%;
}
</style>