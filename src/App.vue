<script>
import Navbar from "./components/navbar.vue";

export default {
    components: {
        Navbar,
    },
    data() {
        return {
            isLoggedIn: !!localStorage.getItem("token") // estado reactivo inicial
        };
    },
    methods: {
        logout() {
            localStorage.removeItem("token");
            this.isLoggedIn = false; // actualizar reactivo para ocultar navbar
        },
        login(token) {
            localStorage.setItem("token", token);
            this.isLoggedIn = true; // actualizar reactivo para mostrar navbar
        }
    },



}
</script>

<template>
    <div id="app">
        <Navbar v-if="!$route.meta.hideNavbar" />
        <router-view v-slot="{ Component }">
            <transition name="fade" mode="out-in">
                <component :is="Component" />
            </transition>
        </router-view>
    </div>
</template>

<style>
* {
    box-sizing: border-box;
}

html,
body {
    margin: 0;
    padding: 0;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', sans-serif;
    background: #fff;
    color: #333;
    line-height: 1.6;
}

#app {
    width: 100%;
    min-height: 100vh;
    position: relative;
}

/* Transiciones para cambio de rutas */
.fade-enter-active,
.fade-leave-active {
    transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
    opacity: 0;
}

/* Mejoras generales para formularios */
.form-control {
    border-radius: 8px;
    border: 1px solid #e1e5e9;
    padding: 12px 15px;
    transition: all 0.2s ease;
}

.form-control:focus {
    border-color: #007bff;
    box-shadow: 0 0 0 0.2rem rgba(0, 123, 255, 0.25);
}

/* Cards mejorados */
.card {
    border: none;
    border-radius: 12px;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.08);
    transition: all 0.2s ease;
}

.card:hover {
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.12);
}

/* Scrollbar personalizado */
::-webkit-scrollbar {
    width: 8px;
}

::-webkit-scrollbar-track {
    background: #f1f1f1;
    border-radius: 10px;
}

::-webkit-scrollbar-thumb {
    background: #c1c1c1;
    border-radius: 10px;
}

::-webkit-scrollbar-thumb:hover {
    background: #a8a8a8;
}

/* Animación para elementos que aparecen */
@keyframes fadeInUp {
    from {
        opacity: 0;
        transform: translateY(20px);
    }

    to {
        opacity: 1;
        transform: translateY(0);
    }
}

.fade-in {
    animation: fadeInUp 0.5s ease-out;
}

/* Responsive utilities */
@media (max-width: 768px) {
    .container-fluid {
        padding-left: 15px;
        padding-right: 15px;
    }
}
</style>
