<template>
    <div class="login-layout">
        <div class="login-container">
            <div class="card p-4 shadow login-card">
                <img src="@/assets/images/logo_extramurapp.png" alt="Logo Extramuralapp" class="login-logo-bg" />
                <h2 class="text-center mb-4">Iniciar Sesión</h2>
                <form @submit.prevent="handleLogin">
                    <div class="mb-3">
                        <label for="email" class="form-label"><i class="bi bi-person-circle text-center"></i>
                            Email</label>
                        <input v-model="email" type="email" class="form-control" id="email"
                            placeholder="Ingresa tu email" autocomplete="username" required />
                    </div>
                    <div class="mb-3">
                        <label for="password" class="form-label"><i class="bi bi-key"></i> Contraseña</label>
                        <input v-model="password" type="password" class="form-control" id="password"
                            placeholder="Ingresa tu contraseña" autocomplete="current-password" required />
                    </div>
                    <button type="submit" class="buttonLogin mb-3 w-100">Entrar</button>
                </form>
                <p v-if="errorMessage" class="text-danger mt-3">{{ errorMessage }}</p>
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
import { } from "@/api/ApiFirebase";

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
    background: url("@/assets/images/fondo_extramurapp.jpg");
    background-size: cover;
    background-position: center center;
    background-repeat: no-repeat;
    background-attachment: fixed;
    display: flex;
    align-items: center;
    justify-content: center;
}

.login-container {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 100%;
}

.login-card {
    max-width: 400px;
    width: 90%;
    background: #fff;
    border-radius: 15px;
    box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.3);
    border: 1px solid rgba(0, 0, 0, 0.1);
    opacity: 0.8;
}

.login-card h2 {
    font-size: 1.8rem;
    font-weight: 600;
    text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.login-card .form-label {
    font-size: 1.1rem;
    font-weight: 500;
}

.login-card .form-control {
    font-size: 1rem;
    padding: 0.75rem;
    height: auto;
}

.login-card .buttonLogin {
    font-size: 1.1rem;
    font-weight: 600;
    padding: 0.75rem;
}

.login-card p.text-danger {
    font-size: 1rem;
}

.login-logo-bg {
    display: block;
    margin: 0 auto 25px auto;
    max-width: 260px;
    width: 100%;
    height: auto;
    filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.15));
}

.login-card i.bi {
    margin-right: 8px;
    font-size: 1.3rem;
}

@media (max-width: 767px) {
    .login-layout {
        background-position: 20% center;
        align-items: flex-end;
        padding-bottom: 20px;
    }

    .login-container {
        align-items: flex-end;
        justify-content: center;
    }

    .login-card {
        width: 95%;
        max-width: 350px;
        margin: 0 20px 20px 20px;
    }
}
</style>
