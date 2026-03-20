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
                <div v-if="!recuperacionEnviada" class="text-center mb-2">
                    <button type="button" class="btn btn-link p-0 link-recuperar" @click="toggleRecuperarContrasena">
                        {{ mostrarRecuperarContrasena ? 'Ocultar recuperación de contraseña' : '¿Olvidaste tu contraseña?' }}
                    </button>
                </div>
                <div v-if="mostrarRecuperarContrasena && !recuperacionEnviada" class="alert alert-light border mt-2 mb-2 py-3">
                    <h6 class="mb-2"><i class="bi bi-envelope"></i> Recuperar contraseña</h6>
                    <p class="mb-2 small text-muted">
                        Ingresa tu correo electrónico y te enviaremos un enlace de recuperación.
                    </p>
                    <p class="mb-2 small text-muted">
                        Si no lo ves en bandeja de entrada, revisa la carpeta de SPAM o correo no deseado.
                    </p>
                    <div class="mb-2">
                        <label for="reset-email" class="form-label">Correo electrónico</label>
                        <input v-model.trim="resetEmail" type="email" class="form-control" id="reset-email"
                            placeholder="tu@email.com" autocomplete="email" />
                    </div>
                    <div class="mb-2">
                        <label for="captcha-recuperacion" class="form-label"><i class="bi bi-shield-check"></i> Verificación</label>
                        <div class="captcha-wrapper">
                            <div class="captcha-box">{{ captchaPregunta }}</div>
                            <button type="button" class="btn btn-sm btn-outline-secondary" @click="generarCaptcha"
                                title="Generar nuevo captcha">
                                <i class="bi bi-arrow-repeat"></i>
                            </button>
                        </div>
                        <input v-model.trim="captchaInput" type="text" class="form-control mt-2" id="captcha-recuperacion"
                            placeholder="Resuelve la operación" />
                    </div>
                    <button type="button" class="btn btn-outline-primary w-100" :disabled="enviandoRecuperacion"
                        @click="enviarRecuperacionContrasena">
                        {{ enviandoRecuperacion ? 'Enviando...' : 'Enviar correo de recuperación' }}
                    </button>

                    <div v-if="mensajeRecuperacion" class="alert alert-success mt-3 mb-0 py-2" role="alert">
                        <i class="bi bi-check-circle-fill me-2"></i>
                        {{ mensajeRecuperacion }}
                    </div>
                    <div v-if="errorRecuperacion" class="alert alert-danger mt-3 mb-0 py-2" role="alert">
                        <i class="bi bi-exclamation-triangle-fill me-2"></i>
                        {{ errorRecuperacion }}
                    </div>
                </div>
                <div v-if="recuperacionEnviada && mensajeRecuperacion" class="alert alert-success mt-2 mb-2 py-2" role="alert">
                    <i class="bi bi-check-circle-fill me-2"></i>
                    {{ mensajeRecuperacion }}
                </div>
                <div v-if="errorMessage" class="alert alert-danger d-flex align-items-center mt-3 py-2" role="alert">
                    <i class="bi bi-exclamation-triangle-fill me-2 fs-5"></i>
                    <span>{{ errorMessage }}</span>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import {
    signInWithEmailAndPassword,
    sendPasswordResetEmail,
} from "firebase/auth";
import {
    auth,
    db
} from "@/api/firebase"; // Tu instancia de auth inicializada en firebase.js
import {
    collection,
    getDocs,
} from "firebase/firestore";

export default {
    name: "App",
    data() {
        return {
            email: "",
            password: "",
            errorMessage: "",
            errorRecuperacion: "",
            mensajeRecuperacion: "",
            resetEmail: "",
            enviandoRecuperacion: false,
            mostrarRecuperarContrasena: false,
            recuperacionEnviada: false,
            captchaPregunta: "",
            captchaRespuesta: "",
            captchaInput: "",
            logueado: false,
            userData: {
                rol: null, // o un valor por defecto
            },
        };
    },
    methods: {
        async correoExisteEnBD(correo) {
            const correoNormalizado = String(correo || "").trim().toLowerCase();
            if (!correoNormalizado) return false;

            const usersSnapshot = await getDocs(collection(db, "users"));
            return usersSnapshot.docs.some((docItem) =>
                String(docItem.data()?.email || "").trim().toLowerCase() === correoNormalizado
            );
        },

        generarCaptcha() {
            const a = Math.floor(Math.random() * 8) + 2;
            const b = Math.floor(Math.random() * 8) + 1;
            const operador = Math.random() > 0.5 ? "+" : "-";

            if (operador === "+") {
                this.captchaPregunta = `Cuanto es ${a} + ${b}?`;
                this.captchaRespuesta = String(a + b);
                return;
            }

            const mayor = Math.max(a, b);
            const menor = Math.min(a, b);
            this.captchaPregunta = `Cuanto es ${mayor} - ${menor}?`;
            this.captchaRespuesta = String(mayor - menor);
        },

        validarCaptcha() {
            return String(this.captchaInput || "").trim() === String(this.captchaRespuesta || "").trim();
        },

        limpiarCacheRecuperacion() {
            this.resetEmail = "";
            this.errorRecuperacion = "";
            this.enviandoRecuperacion = false;
        },

        toggleRecuperarContrasena() {
            this.mostrarRecuperarContrasena = !this.mostrarRecuperarContrasena;
            this.errorRecuperacion = "";
            this.mensajeRecuperacion = "";
            this.recuperacionEnviada = false;
            this.captchaInput = "";
            this.generarCaptcha();

            if (this.mostrarRecuperarContrasena && !this.resetEmail && this.email) {
                this.resetEmail = this.email;
            }
        },

        async enviarRecuperacionContrasena() {
            this.errorRecuperacion = "";
            this.mensajeRecuperacion = "";

            const correo = String(this.resetEmail || "").trim();
            if (!correo) {
                this.errorRecuperacion = "Debes ingresar un correo electrónico para recuperar la contraseña.";
                return;
            }

            if (!this.validarCaptcha()) {
                this.errorRecuperacion = "Verificación incorrecta. Resuelve el captcha para continuar.";
                this.captchaInput = "";
                this.generarCaptcha();
                return;
            }

            let existeCorreo = false;
            try {
                existeCorreo = await this.correoExisteEnBD(correo);
            } catch (error) {
                this.errorRecuperacion = "No fue posible validar el correo en la base de datos. Intenta nuevamente.";
                console.error("Error validando correo en BD:", error);
                return;
            }

            if (!existeCorreo) {
                this.errorRecuperacion = "El correo ingresado no existe en la base de datos.";
                return;
            }

            this.enviandoRecuperacion = true;
            try {
                await sendPasswordResetEmail(auth, correo);
                this.mensajeRecuperacion = "Correo de recuperación enviado correctamente. El enlace tiene una validez de 1 hora. Si no aparece en bandeja de entrada, revisa SPAM o correo no deseado.";
                this.recuperacionEnviada = true;
                this.mostrarRecuperarContrasena = false;
                this.limpiarCacheRecuperacion();
            } catch (error) {
                if (error?.code === "auth/invalid-email") {
                    this.errorRecuperacion = "El correo electrónico no tiene un formato válido.";
                } else if (error?.code === "auth/too-many-requests") {
                    this.errorRecuperacion = "Demasiados intentos. Espera unos minutos antes de volver a intentarlo.";
                } else {
                    this.errorRecuperacion = "No se pudo enviar el correo de recuperación. Intenta nuevamente.";
                }
                console.error("Error al enviar recuperación de contraseña:", error);
            } finally {
                this.enviandoRecuperacion = false;
            }
        },

        async handleLogin() {
            this.errorMessage = "";

            const correo = String(this.email || "").trim();
            if (!correo) {
                this.errorMessage = "Debes ingresar un correo electrónico.";
                return;
            }

            try {
                const existeCorreo = await this.correoExisteEnBD(correo);
                if (!existeCorreo) {
                    this.errorMessage = "El correo ingresado no existe en la base de datos.";
                    return;
                }
            } catch (error) {
                this.errorMessage = "No fue posible validar el correo en la base de datos. Intenta nuevamente.";
                console.error("Error validando correo en BD:", error);
                return;
            }

            try {
                const userCredential = await signInWithEmailAndPassword(
                    auth,
                    correo,
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
                        case "auth/invalid-credential":
                        case "auth/user-not-found":
                        case "auth/wrong-password":
                            this.errorMessage = "Credenciales incorrectas. Verifica tu correo y contraseña.";
                            break;
                        case "auth/invalid-email":
                            this.errorMessage = "El formato del correo electrónico no es válido.";
                            break;
                        case "auth/user-disabled":
                            this.errorMessage = "Esta cuenta ha sido deshabilitada. Contacta al administrador.";
                            break;
                        case "auth/too-many-requests":
                            this.errorMessage = "Demasiados intentos fallidos. Espera unos minutos antes de intentarlo de nuevo.";
                            break;
                        case "auth/network-request-failed":
                            this.errorMessage = "Error de red. Verifica tu conexión a internet.";
                            break;
                        default:
                            this.errorMessage = "Error al iniciar sesión. Intenta de nuevo.";
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

.link-recuperar {
    font-size: 0.95rem;
    text-decoration: none;
}

.link-recuperar:hover {
    text-decoration: underline;
}

.captcha-wrapper {
    display: flex;
    align-items: center;
    gap: 8px;
}

.captcha-box {
    flex: 1;
    border: 1px dashed #6c757d;
    border-radius: 8px;
    background: #f8f9fa;
    padding: 8px 10px;
    font-weight: 600;
    color: #495057;
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
