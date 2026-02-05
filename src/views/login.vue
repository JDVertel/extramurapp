<template>
<div class="login-layout">
    <div class="login-left-panel"></div>
    <div class="login-right-panel">
        <div class="card p-4 shadow" style="max-width: 400px; width: 100%">
            <img src="@/assets/images/logo_extramurapp.png" alt="Logo Extramuralapp" class="login-logo-bg" />
            <h2 class="text-center mb-4">Iniciar Sesión</h2>
            <form @submit.prevent="handleLogin">
                <div class="mb-3">
                    <i class="bi bi-person-circle text-center"></i>
                    <label for="email" class="form-label"> Email</label>
                    <input v-model="email" type="email" class="form-control" id="email" placeholder="Ingresa tu email" autocomplete="username" required />
                </div>
                <div class="mb-3">
                    <i class="bi bi-key"></i>
                    <label for="password" class="form-label"> Contraseña</label>
                    <input v-model="password" type="password" class="form-control" id="password" placeholder="Ingresa tu contraseña" autocomplete="current-password" required />
                </div>
                <button type="submit" class="buttonLogin mb-3 w-100">Entrar</button>
            </form>
            <p v-if="errorMessage" class="text-danger mt-3">{{ errorMessage }}</p>

        <!--     <div class="row">
                <div class="col-5">enfermeralinarussoflorez@gmail.com</div>
                <div class="col-4">Linarusso*2025.</div>
                <div class="col-3">Admin</div>
            </div>
            <div class="row">
                <div class="col-5">juandavidvertelh@gmail.com</div>
                <div class="col-4">1234567890</div>
                <div class="col-3">med</div>
            </div>
            <div class="row">
                <div class="col-5">correolinarussoflorez@hotmail.es</div>
                <div class="col-4">Linarusso*2025.</div>
                <div class="col-3">enfermera</div>
            </div>
            <div class="row">
                <div class="col-5">juandavidvertel@hotmail.com</div>
                <div class="col-4">1111111111</div>
                <div class="col-3">aux</div>
            </div>
            <div class="row">
                <div class="col-5">Juliettmunoz20@gmail.com</div>
                <div class="col-4">1096183730ju</div>
                <div class="col-3">Fact</div>
            </div> -->

        </div>
    </div>
</div>
</template>

<script>
import firebase_api from "@/api/ApiFirebase";
import {
    signInWithEmailAndPassword
} from "firebase/auth";
import {
    auth
} from "@/api/firebase"; // Tu instancia de auth inicializada en firebase.js
import {} from "@/api/ApiFirebase";

export default {
    name: "App",
    data() {
        return {
            email: "",
            password: "",
            errorMessage: "",
            logueado: false,
            userData: {
                rol: null, // o un valor por defecto
            },
        };
    },
    methods: {
        async handleLogin() {
            this.errorMessage = "";
            try {
                const userCredential = await signInWithEmailAndPassword(
                    auth,
                    this.email,
                    this.password
                );
                const user = userCredential.user;
                const token = await user.getIdToken();
                const uid = user.uid;

                if (!token) {
                    throw new Error("No se recibió token de autenticación");
                }

                // Guardar token y uid en el store Vuex
                this.$store.dispatch("login", {
                    token,
                    uid,
                });

                // Opcional: también guardar en localStorage si quieres persistencia
                localStorage.setItem("token", token);
                localStorage.setItem("uid", uid);

                // Redirigir al dashboard
                this.$router.push("/homeviews");
            } catch (error) {
                if (error.code) {
                    switch (error.code) {
                        case "auth/user-not-found":
                            this.errorMessage = "Usuario no encontrado.";
                            break;
                        case "auth/wrong-password":
                            this.errorMessage = "Contraseña incorrecta.";
                            break;
                        case "auth/invalid-email":
                            this.errorMessage = "Email inválido.";
                            break;
                        default:
                            this.errorMessage = error.message;
                    }
                } else {
                    this.errorMessage = "Error al iniciar sesión. Intenta de nuevo.";
                }
                console.error("Error en login:", error);
            }
        },
    },

    mounted() {
        const token = localStorage.getItem("token");
        if (token) {
            this.$router.push("/homeviews");
        }
    },
};
</script>

<style scoped>
html,
body {
    height: 100vh;
    margin: 0;
    padding: 0;
    overflow: hidden !important;
}

.login-layout {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    display: flex;
}

.login-left-panel {
    width: 70vw;
    height: 100vh;
    background: url("@/assets/images/fondo_extramurapp.jpg");
    background-size: cover;
    background-position: center center;
    background-repeat: no-repeat;
    background-attachment: fixed;
}

.login-right-panel {
    width: 30vw;
    height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    background: #fff;
}

.login-right-panel .card {
    margin-right: 2vw;
}

@media (max-width: 767px) {
    .login-left-panel {
        display: none !important;
    }

    .login-right-panel {
        width: 100vw;
        height: 100vh;
        background: url("@/assets/images/fondo_extramurapp.jpg");
        background-size: cover;
        background-position: center center;
        background-repeat: no-repeat;
        background-attachment: fixed;
        display: flex;
        align-items: center;
        justify-content: center;
        overflow: hidden !important;
    }

    .login-right-panel .card {
        margin: 0;
        background: rgba(255, 255, 255, 0.95);
        box-shadow: 0 0 24px 0 rgba(0, 0, 0, 0.12);
        width: 90vw;
        max-width: 400px;
        position: relative;
        left: 0;
        right: 0;
    }
}
</style>
