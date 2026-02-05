<template>
<div class="app">
    <nav class="navbar bg-body-tertiary fixed-top">
        <div class="container-fluid">
            <!-- Botón toggler a la izquierda -->
            <button class="navbar-toggler me-2" type="button" data-bs-toggle="offcanvas" data-bs-target="#offcanvasNavbar" aria-controls="offcanvasNavbar" aria-label="Toggle navigation">
                <span class="navbar-toggler-icon"></span>
            </button>

            <div>
                <h6 v-if="userData" class="text-sm-end text-capitalize blanco">
                    {{ userData.nombre || "" }} /
                    {{ userData.cargo || "" }}
                </h6>
            </div>

            <!-- Offcanvas desde la izquierda -->
            <div class="offcanvas offcanvas-start" tabindex="-1" id="offcanvasNavbar" aria-labelledby="offcanvasNavbarLabel">
                <div class="offcanvas-header">
                    <div class="row">
                        <h6 class="offcanvas-title" id="offcanvasNavbarLabel">MENU</h6>
 
                    </div>

                    <button type="button" class="btn-close" data-bs-dismiss="offcanvas" aria-label="Close"></button>
                </div>

                <div class="offcanvas-body">
                    <ul class="navbar-nav justify-content-end flex-grow-1 pe-3">
                    <li class="nav-item" v-if="userData && (userData.cargo === 'Fact')">
                            <router-link class="nav-link" to="/sop_facturacion" @click="onNavLinkClick">
                                <i class="bi bi-person-circle"></i> Facturador
                            </router-link>
                        </li>

                        <li class="nav-item" v-if="userData && (userData.cargo === 'Auxiliar de enfermeria')">
                            <router-link class="nav-link" to="/sop_aux" @click="onNavLinkClick">
                                <i class="bi bi-person-circle"></i> Auxiliar
                            </router-link>
                        </li>
                        <li class="nav-item" v-if="userData && (userData.cargo === 'Auxiliar de enfermeria')">
                            <router-link class="nav-link" to="/sop_agendas" @click="onNavLinkClick">
                                <i class="bi bi-calendar2-date"></i> Agendas
                            </router-link>
                        </li>

                        <li class="nav-item" v-if="userData && (userData.cargo === 'Medico')">
                            <router-link class="nav-link" to="/sop_profesional" @click="onNavLinkClick">
                                <i class="bi bi-person-circle"></i> Medico
                            </router-link>
                        </li>
                        <li class="nav-item" v-if="userData && (userData.cargo === 'Enfermero')">
                            <router-link class="nav-link" to="/sop_enfermero" @click="onNavLinkClick">
                                <i class="bi bi-person-circle"></i> Enfermer@
                            </router-link>
                        </li>
                        <li class="nav-item" v-if="userData && (userData.cargo === 'Admin' )">
                            <router-link class="nav-link" to="/admin_informes" @click="onNavLinkClick">
                                <i class="bi bi-bar-chart-fill"></i> Informes
                            </router-link>
                        </li>
                        <li class="nav-item" v-if="userData && (userData.cargo === 'Medico')">
                            <router-link class="nav-link" to="/medico_informes" @click="onNavLinkClick">
                                <i class="bi bi-bar-chart-fill"></i> Informes
                            </router-link>
                        </li>
                        <li class="nav-item" v-if="userData && (userData.cargo === 'Auxiliar de enfermeria')">
                            <router-link class="nav-link" to="/aux_informes" @click="onNavLinkClick">
                                <i class="bi bi-bar-chart-fill"></i> Informes
                            </router-link>
                        </li>
                        <li class="nav-item" v-if="userData && ( userData.cargo === 'Enfermero' )">
                            <router-link class="nav-link" to="/enfermero_informes" @click="onNavLinkClick">
                                <i class="bi bi-bar-chart-fill"></i> Informes
                            </router-link>
                        </li>

                        <template v-if="userData && userData.cargo === 'admin'">
        

                            <li class="nav-item">
                                <router-link class="nav-link" to="/admin_programavisitas" @click="onNavLinkClick">
                                    <i class="bi bi-car-front"></i> Prog Visitas
                                </router-link>
                            </li>

                            <li class="nav-item">
                                <router-link class="nav-link" to="/registrousuarios" @click="onNavLinkClick">
                                    <i class="bi bi-person-fill"></i> Usuarios
                                </router-link>
                            </li>

                            <li class="nav-item">
                                <router-link class="nav-link" to="/admin_parametros" @click="onNavLinkClick">
                                    <i class="bi bi-sliders"></i> Parámetros
                                </router-link>
                            </li>

                            <li class="nav-item">
                                <router-link class="nav-link" to="/admin_informes" @click="onNavLinkClick">
                                    <i class="bi bi-file-earmark-medical"></i> Informes
                                </router-link>
                            </li>

                               <li class="nav-item">
                                <router-link class="nav-link" to="/admin_caracterizacion" @click="onNavLinkClick">
                                    <i class="bi bi-file-person"></i> Reg Caract
                                </router-link>
                            </li>

                            <li class="nav-item">
                                <router-link class="nav-link" to="/admin_ips" @click="onNavLinkClick">
                                    <i class="bi bi-building"></i> IPS
                                </router-link>
                            </li>
                        </template>

                        <li class="nav-item">
                            <router-link class="nav-link" to="/homeviews" @click="onNavLinkClick">
                                <i class="bi bi-house-door-fill"></i> Home
                            </router-link>
                        </li>

                        <li class="nav-item">
                            <button type="button" class="logout-btn" @click="logoutUser">
                                <i class="bi bi-x-circle"></i> Salir
                            </button>
                        </li>
                    </ul>
                    <div class="sidebar-version" style="position:absolute;bottom:10px;left:0;width:100%;text-align:center;font-size:0.95rem;color:#333;opacity:0.7;">
                      <p>Version 1.6 - 11/09/2025</p>  
                    </div>
                </div>
            </div>
        </div>
    </nav>

</div>
</template>

<script>
import {
    auth
} from "@/api/firebase";
import {
    signOut
} from "firebase/auth";
import {
    mapState,
    mapActions
} from "vuex";
// En navbar.vue

export default {
    methods: {
        ...mapActions(["userLogout"]),
        clearLocalStorage() {
            localStorage.removeItem("token");
            localStorage.removeItem("uid");
        },
        async logoutUser() {
            try {
                this.userLogout();
            } catch (error) {
                console.error('Error al cerrar sesión:', error);
            }
        },

        closeOffcanvas() {
            const offcanvasEl = document.getElementById("offcanvasNavbar");
            if (offcanvasEl && window.bootstrap) {
                let offcanvasInstance = window.bootstrap.Offcanvas.getInstance(offcanvasEl);
                if (!offcanvasInstance) {
                    offcanvasInstance = new window.bootstrap.Offcanvas(offcanvasEl);
                }
                offcanvasInstance.hide();
            }
        },
        onNavLinkClick() {
            this.closeOffcanvas();
        },
    },
    computed: {
        ...mapState(["uid", "userData"]),
    },
};
</script>

<style scoped>
/* Mantener colores de fondo originales y mejorar visualización */
.navbar.bg-body-tertiary {
    background-color: #212529 !important;
    /* Fondo oscuro original Bootstrap */
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.offcanvas {
    background-color: #23272b !important;
    /* Fondo offcanvas oscuro */
}

.offcanvas-title,
.offcanvas-header h6 {
    color: #fff;
    text-shadow: 1px 1px 4px #000;
}

.navbar-nav .nav-link,
.navbar-nav strong,
.navbar-nav .nav-item {
    color: #fff !important;
    text-shadow: 1px 1px 4px #000;
    font-size: 1.13rem;
    font-weight: 500;
    letter-spacing: 0.01em;
}

.navbar-nav .nav-link.router-link-exact-active {
    color: #ffc107 !important;
    background: rgba(255, 255, 255, 0.08);
    border-radius: 6px;
}

.navbar-nav i {
    font-size: 1.5rem;
    margin-right: 0.5em;
    vertical-align: middle;
}

.logout-btn {
    color: #fff !important;
    background: #dc3545;
    border: none;
    border-radius: 6px;
    padding: 0.5em 1.2em;
    font-size: 1.1rem;
    font-weight: 600;
    box-shadow: 1px 1px 6px #0002;
    transition: background 0.2s;
}

.logout-btn:hover {
    background: #b52a37;
}

.sidebar-version {
    color: #bbb !important;
}

.blanco {
    color: #fff !important;
    text-shadow: 1px 1px 4px #000;
}
</style>
