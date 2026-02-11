<template>
  <div>
    <!-- Modal de mensajes con estilo -->
    <div v-if="message" class="modal-overlay" @click="closeMessage">
      <div class="modal-message" :class="messageType" @click.stop>
        <div class="modal-header-custom">
          <i :class="messageType === 'success' ? 'bi bi-check-circle-fill' : 'bi bi-exclamation-triangle-fill'"></i>
          <h5>{{ messageType === 'success' ? '¡Éxito!' : 'Atención' }}</h5>
        </div>
        <div class="modal-body-custom">
          <p>{{ message }}</p>
        </div>
        <div class="modal-footer-custom">
          <button class="btn-close-modal" @click="closeMessage">
            <i class="bi bi-x-circle"></i> Cerrar
          </button>
        </div>
      </div>
    </div>

    <div class="container">
      <nav>
        <div class="nav nav-tabs" id="nav-tab" role="tablist">
          <button class="nav-link active" id="nav-home-tab" data-bs-toggle="tab" data-bs-target="#nav-home"
            type="button" role="tab" aria-controls="nav-home" aria-selected="true">
            Gestionar
          </button>
          <button class="nav-link" id="nav-profile-tab" data-bs-toggle="tab" data-bs-target="#nav-profile" type="button"
            role="tab" aria-controls="nav-profile" aria-selected="false">
            + Crear
          </button>
          <!-- <button class="nav-link" id="nav-contact-tab" data-bs-toggle="tab" data-bs-target="#nav-contact" type="button" role="tab" aria-controls="nav-contact" aria-selected="false">Contact</button>
        <button class="nav-link" id="nav-disabled-tab" data-bs-toggle="tab" data-bs-target="#nav-disabled" type="button" role="tab" aria-controls="nav-disabled" aria-selected="false" disabled>Disabled</button> -->
        </div>
      </nav>
      <div class="tab-content" id="nav-tabContent">
        <div class="tab-pane fade show active" id="nav-home" role="tabpanel" aria-labelledby="nav-home-tab"
          tabindex="0">
          <h1>Listado de usuarios del sistema</h1>

          <div style="max-height: 700px; overflow-y: auto" class="p-2">
            <!-- Mostrar mensaje si no hay usuarios -->
            <div v-if="!users || users.length === 0" class="alert alert-warning">
              No hay usuarios registrados en el sistema.
            </div>
            
            <!-- Cards agrupadas por grupo -->
            <div v-else class="row">
              <div v-for="(usuariosGrupo, grupo) in usuariosAgrupadosPorGrupo" :key="grupo" 
                   class="col-12 col-md-6 col-lg-4 mb-4">
                <div class="card h-100" :class="getColorClassByGrupo(grupo)">
                  <div class="card-header d-flex justify-content-between align-items-center">
                    <div>
                      <h5 class="card-title mb-0 text-white">
                        <i class="bi bi-people-fill me-2"></i>
                        {{ grupo === 'sin-grupo' ? 'Sin Grupo Asignado' : `Grupo ${grupo}` }}
                      </h5>
                      <small class="text-white-50">{{ usuariosGrupo.length }} usuario(s)</small>
                    </div>
                    <span class="badge bg-white text-dark fs-6">{{ usuariosGrupo.length }}</span>
                  </div>
                  <div class="card-body p-0">
                    <div class="list-group list-group-flush">
                      <div v-for="(user, index) in usuariosGrupo" :key="index" 
                           class="list-group-item d-flex justify-content-between align-items-center py-3">
                        <div>
                          <h6 class="mb-1 fw-bold">{{ user.nombre }}</h6>
                          <div class="d-flex flex-column">
                            <small class="text-muted">
                              <i class="bi bi-briefcase me-1"></i>
                              <strong>Cargo:</strong> {{ user.cargo }}
                            </small>
                            <small class="text-muted mt-1">
                              <i class="bi bi-envelope me-1"></i>
                              {{ user.email }}
                            </small>
                            <small class="text-muted mt-1">
                              <i class="bi bi-card-text me-1"></i>
                              <strong>Doc:</strong> {{ user.numDocumento || 'N/A' }}
                            </small>
                          </div>
                        </div>
                        <div class="d-flex flex-column align-items-end">
                          <div class="btn-group-vertical" role="group">
                            <button class="btn btn-warning mb-1" 
                                    @click="resetPassword(user.email)"
                                    title="Restablecer contraseña">
                              <i class="bi bi-key-fill"></i>
                            </button>
                            <button class="btn btn-danger" 
                                    @click="deleteUser(user)"
                                    title="Eliminar usuario">
                              <i class="bi bi-trash-fill"></i>
                            </button>
                          </div>
                          <span class="badge mt-2" :class="getCargoColorClass(user.cargo)">
                            {{ getCargoShortName(user.cargo) }}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="tab-pane fade" id="nav-profile" role="tabpanel" aria-labelledby="nav-profile-tab" tabindex="0">
          <h1>Crear Nuevo Usuario (por Administrador)</h1>
          <form @submit.prevent="createUserByAdmin">
            <div class="row">
              <div class="col col-12 col-md-4 mb-3">
                <label for="ips">Cargo</label>
                <select id="rol" v-model="cargo" class="form-select" required>
                  <option value="Auxiliar de enfermeria">Auxiliar</option>
                  <option value="Enfermero">Enfermero</option>
                  <option value="Medico">Medico</option>
                  <option value="Fact">Facturador</option>
                  <option value="admin">Administrador</option>
                  <option value="Psicologo">Psicologo</option>
                  <option value="Nutricionista">Nutricionista</option>
                  <option value="Tsocial">Trabajador social</option>
                </select>
              </div>
              <div class="col col-12 col-md-4">
                <label for="email">Email del Usuario:</label>
                <input type="email" id="email" v-model="userEmail" required />
              </div>
              <div class="col col-12 col-md-4">
                <label for="nombre">Nombre Completo:</label>
                <input type="text" id="nombre" v-model="nombre" required />
              </div>
              <div class="col col-12 col-md-4">
                <label for="numDocumento">Número de Documento:</label>
                <input type="text" id="numDocumento" v-model="numDocumento" required />
              </div>
              <div class="col col-12 col-md-4 mb-3" v-if="
                cargo === 'Auxiliar de enfermeria' ||
                cargo === 'Enfermero' ||
                cargo === 'Medico'
              ">
                <label for="grupo"># Grupo</label>
                <input type="number" id="grupo" v-model="grupo" />
              </div>
            </div>

            <button type="submit" :disabled="loading" class="btn btn-warning">
              {{ loading ? "Creando..." : "Crear Usuario y Enviar Enlace de Contraseña" }}
            </button>
          </form>
        </div>
        <div class="tab-pane fade" id="nav-contact" role="tabpanel" aria-labelledby="nav-contact-tab" tabindex="0">
          ...
        </div>
        <div class="tab-pane fade" id="nav-disabled" role="tabpanel" aria-labelledby="nav-disabled-tab" tabindex="0">
          ...
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { auth, db } from "@/api/firebase";
import {
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  updateProfile,
} from "firebase/auth";
import { doc, setDoc, collection, getDocs, deleteDoc } from "firebase/firestore";
import { mapActions } from "vuex";

export default {
  data() {
    return {
      /*  */
      userEmail: "",
      nombre: "",
      numDocumento: "",
      grupo: "",
      cargo: "",
      /*  */
      loading: false,
      message: "",
      messageType: "",
      users: [],
      ips: 1,
    };
  },
  computed: {
    usuariosAgrupadosPorGrupo() {
      if (!this.users || this.users.length === 0) return {};
      
      const grupos = {};
      
      this.users.forEach(user => {
        const grupoKey = user.grupo || 'sin-grupo';
        
        if (!grupos[grupoKey]) {
          grupos[grupoKey] = [];
        }
        grupos[grupoKey].push(user);
      });
      
      // Ordenar usuarios dentro de cada grupo por nombre
      Object.keys(grupos).forEach(key => {
        grupos[key].sort((a, b) => a.nombre.localeCompare(b.nombre));
      });
      
      return grupos;
    }
  },
  methods: {
    getColorClassByGrupo(grupo) {
      const colors = [
        'bg-primary',    // Azul
        'bg-success',    // Verde
        'bg-warning',    // Amarillo
        'bg-info',       // Cyan
        'bg-danger',     // Rojo
        'bg-secondary',  // Gris
        'bg-dark'        // Negro
      ];
      
      if (grupo === 'sin-grupo') {
        return 'bg-secondary';
      }
      
      // Usar el número del grupo para determinar el color
      const grupoNum = parseInt(grupo) || 0;
      return colors[grupoNum % colors.length];
    },
    
    getCargoColorClass(cargo) {
      const cargoColors = {
        'Auxiliar de enfermeria': 'bg-success text-white',
        'Enfermero': 'bg-info text-white',
        'Medico': 'bg-primary text-white',
        'Fact': 'bg-warning text-dark',
        'admin': 'bg-danger text-white',
        'Psicologo': 'bg-purple text-white',
        'Nutricionista': 'bg-orange text-white',
        'Tsocial': 'bg-teal text-white'
      };
      
      return cargoColors[cargo] || 'bg-secondary text-white';
    },
    
    getCargoShortName(cargo) {
      const shortNames = {
        'Auxiliar de enfermeria': 'AUX',
        'Enfermero': 'ENF',
        'Medico': 'MED',
        'Fact': 'FACT',
        'admin': 'ADMIN',
        'Psicologo': 'PSI',
        'Nutricionista': 'NUT',
        'Tsocial': 'TS'
      };
      
      return shortNames[cargo] || cargo.substring(0, 3).toUpperCase();
    },
    
    // Eliminar usuario de la base de datos
    async deleteUser(user) {
      if (!confirm(`¿Estás seguro de que deseas eliminar al usuario ${user.nombre}?

Esta acción eliminará el usuario de la base de datos.`)) {
        return;
      }
      
      this.loading = true;
      
      try {
        // Eliminar documento del usuario de Firestore
        await deleteDoc(doc(db, "users", user.uid));
        
        this.message = `Usuario ${user.nombre} eliminado exitosamente de la base de datos.`;
        this.messageType = "success";
        
        // Recargar lista de usuarios
        await this.fetchUsers();
        
      } catch (error) {
        this.message = `Error al eliminar usuario: ${error.message}`;
        this.messageType = "error";
        console.error("Error al eliminar usuario:", error);
      } finally {
        this.loading = false;
      }
    },
    
    closeMessage() {
      this.message = "";
      this.messageType = "";
    },
    //crear el usuario en la bd
    async createUserByAdmin() {
      if (!this.userEmail || !this.nombre || !this.numDocumento || !this.cargo) {
        this.message = "Por favor, completa todos los campos obligatorios.";
        this.messageType = "error";
        return;
      }

      this.loading = true;
      this.message = "";
      this.messageType = "";

      try {
        // Crear usuario con contraseña temporal
        const tempPassword =
          "temporary-password-" + Math.random().toString(36).substring(7);
        const userCredential = await createUserWithEmailAndPassword(
          auth,
          this.userEmail,
          tempPassword
        );
        const user = userCredential.user;

        // Actualizar perfil con nombre para mostrar
        await updateProfile(user, {
          displayName: this.nombre,
        });

        // Enviar correo para establecer contraseña
        await sendPasswordResetEmail(auth, this.userEmail);

        // Guardar datos adicionales en Firestore
        await setDoc(doc(db, "users", user.uid), {
          ips: this.ips,
          email: this.userEmail,
          nombre: this.nombre,
          numDocumento: this.numDocumento,
          grupo: this.grupo,
          cargo: this.cargo,
          createdAt: new Date(),
        });

        this.message = `Usuario ${this.userEmail} creado exitosamente. Se ha enviado un enlace para establecer la contraseña.`;
        this.messageType = "success";

        // Limpiar campos
        this.userEmail = "";
        this.nombre = "";
        this.grupo = "";
        this.numDocumento = "";
        this.cargo = "";
      } catch (error) {
        this.message = `Error al crear usuario: ${error.message}`;
        this.messageType = "error";
        console.error("Error al crear usuario:", error);
      } finally {
        this.loading = false;
      }
    },
    /*  resetear pasword */
    async resetPassword(email) {
      try {
        await sendPasswordResetEmail(auth, email);
        this.message = `Correo de restablecimiento enviado a ${email}.`;
        this.messageType = "success";
      } catch (error) {
        this.message = `Error al enviar correo: ${error.message}`;
        this.messageType = "error";
        console.error(error);
      }
    },

    /* listar todos lo usuarios */
    async listAllUsers(nextPageToken) {
      // Listar usuarios en lotes de 1000
      const listUsersResult = await getAuth().listUsers(1000, nextPageToken);

      listUsersResult.users.forEach((userRecord) => {
        console.log("Usuario:", userRecord.toJSON());
      });

      if (listUsersResult.pageToken) {
        // Si hay más usuarios, llamar recursivamente
        await listAllUsers(listUsersResult.pageToken);
      }
    },
    //consultar los datos del usuario
    async fetchUsers() {
      try {
        const usersCol = collection(db, "users");
        const querySnapshot = await getDocs(usersCol);
        this.users = querySnapshot.docs.map((doc) => ({
          uid: doc.id,
          ...doc.data(),
        }));
      } catch (error) {
        this.message = `Error al cargar usuarios: ${error.message}`;
        this.messageType = "error";
        console.error("Error fetchUsers:", error);
      }
    },
  },
  mounted() {
    this.fetchUsers();
  },
};
</script>

<style scoped>
/* Modal Overlay */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(4px);
  z-index: 9999;
  display: flex;
  justify-content: center;
  align-items: center;
  animation: fadeIn 0.3s ease-in-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }

  to {
    opacity: 1;
  }
}

/* Modal Message Box */
.modal-message {
  background: white;
  border-radius: 16px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
  min-width: 400px;
  max-width: 600px;
  animation: slideDown 0.4s ease-out;
  overflow: hidden;
}

@keyframes slideDown {
  from {
    transform: translateY(-50px);
    opacity: 0;
  }

  to {
    transform: translateY(0);
    opacity: 1;
  }
}

/* Header */
.modal-header-custom {
  padding: 20px 25px;
  display: flex;
  align-items: center;
  gap: 12px;
  border-bottom: 2px solid #f0f0f0;
}

.modal-message.success .modal-header-custom {
  background: linear-gradient(135deg, #d4edda 0%, #c3e6cb 100%);
  color: #155724;
}

.modal-message.error .modal-header-custom {
  background: linear-gradient(135deg, #f8d7da 0%, #f5c6cb 100%);
  color: #721c24;
}

.modal-header-custom i {
  font-size: 2rem;
}

.modal-header-custom h5 {
  margin: 0;
  font-weight: 600;
  font-size: 1.3rem;
}

/* Body */
.modal-body-custom {
  padding: 25px;
  font-size: 1rem;
  line-height: 1.6;
  color: #333;
}

.modal-body-custom p {
  margin: 0;
}

/* Footer */
.modal-footer-custom {
  padding: 15px 25px;
  text-align: right;
  background: #f8f9fa;
  border-top: 1px solid #dee2e6;
}

/* Responsive */
@media (max-width: 768px) {
  .modal-message {
    min-width: 90%;
    margin: 20px;
  }
}

/* Clases legacy por compatibilidad */
.error {
  color: red;
}

.success {
  color: green;
}
</style>
