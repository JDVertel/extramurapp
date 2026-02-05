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
    <!-- <navbar /> -->
    <router-view />
</div>
</template>

<style>

</style>
