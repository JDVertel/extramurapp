<template>
  <div class="app">
    <nav class="navbar bg-body-tertiary fixed-top">
      <div class="container-fluid">
        <!-- Botón toggler a la izquierda -->
        <button class="navbar-toggler me-2" type="button" data-bs-toggle="offcanvas" data-bs-target="#offcanvasNavbar"
          aria-controls="offcanvasNavbar" aria-label="Toggle navigation">
          <span class="navbar-toggler-icon"></span>
        </button>
        <img src="@/assets/images/logo_extramurapp.png" alt="ExtramuApp Logo" class="navbar-logo" />
        <div>
          <h6 v-if="userData && userData.nombre" class="text-start text-capitalize blanco" style="font-size: 0.9rem;">
            ExtramuApp / {{ userData.convenio || "" }}<br>
            {{ userData.nombre || "" }} /
            {{ userData.cargo || "" }}

          </h6>
          <h6 v-else class="text-center text-capitalize blanco" style="opacity: 0.6;">
            Cargando...
          </h6>
        </div>

        <!-- Offcanvas desde la izquierda -->
        <div class="offcanvas offcanvas-start" tabindex="-1" id="offcanvasNavbar"
          aria-labelledby="offcanvasNavbarLabel">
          <div class="offcanvas-header">
            <div class="row">
              <h6 class="offcanvas-title" id="offcanvasNavbarLabel">MENU</h6>
            </div>

            <button type="button" class="btn-close" data-bs-dismiss="offcanvas" aria-label="Close"></button>
          </div>

          <div class="offcanvas-body">
            <ul class="navbar-nav justify-content-end flex-grow-1 pe-3">
              <li class="nav-item" v-if="userData && userData.cargo === 'Fact'">
                <router-link class="nav-link" to="/sop_facturacion" @click="onNavLinkClick">
                  <i class="bi bi-person-circle"></i> Facturador
                </router-link>
              </li>

              <li class="nav-item" v-if="userData && userData.cargo === 'Auxiliar de enfermeria'">
                <router-link class="nav-link" to="/sop_aux" @click="onNavLinkClick">
                  <i class="bi bi-person-circle"></i> Auxiliar
                </router-link>
              </li>
              <li class="nav-item" v-if="userData && userData.cargo === 'Auxiliar de enfermeria' && userData.convenio !== 'E Basicos'">
                <router-link class="nav-link" to="/sop_agendas" @click="onNavLinkClick">
                  <i class="bi bi-calendar2-date"></i> Agendas
                </router-link>
              </li>

              <li class="nav-item" v-if="userData && userData.cargo === 'Medico'">
                <router-link class="nav-link" to="/sop_profesional" @click="onNavLinkClick">
                  <i class="bi bi-person-circle"></i> Medico
                </router-link>
              </li>
                <li class="nav-item" v-if="userData && userData.cargo === 'Psicologo'">
                 <router-link class="nav-link" to="/sop_psicologo" @click="onNavLinkClick">
                  <i class="bi bi-person-circle"></i> Psicologo
                </router-link>
              </li>
              <li class="nav-item" v-if="userData && userData.cargo === 'Tsocial'">
                <router-link class="nav-link" to="/sop_tsocial" @click="onNavLinkClick">
                  <i class="bi bi-person-circle"></i> Trabajador Social
                </router-link>
              </li>
              <li class="nav-item" v-if="userData && userData.cargo === 'Enfermero'">
                <router-link class="nav-link" to="/sop_enfermero" @click="onNavLinkClick">
                  <i class="bi bi-person-circle"></i> Enfermer@
                </router-link>
              </li>
              <li class="nav-item" v-if="userData && userData.cargo === 'Admin'">
                <router-link class="nav-link" to="/admin_informes" @click="onNavLinkClick">
                  <i class="bi bi-bar-chart-fill"></i> Informes
                </router-link>
              </li>
              <li class="nav-item" v-if="userData && userData.cargo === 'Medico'">
                <router-link class="nav-link" to="/medico_informes" @click="onNavLinkClick">
                  <i class="bi bi-bar-chart-fill"></i> Informes
                </router-link>
              </li>
              <li class="nav-item" v-if="userData && userData.cargo === 'Auxiliar de enfermeria'">
                <router-link class="nav-link" to="/aux_informes" @click="onNavLinkClick">
                  <i class="bi bi-bar-chart-fill"></i> Informes
                </router-link>
              </li>
              <li class="nav-item" v-if="userData && userData.cargo === 'Enfermero'">
                <router-link class="nav-link" to="/enfermero_informes" @click="onNavLinkClick">
                  <i class="bi bi-bar-chart-fill"></i> Informes
                </router-link>
              </li>

              <li class="nav-item">
                <router-link class="nav-link" to="/consulta_pacientes" @click="onNavLinkClick">
                  <i class="bi bi-search"></i> Pacientes
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
            <div class="sidebar-version" style="
                position: absolute;
                bottom: 5px;
                left: 0;
                width: 100%;
                text-align: center;
                font-size: 0.65rem;
                color: #333;
                opacity: 0.7;
              ">
              <p style="margin: 0; padding: 0;">Version 2.1 - 26/02/2026</p>
            </div>
          </div>
        </div>
      </div>
    </nav>
  </div>
</template>

<script>
import { auth } from "@/api/firebase";
import { signOut } from "firebase/auth";
import { mapState, mapActions } from "vuex";
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
        // Redirigir a logout mientras se ejecuta el logout
        this.$router.push("/logout").then(() => {
          this.userLogout();
        }).catch(() => {
          // Si la redirección falla, ejecutar logout de todas formas
          this.userLogout();
        });
      } catch (error) {
        console.error("Error al cerrar sesión:", error);
        this.userLogout();
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
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  padding: 0.5rem 0 !important;
}

.container-fluid {
  padding: 0 0.5rem !important;
}

.navbar-toggler {
  padding: 0.25rem 0.5rem !important;
  width: auto;
  height: auto;
  border: 2px solid #fff !important;
  border-radius: 5px;
}

.navbar-toggler:focus {
  box-shadow: 0 0 0 0.2rem rgba(255, 255, 255, 0.25);
}

.navbar-toggler-icon {
  background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 30 30'%3e%3cpath stroke='rgba%28255, 255, 255, 1%29' stroke-linecap='round' stroke-miterlimit='10' stroke-width='2' d='M4 7h22M4 15h22M4 23h22'/%3e%3c/svg%3e");
}

.offcanvas {
  background-color: #23272b !important;
  width: 160px !important;
}

.offcanvas-body {
  padding: 0.25rem 0 !important;
}

.offcanvas-header {
  padding: 0.4rem 0.5rem !important;
}

.offcanvas-title,
.offcanvas-header h6 {
  color: #fff;
  text-shadow: 1px 1px 4px #000;
  font-size: 0.85rem;
  font-weight: 600;
  margin: 0 !important;
}

.navbar-nav .nav-link,
.navbar-nav strong,
.navbar-nav .nav-item {
  color: #fff !important;
  text-shadow: 1px 1px 4px #000;
  font-size: 0.8rem;
  font-weight: 500;
  letter-spacing: 0.01em;
  padding: 0.2rem 0.4rem !important;
  margin: 0.25rem 0 !important;
  display: flex;
  align-items: center;
  gap: 0.3rem;
  line-height: 1.1;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}

.navbar-nav .nav-link.router-link-exact-active {
  color: #ffc107 !important;
  background: rgba(255, 255, 255, 0.08);
  border-radius: 5px;
  transition: all 0.2s ease;
}

.navbar-nav i {
  font-size: 0.9rem;
  margin-right: 0.2em;
  vertical-align: middle;
  flex-shrink: 0;
}

.sidebar-version {
  color: #bbb !important;
  font-size: 0.65rem !important;
  padding: 0 !important;
  margin: 0 !important;
}

.logout-btn {
  background: none;
  border: none;
  color: #fff !important;
  text-shadow: 1px 1px 4px #000;
  font-size: 0.8rem;
  font-weight: 500;
  padding: 0.2rem 0.4rem !important;
  margin: 0.25rem 0 !important;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.3rem;
  transition: color 0.2s ease;
  width: 100%;
  text-align: left;
  line-height: 1.1;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}

.logout-btn:hover {
  color: #ff6b6b !important;
}

.blanco {
  color: #fff !important;
  text-shadow: 1px 1px 4px #000;
  font-size: 0.85rem;
}

.navbar-logo {
  height: 40px;
  width: auto;
  object-fit: contain;
  margin: 0 0.5rem;
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3));
}

@media (max-width: 768px) {
  .navbar-logo {
    height: 32px;
    margin: 0px 0.3rem;
  }
}

@media (max-width: 480px) {
  .navbar-logo {
    height: 38px;
    margin: 0px 0.2rem;
  }
}
</style>
