<template>
    <div>
        <!-- Modal de mensajes con estilo -->
        <div v-if="message" class="modal-overlay" @click="closeMessage">
            <div class="modal-message" :class="messageType" @click.stop>
                <div class="modal-header-custom">
                    <i
                        :class="messageType === 'success' ? 'bi bi-check-circle-fill' : 'bi bi-exclamation-triangle-fill'"></i>
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
                    <button class="nav-link" id="nav-profile-tab" data-bs-toggle="tab" data-bs-target="#nav-profile"
                        type="button" role="tab" aria-controls="nav-profile" aria-selected="false">
                        + Crear
                    </button>
                    <!-- <button class="nav-link" id="nav-contact-tab" data-bs-toggle="tab" data-bs-target="#nav-contact" type="button" role="tab" aria-controls="nav-contact" aria-selected="false">Contact</button>
        <button class="nav-link" id="nav-disabled-tab" data-bs-toggle="tab" data-bs-target="#nav-disabled" type="button" role="tab" aria-controls="nav-disabled" aria-selected="false" disabled>Disabled</button> -->
                </div>
            </nav>
            <div class="tab-content" id="nav-tabContent">
                <div class="tab-pane fade show active" id="nav-home" role="tabpanel" aria-labelledby="nav-home-tab"
                    tabindex="0">
                    <h1 class="display-6"><i class="bi bi-people-fill display-6"></i> Listado de usuarios del sistema
                    </h1>

                    <!-- Filtro por Convenio -->
                    <div class="filter-section mb-3">
                        <label class="me-2"><strong>Filtrar por Convenio:</strong></label>
                        <button v-for="conv in convenios" :key="conv"
                            @click="convenioSeleccionado = convenioSeleccionado === conv ? '' : conv"
                            :class="['btn btn-sm me-2 mb-2', convenioSeleccionado === conv ? 'btn-primary' : 'btn-outline-primary']">
                            {{ conv === 'sin-convenio' ? 'Usuarios Administrativos' : conv }} ({{
                                usuariosPorConvenio[conv] || 0 }})
                        </button>
                    </div>

                    <div class="usuarios-container">
                        <!-- Mostrar mensaje si no hay usuarios -->
                        <div v-if="!users || users.length === 0" class="alert alert-warning">
                            No hay usuarios registrados en el sistema.
                        </div>

                        <!-- Tabla compacta agrupada por convenio y luego por grupo -->
                        <div v-else>
                            <!-- Convenios -->
                            <div v-for="(gruposPorConvenio, convenio) in usuariosAgrupadosPorConvenioYGrupoFiltrado"
                                :key="convenio" class="convenio-section mb-4">
                                <div class="convenio-header">
                                    <span class="convenio-title">
                                        <i :class="convenio === 'sin-convenio' ? 'bi bi-shield-check' : 'bi bi-building'"
                                            class="me-2"></i>
                                        {{ convenio === 'sin-convenio' ? 'Usuarios Administrativos' : convenio }}
                                    </span>
                                    <span class="convenio-count">{{ contarUsuariosConvenio(gruposPorConvenio) }}</span>
                                </div>

                                <!-- Acordeón con grupos colapsables -->
                                <div class="accordion" :id="'accordion-' + sanitizeId(convenio)">
                                    <div v-for="(usuariosGrupo, grupo) in gruposPorConvenio" :key="grupo"
                                        class="accordion-item">
                                        <h2 class="accordion-header">
                                            <button class="accordion-button collapsed" type="button"
                                                data-bs-toggle="collapse" :data-bs-target="'#collapse-' + sanitizeId(convenio) + '-' + grupo"
                                                :aria-controls="'collapse-' + sanitizeId(convenio) + '-' + grupo">
                                                <i class="bi bi-people-fill me-2"></i>
                                                <span class="grupo-title-text">
                                                    {{ grupo === 'sin-grupo' ? 'Sin Grupo' : `Grupo ${grupo}` }}
                                                </span>
                                                <span class="ms-auto grupo-count">{{ usuariosGrupo.length }}</span>
                                            </button>
                                        </h2>
                                        <div :id="'collapse-' + sanitizeId(convenio) + '-' + grupo" class="accordion-collapse collapse"
                                            :data-bs-parent="'#accordion-' + sanitizeId(convenio)">
                                            <div class="accordion-body p-0">
                                                <div class="tabla-usuarios">
                                                    <table class="table table-sm table-hover mb-0">
                                                        <thead>
                                                            <tr>
                                                                <th>Nombre</th>
                                                                <th>Cargo</th>
                                                                <th>Email</th>
                                                                <th>Documento</th>
                                                                <th>Acciones</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody>
                                                            <tr v-for="(user, index) in usuariosGrupo" :key="index"
                                                                :class="'cargo-' + getCargoClass(user.cargo)">
                                                                <td>{{ user.nombre }}</td>
                                                                <td>
                                                                    <span class="badge" :class="getCargoColorClass(user.cargo)">
                                                                        {{ getCargoShortName(user.cargo) }}
                                                                    </span>
                                                                </td>
                                                                <td class="small">{{ user.email }}</td>
                                                                <td class="small text-muted">{{ user.numDocumento || 'N/A' }}
                                                                </td>
                                                                <td>
                                                                    <button class="btn btn-sm btn-primary me-1"
                                                                        @click="abrirModalEdicion(user)" title="Editar usuario">
                                                                        <i class="bi bi-pencil-fill"></i>
                                                                    </button>
                                                                    <button class="btn btn-sm btn-warning me-1"
                                                                        @click="resetPassword(user.email)"
                                                                        title="Restablecer contraseña">
                                                                        <i class="bi bi-key-fill"></i>
                                                                    </button>
                                                                    <button class="btn btn-sm btn-danger"
                                                                        @click="deleteUser(user)" title="Eliminar usuario">
                                                                        <i class="bi bi-trash-fill"></i>
                                                                    </button>
                                                                </td>
                                                            </tr>
                                                        </tbody>
                                                    </table>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Modal de Edición de Usuario -->
                <div v-if="mostrarModalEdicion" class="modal-overlay" @click="cerrarModalEdicion">
                    <div class="modal-content" @click.stop>
                        <div class="modal-header-custom">
                            <h5>Editar Usuario</h5>
                            <button type="button" class="btn-close" @click="cerrarModalEdicion"></button>
                        </div>
                        <div class="modal-body-custom">
                            <form @submit.prevent="guardarCambiosUsuario">
                                <div class="row">
                                    <div class="col col-12 col-md-6 mb-3">
                                        <label for="editConvenio">IPS / Programa</label>
                                        <select id="editConvenio" v-model="editConvenio" class="form-select">
                                            <option value="Extramural">Extramural</option>
                                            <option value="E Basicos">E Basicos</option>
                                            <option value="sin-convenio">Usuarios Administrativos</option>
                                        </select>
                                    </div>
                                    <div class="col col-12 col-md-6 mb-3">
                                        <label for="editCargo">Cargo</label>
                                        <select id="editCargo" v-model="editCargo" class="form-select">
                                            <option value="Auxiliar de enfermeria">Auxiliar</option>
                                            <option value="Medico">Medico</option>
                                            <option value="Enfermero">Enfermero</option>
                                            <option value="Psicologo">Psicologo</option>
                                            <option value="Tsocial">Trabajador social</option>
                                            <option value="Fact">Facturador</option>
                                            <option value="admin">--Administrador--</option>
                                        </select>
                                    </div>
                                    <div class="col col-12 mb-3">
                                        <label for="editNombre">Nombre Completo</label>
                                        <input type="text" id="editNombre" v-model="editNombre" class="form-control"
                                            required />
                                    </div>
                                    <div class="col col-12 mb-3">
                                        <label for="editEmail">Email</label>
                                        <input type="email" id="editEmail" v-model="editEmail" class="form-control"
                                            required />
                                    </div>
                                    <div class="col col-12 col-md-6 mb-3">
                                        <label for="editNumDocumento">Número de Documento</label>
                                        <input type="text" id="editNumDocumento" v-model="editNumDocumento"
                                            class="form-control" required />
                                    </div>
                                    <div class="col col-12 col-md-6 mb-3" v-if="
                                        editCargo === 'Auxiliar de enfermeria' ||
                                        editCargo === 'Enfermero' ||
                                        editCargo === 'Medico' ||
                                        editCargo === 'Psicologo' ||
                                        editCargo === 'Tsocial'
                                    ">
                                        <label for="editGrupo"># Grupo</label>
                                        <input type="text" id="editGrupo" v-model="editGrupo" class="form-control"
                                            placeholder="Ej: 1, 2, F" />
                                    </div>
                                </div>
                                <div class="alert alert-info mt-3">
                                    <small><strong>Nota:</strong> Si cambia el email, se enviará un nuevo enlace para
                                        establecer contraseña. De lo contrario, solo se actualizarán los datos.</small>
                                </div>
                                <button type="submit" :disabled="loading" class="btn btn-primary">
                                    {{ loading ? "Guardando..." : "Guardar Cambios" }}
                                </button>
                                <button type="button" @click="cerrarModalEdicion" class="btn btn-secondary ms-2">
                                    Cancelar
                                </button>
                            </form>
                        </div>
                    </div>
                </div>

                <div class="tab-pane fade" id="nav-profile" role="tabpanel" aria-labelledby="nav-profile-tab"
                    tabindex="0">
                    <h1>Crear Nuevo Usuario (por Administrador)</h1>
                    <form @submit.prevent="createUserByAdmin">
                        <div class="row">
                            <div class="col col-12 col-md-4 mb-3">
                                <label for="convenio">IPS / Programa</label>
                                <select id="convenio" v-model="convenio" class="form-select" required>
                                    <option value="">Seleccione una opción</option>
                                    <option value="Extramural">Extramural</option>
                                    <option value="E Basicos">E Basicos</option>
                                </select>
                            </div>
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
                                cargo === 'Medico' ||
                                cargo === 'Psicologo' ||
                                cargo === 'Nutricionista' ||
                                cargo === 'Tsocial'
                            ">
                                <label for="grupo"># Grupo</label>
                                <input type="text" id="grupo" v-model="grupo" placeholder="Ej: 1, 2, F" />
                            </div>
                        </div>

                        <button type="submit" :disabled="loading" class="btn btn-warning">
                            {{ loading ? "Creando..." : "Crear Usuario y Enviar Enlace de Contraseña" }}
                        </button>
                    </form>
                </div>
                <div class="tab-pane fade" id="nav-contact" role="tabpanel" aria-labelledby="nav-contact-tab"
                    tabindex="0">
                    ...
                </div>
                <div class="tab-pane fade" id="nav-disabled" role="tabpanel" aria-labelledby="nav-disabled-tab"
                    tabindex="0">
                    ...
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import {
    auth,
    db
} from "@/api/firebase";
import {
    createUserWithEmailAndPassword,
    sendPasswordResetEmail,
    updateProfile,
} from "firebase/auth";
import {
    doc,
    setDoc,
    collection,
    getDocs,
    deleteDoc
} from "firebase/firestore";
import {
    mapActions
} from "vuex";

export default {
    data() {
        return {
            /*  Creación de usuario */
            userEmail: "",
            nombre: "",
            numDocumento: "",
            grupo: "",
            cargo: "",
            convenio: "",

            /* Modal de edición */
            mostrarModalEdicion: false,
            usuarioEditando: null,
            editEmail: "",
            editNombre: "",
            editNumDocumento: "",
            editGrupo: "",
            editCargo: "",
            editConvenio: "",
            emailAnterior: "",

            /*  */
            loading: false,
            message: "",
            messageType: "",
            users: [],
            ips: 1,
            convenioSeleccionado: "",
        };
    },
    computed: {
        convenios() {
            if (!this.users || this.users.length === 0) return [];
            const convSet = new Set(this.users.map(u => u.convenio || 'sin-convenio'));
            return Array.from(convSet).sort();
        },

        usuariosPorConvenio() {
            if (!this.users | this.users.length === 0) return {};
            const resultado = {};
            this.users.forEach(user => {
                const conv = user.convenio || 'sin-convenio';
                resultado[conv] = (resultado[conv] || 0) + 1;
            });
            return resultado;
        },

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
        },

        usuariosAgrupadosPorConvenioYGrupo() {
            if (!this.users || this.users.length === 0) return {};

            const resultado = {};

            // Agrupar usuarios por convenio y luego por grupo
            this.users.forEach(user => {
                const convenio = user.convenio || 'sin-convenio';
                const grupo = user.grupo || 'sin-grupo';

                // Crear objeto de convenio si no existe
                if (!resultado[convenio]) {
                    resultado[convenio] = {};
                }

                // Crear array de grupo si no existe
                if (!resultado[convenio][grupo]) {
                    resultado[convenio][grupo] = [];
                }

                // Agregar usuario al grupo
                resultado[convenio][grupo].push(user);
            });

            // Ordenar usuarios dentro de cada grupo por nombre
            Object.keys(resultado).forEach(convenio => {
                Object.keys(resultado[convenio]).forEach(grupo => {
                    resultado[convenio][grupo].sort((a, b) => a.nombre.localeCompare(b.nombre));
                });
            });

            return resultado;
        },

        usuariosAgrupadosPorConvenioYGrupoFiltrado() {
            const todosLosConvenios = this.usuariosAgrupadosPorConvenioYGrupo;

            if (!this.convenioSeleccionado) {
                return todosLosConvenios;
            }

            return { [this.convenioSeleccionado]: todosLosConvenios[this.convenioSeleccionado] };
        }
    },
    watch: {
        cargo(newVal) {
            // Asignar grupo automáticamente según el cargo
            if (newVal === 'admin') {
                this.grupo = '0';
            } else if (newVal === 'Fact') {
                this.grupo = 'F';
            }
        },
        editCargo(newVal) {
            // Asignar grupo automáticamente en edición
            if (newVal === 'admin') {
                this.editGrupo = '0';
            } else if (newVal === 'Fact') {
                this.editGrupo = 'F';
            }
        }
    },
    methods: {
        sanitizeId(str) {
            // Reemplaza espacios y caracteres especiales con guiones para crear IDs válidos
            return str.replace(/\s+/g, '-').replace(/[^a-zA-Z0-9-]/g, '').toLowerCase();
        },

        contarUsuariosConvenio(gruposPorConvenio) {
            let total = 0;
            Object.keys(gruposPorConvenio).forEach(grupo => {
                total += gruposPorConvenio[grupo].length;
            });
            return total;
        },

        getColorIndexByGrupo(grupo) {
            if (grupo === 'sin-grupo') {
                return 6;
            }
            const grupoNum = parseInt(grupo) || 0;
            return grupoNum % 7;
        },

        getCargoClass(cargo) {
            const cargoMap = {
                'Auxiliar de enfermeria': 'aux',
                'Enfermero': 'enf',
                'Medico': 'med',
                'Fact': 'fact',
                'admin': 'admin',
                'Psicologo': 'psi',
                'Nutricionista': 'nut',
                'Tsocial': 'ts'
            };
            return cargoMap[cargo] || 'default';
        },

        getColorClassByGrupo(grupo) {
            const colors = [
                'bg-primary', // Azul
                'bg-success', // Verde
                'bg-warning', // Amarillo
                'bg-info', // Cyan
                'bg-danger', // Rojo
                'bg-secondary', // Gris
                'bg-dark' // Negro
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
                'Enfermero': 'ENFE',
                'Medico': 'MEDI',
                'Fact': 'FACT',
                'admin': 'ADMIN',
                'Psicologo': 'PSICO',
                'Nutricionista': 'NUTRI',
                'Tsocial': 'TSOCIAL'
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
                // Guardar registro en auditoría antes de eliminar
                await setDoc(doc(db, "auditoria_eliminaciones", `${user.uid}_${Date.now()}`), {
                    uid: user.uid,
                    nombre: user.nombre,
                    email: user.email,
                    numDocumento: user.numDocumento,
                    cargo: user.cargo,
                    convenio: user.convenio,
                    grupo: user.grupo,
                    fechaEliminacion: new Date(),
                    eliminadoPor: auth.currentUser.email || 'sistema'
                });

                // Eliminar documento del usuario de Firestore
                await deleteDoc(doc(db, "users", user.uid));

                this.message = `Usuario ${user.nombre} eliminado exitosamente. Se guardó registro en auditoría.`;
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

        abrirModalEdicion(user) {
            this.usuarioEditando = user;
            this.emailAnterior = user.email;
            this.editEmail = user.email;
            this.editNombre = user.nombre;
            this.editNumDocumento = user.numDocumento;
            this.editGrupo = user.grupo || '';
            this.editCargo = user.cargo;
            this.editConvenio = user.convenio || '';
            this.mostrarModalEdicion = true;
        },

        cerrarModalEdicion() {
            this.mostrarModalEdicion = false;
            this.usuarioEditando = null;
            this.emailAnterior = "";
        },

        async guardarCambiosUsuario() {
            if (!this.editEmail || !this.editNombre || !this.editNumDocumento || !this.editCargo) {
                this.message = "Por favor, completa todos los campos obligatorios.";
                this.messageType = "error";
                return;
            }

            this.loading = true;
            this.message = "";
            this.messageType = "";

            try {
                const cambioEmail = this.emailAnterior !== this.editEmail;

                if (cambioEmail) {
                    // Si cambió el email, enviar nuevo link de contraseña
                    await sendPasswordResetEmail(auth, this.editEmail);

                    // Guardar auditoría del cambio de email
                    await setDoc(doc(db, "auditoria_cambios_email", `${this.usuarioEditando.uid}_${Date.now()}`), {
                        uid: this.usuarioEditando.uid,
                        numDocumento: this.editNumDocumento,
                        emailAnterior: this.emailAnterior,
                        emailNuevo: this.editEmail,
                        fechaCambio: new Date(),
                        cambiadoPor: auth.currentUser.email || 'sistema'
                    });
                }

                // Actualizar datos en Firestore
                await setDoc(doc(db, "users", this.usuarioEditando.uid), {
                    email: this.editEmail,
                    nombre: this.editNombre,
                    numDocumento: this.editNumDocumento,
                    grupo: this.editGrupo,
                    cargo: this.editCargo,
                    convenio: this.editConvenio,
                    ips: this.ips,
                    updatedAt: new Date()
                }, { merge: true });

                if (cambioEmail) {
                    this.message = `Usuario actualizado exitosamente. Se ha enviado un nuevo enlace para establecer contraseña al nuevo email.`;
                } else {
                    this.message = `Usuario actualizado exitosamente.`;
                }
                this.messageType = "success";

                this.cerrarModalEdicion();
                await this.fetchUsers();
            } catch (error) {
                // Manejo mejorado de errores
                if (error.code === 'auth/email-already-in-use') {
                    this.message = "El email ya está en uso. Por favor utiliza otro email.";
                } else if (error.code === 'auth/invalid-email') {
                    this.message = "El email no es válido.";
                } else {
                    this.message = `Error al actualizar usuario: ${error.message}`;
                }
                this.messageType = "error";
                console.error("Error al actualizar usuario:", error);
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
                    convenio: this.convenio,
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
                this.convenio = "";
                await this.fetchUsers();
            } catch (error) {
                // Manejo mejorado de errores
                if (error.code === 'auth/email-already-in-use') {
                    this.message = "El email ya está en uso. Por favor utiliza otro email.";
                } else if (error.code === 'auth/invalid-email') {
                    this.message = "El email no es válido.";
                } else if (error.code === 'auth/weak-password') {
                    this.message = "La contraseña es muy débil.";
                } else {
                    this.message = `Error al crear usuario: ${error.message}`;
                }
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
/* Sección de Convenio */
.convenio-section {
    background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
    border-radius: 12px;
    padding: 15px;
    margin-bottom: 25px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.convenio-header {
    padding: 16px 20px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    background: linear-gradient(135deg, #2c3e50 0%, #34495e 100%);
    color: white;
    font-weight: 700;
    border-radius: 8px;
    margin-bottom: 20px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
    font-size: 1.2rem;
    text-transform: uppercase;
    letter-spacing: 0.5px;
}

.convenio-title {
    display: flex;
    align-items: center;
    font-size: 1.2rem;
}

.convenio-count {
    background: rgba(255, 255, 255, 0.25);
    padding: 6px 14px;
    border-radius: 20px;
    font-size: 0.95rem;
    font-weight: 700;
}

.grupos-wrapper {
    display: flex;
    flex-direction: column;
    gap: 12px;
}

/* Filtro de Convenios */
.filter-section {
    padding: 15px;
    background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
    border-radius: 8px;
    margin-top: 20px;
}

/* Contenedor de usuarios */
.usuarios-container {
    padding: 10px 0;
}

/* Sección de Grupo */
.grupo-section {
    border-radius: 8px;
    overflow: hidden;
    box-shadow: 0 1px 4px rgba(0, 0, 0, 0.06);
    background: white;
}

.grupo-header {
    padding: 12px 16px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    color: white;
    font-weight: 600;
    border-radius: 8px 8px 0 0;
}

.grupo-title {
    display: flex;
    align-items: center;
    font-size: 0.95rem;
}

.grupo-count {
    background: rgba(255, 255, 255, 0.3);
    padding: 2px 10px;
    border-radius: 12px;
    font-size: 0.85rem;
    font-weight: 700;
}

/* Estilos para Acordeón de Grupos */
.accordion {
    gap: 12px;
}

.accordion-item {
    border: none;
    border-radius: 8px;
    box-shadow: 0 1px 4px rgba(0, 0, 0, 0.06);
    margin-bottom: 12px;
}

.accordion-button {
    padding: 12px 16px;
    font-weight: 600;
    font-size: 0.95rem;
    color: white;
    border: none;
    border-radius: 8px;
    display: flex;
    align-items: center;
}

.accordion-button:not(.collapsed) {
    box-shadow: none;
    background: inherit;
}

.accordion-button::after {
    margin-left: auto;
}

.grupo-title-text {
    display: flex;
    align-items: center;
}

.accordion-item:nth-child(1) .accordion-button {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.accordion-item:nth-child(2) .accordion-button {
    background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
}

.accordion-item:nth-child(3) .accordion-button {
    background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
}

.accordion-item:nth-child(4) .accordion-button {
    background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);
}

.accordion-item:nth-child(5) .accordion-button {
    background: linear-gradient(135deg, #fa709a 0%, #fee140 100%);
}

.accordion-item:nth-child(6) .accordion-button {
    background: linear-gradient(135deg, #30cfd0 0%, #330867 100%);
}

.accordion-item:nth-child(7) .accordion-button {
    background: linear-gradient(135deg, #a8edea 0%, #fed6e3 100%);
}

.accordion-button.collapsed {
    color: white;
}

.accordion-button:focus {
    box-shadow: none;
    border-color: transparent;
}

/* Colores para grupos (7 colores rotantes) */
.color-0 {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

/* Púrpura */
.color-1 {
    background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
}

/* Rosa-Rojo */
.color-2 {
    background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
}

/* Cyan */
.color-3 {
    background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);
}

/* Verde */
.color-4 {
    background: linear-gradient(135deg, #fa709a 0%, #fee140 100%);
}

/* Naranja */
.color-5 {
    background: linear-gradient(135deg, #30cfd0 0%, #330867 100%);
}

/* Azul-Morado */
.color-6 {
    background: linear-gradient(135deg, #a8edea 0%, #fed6e3 100%);
}

/* Suave */

/* Tabla de usuarios */
.tabla-usuarios {
    background: white;
    border-radius: 0 0 8px 8px;
    overflow: hidden;
}

.tabla-usuarios .table {
    margin: 0;
    font-size: 0.9rem;
    table-layout: fixed;
}

/* Anchos de columnas */
.tabla-usuarios th:nth-child(1),
.tabla-usuarios td:nth-child(1) {
    width: 33%;
}

.tabla-usuarios th:nth-child(2),
.tabla-usuarios td:nth-child(2) {
    width: 12%;
}

.tabla-usuarios th:nth-child(3),
.tabla-usuarios td:nth-child(3) {
    width: 28%;
}

.tabla-usuarios th:nth-child(4),
.tabla-usuarios td:nth-child(4) {
    width: 15%;
}

.tabla-usuarios th:nth-child(5),
.tabla-usuarios td:nth-child(5) {
    width: 12%;
}

.tabla-usuarios thead {
    background: #f8f9fa;
    border-bottom: 2px solid #dee2e6;
}

.tabla-usuarios thead th {
    padding: 10px 12px;
    font-weight: 600;
    color: #495057;
    border: none;
    font-size: 0.85rem;
    text-transform: uppercase;
    letter-spacing: 0.5px;
}

.tabla-usuarios tbody tr {
    border-bottom: 1px solid #f0f0f0;
    transition: background-color 0.2s ease;
}

.tabla-usuarios tbody tr:hover {
    background: #f8f9fa;
}

.tabla-usuarios tbody td {
    padding: 10px 12px;
    vertical-align: middle;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

.tabla-usuarios tbody td.fw-bold {
    white-space: normal;
}

/* Colores de fondo suave por cargo */
.tabla-usuarios tr.cargo-aux {
    --accent-color: #d4edda;
}

.tabla-usuarios tr.cargo-enf {
    --accent-color: #d1ecf1;
}

.tabla-usuarios tr.cargo-med {
    --accent-color: #cfe2ff;
}

.tabla-usuarios tr.cargo-fact {
    --accent-color: #fff3cd;
}

.tabla-usuarios tr.cargo-admin {
    --accent-color: #f8d7da;
}

.tabla-usuarios tr.cargo-psi {
    --accent-color: #e2e2f0;
}

.tabla-usuarios tr.cargo-nut {
    --accent-color: #f0e6ff;
}

.tabla-usuarios tr.cargo-ts {
    --accent-color: #e0f7fa;
}

/* Badge de cargo */
.badge {
    font-size: 0.75rem;
    padding: 4px 8px;
    font-weight: 600;
    border-radius: 4px;
    text-transform: uppercase;
    white-space: nowrap;
}

/* Botones de acción compactos */
.btn-sm {
    padding: 4px 8px;
    font-size: 0.8rem;
}

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

/* Modal de Edición */
.modal-content {
    background: white;
    border-radius: 12px;
    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
    max-width: 600px;
    width: 90%;
    max-height: 90vh;
    overflow-y: auto;
    animation: slideDown 0.4s ease-out;
}

.modal-content .modal-header-custom {
    padding: 20px 25px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-bottom: 2px solid #e9ecef;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    border-radius: 12px 12px 0 0;
}

.modal-content .modal-header-custom h5 {
    margin: 0;
    font-weight: 600;
    font-size: 1.3rem;
    color: white;
}

.modal-content .btn-close {
    background: transparent;
    color: white;
    border: none;
    font-size: 1.5rem;
    cursor: pointer;
    opacity: 0.7;
    transition: opacity 0.2s;
}

.modal-content .btn-close:hover {
    opacity: 1;
}

.modal-body-custom {
    padding: 25px;
}

.modal-body-custom .alert {
    margin-bottom: 20px;
}

/* Responsive */
@media (max-width: 1200px) {

    .tabla-usuarios thead th:nth-child(3),
    .tabla-usuarios tbody td:nth-child(3) {
        font-size: 0.8rem;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
    }

    .convenio-title {
        font-size: 0.95rem;
    }

    .convenio-count {
        padding: 2px 8px;
        font-size: 0.8rem;
    }
}

/* Tablets */
@media (max-width: 992px) {
    h1.display-6 {
        font-size: 1.75rem;
    }

    .filter-section {
        padding: 12px;
    }

    .filter-section label {
        display: block;
        margin-bottom: 8px;
        font-size: 0.95rem;
    }

    .filter-section button {
        font-size: 0.8rem;
        margin-right: 8px;
        margin-bottom: 6px;
    }

    .convenio-section {
        padding: 12px;
    }

    .convenio-header {
        padding: 10px 12px;
        flex-wrap: wrap;
        gap: 8px;
    }

    .convenio-title {
        font-size: 0.9rem;
    }

    .convenio-count {
        font-size: 0.75rem;
    }

    .grupo-header {
        padding: 10px 12px;
    }

    .grupo-title {
        font-size: 0.9rem;
    }

    .grupo-count {
        font-size: 0.8rem;
    }

    .tabla-usuarios .table {
        font-size: 0.85rem;
    }

    .tabla-usuarios thead th {
        padding: 8px 10px;
        font-size: 0.75rem;
    }

    .tabla-usuarios tbody td {
        padding: 8px 10px;
    }
}

/* Móviles grandes (landscape) */
@media (max-width: 768px) {
    .modal-message {
        min-width: 90%;
        margin: 20px;
    }

    h1.display-6 {
        font-size: 1.5rem;
        margin-bottom: 15px;
    }

    .filter-section {
        padding: 12px 10px;
        margin-top: 15px;
        margin-bottom: 15px;
    }

    .filter-section label {
        display: block;
        margin-bottom: 10px;
        font-size: 0.9rem;
        font-weight: 600;
    }

    .filter-section button {
        font-size: 0.75rem;
        padding: 5px 10px;
        margin-right: 6px;
        margin-bottom: 8px;
        display: inline-block;
    }

    .usuarios-container {
        padding: 0;
    }

    .convenio-section {
        padding: 8px 0;
        margin-bottom: 10px;
    }

    .convenio-header {
        padding: 8px 8px;
        font-size: 0.9rem;
    }

    .convenio-title {
        font-size: 0.85rem;
    }

    .convenio-title i {
        font-size: 0.95rem;
    }

    .convenio-count {
        padding: 2px 6px;
        font-size: 0.7rem;
    }

    .grupos-wrapper {
        gap: 0;
    }

    .grupo-section {
        border-radius: 6px;
    }

    .grupo-header {
        padding: 6px 8px;
        border-radius: 6px 6px 0 0;
    }

    .grupo-title {
        font-size: 0.8rem;
    }

    .grupo-title i {
        font-size: 0.9rem;
    }

    .grupo-count {
        padding: 1px 6px;
        font-size: 0.7rem;
    }

    /* Tabla responsiva en móvil */
    .tabla-usuarios {
        overflow-x: auto;
        -webkit-overflow-scrolling: touch;
        display: block;
    }

    .tabla-usuarios .table {
        font-size: 0.8rem;
        min-width: 550px;
        width: 100%;
        table-layout: auto;
    }

    .tabla-usuarios th:nth-child(1),
    .tabla-usuarios td:nth-child(1) {
        width: auto;
        min-width: 120px;
    }

    .tabla-usuarios th:nth-child(2),
    .tabla-usuarios td:nth-child(2) {
        width: auto;
        min-width: 70px;
    }

    .tabla-usuarios th:nth-child(3),
    .tabla-usuarios td:nth-child(3) {
        width: auto;
        min-width: 150px;
    }

    .tabla-usuarios th:nth-child(4),
    .tabla-usuarios td:nth-child(4) {
        width: auto;
        min-width: 70px;
    }

    .tabla-usuarios th:nth-child(5),
    .tabla-usuarios td:nth-child(5) {
        width: auto;
        min-width: 85px;
        white-space: nowrap;
    }

    .tabla-usuarios thead {
        background: #f0f0f0;
    }

    .tabla-usuarios thead th {
        padding: 5px 4px;
        font-size: 0.7rem;
        border: none;
        text-transform: capitalize;
        font-weight: 600;
        line-height: 1.2;
    }

    .tabla-usuarios tbody tr {
        border-bottom: 1px solid #e0e0e0;
    }

    .tabla-usuarios tbody td {
        padding: 5px 4px;
        font-size: 0.8rem;
        word-break: break-word;
    }

    .tabla-usuarios tbody td.fw-bold {
        font-weight: 600;
        max-width: 120px;
        white-space: normal;
    }

    .tabla-usuarios tbody td.small {
        font-size: 0.75rem;
        color: #666;
    }

    /* Badges responsivos */
    .badge {
        font-size: 0.65rem;
        padding: 2px 5px;
        border-radius: 3px;
    }

    /* Botones responsivos */
    .btn-sm {
        padding: 1px 3px;
        font-size: 0.55rem;
        height: auto;
        line-height: 1;
        margin-right: 1px;
        min-width: auto;
    }

    .btn-sm i {
        font-size: 0.6rem;
    }

    .btn-warning,
    .btn-danger {
        margin-right: 1px;
    }

    /* Modal responsivo */
    .modal-message {
        min-width: 85%;
        max-width: 95%;
    }

    .modal-header-custom {
        padding: 15px 15px;
        gap: 10px;
    }

    .modal-header-custom i {
        font-size: 1.5rem;
    }

    .modal-header-custom h5 {
        font-size: 1.1rem;
    }

    .modal-body-custom {
        padding: 15px;
        font-size: 0.95rem;
    }

    .modal-footer-custom {
        padding: 10px 15px;
    }
}

/* Móviles pequeños */
@media (max-width: 480px) {
    h1.display-6 {
        font-size: 1.25rem;
        margin-bottom: 12px;
    }

    .filter-section {
        padding: 10px 8px;
        margin-top: 10px;
        margin-bottom: 12px;
        background: linear-gradient(135deg, #f0f2f5 0%, #c3cfe2 100%);
    }

    .filter-section label {
        font-size: 0.85rem;
        margin-bottom: 8px;
    }

    .filter-section button {
        font-size: 0.7rem;
        padding: 4px 8px;
        margin-right: 4px;
        margin-bottom: 6px;
        width: calc(50% - 3px);
    }

    .usuarios-container {
        padding: 0;
    }

    .convenio-section {
        padding: 8px 6px;
        margin-bottom: 12px;
        border-radius: 6px;
    }

    .convenio-header {
        padding: 8px 8px;
        flex-direction: column;
        align-items: flex-start;
        gap: 6px;
    }

    .convenio-title {
        font-size: 0.8rem;
        width: 100%;
    }

    .convenio-count {
        align-self: flex-end;
        padding: 1px 5px;
        font-size: 0.65rem;
    }

    .grupo-header {
        padding: 7px 8px;
    }

    .grupo-title {
        font-size: 0.75rem;
    }

    .grupo-count {
        padding: 1px 5px;
        font-size: 0.65rem;
    }

    /* Tabla horizontal scroll en móvil pequeño */
    .tabla-usuarios {
        overflow-x: auto;
        display: block;
        -webkit-overflow-scrolling: touch;
    }

    .tabla-usuarios .table {
        font-size: 0.75rem;
        margin-bottom: 0;
        table-layout: auto;
        min-width: 600px;
        width: 100%;
    }

    .tabla-usuarios th:nth-child(1),
    .tabla-usuarios td:nth-child(1) {
        width: auto;
        min-width: 110px;
    }

    .tabla-usuarios th:nth-child(2),
    .tabla-usuarios td:nth-child(2) {
        width: auto;
        min-width: 65px;
    }

    .tabla-usuarios th:nth-child(3),
    .tabla-usuarios td:nth-child(3) {
        width: auto;
        min-width: 140px;
    }

    .tabla-usuarios th:nth-child(4),
    .tabla-usuarios td:nth-child(4) {
        width: auto;
        min-width: 65px;
    }

    .tabla-usuarios th:nth-child(5),
    .tabla-usuarios td:nth-child(5) {
        width: auto;
        min-width: 130px;
        white-space: nowrap;
    }

    .tabla-usuarios thead th {
        padding: 4px 3px;
        font-size: 0.6rem;
        white-space: normal;
        overflow: hidden;
        text-overflow: ellipsis;
        background: #f5f5f5;
        line-height: 1.2;
    }

    .tabla-usuarios tbody td {
        padding: 4px 3px;
        font-size: 0.75rem;
        overflow: hidden;
        text-overflow: ellipsis;
    }

    .tabla-usuarios tbody td.fw-bold {
        max-width: 100px;
        font-size: 0.8rem;
    }

    .tabla-usuarios tbody td.small {
        font-size: 0.7rem;
    }

    .badge {
        font-size: 0.6rem;
        padding: 2px 4px;
    }

    .btn-sm {
        padding: 2px 3px;
        font-size: 0.6rem;
        margin-right: 1px;
    }

    .btn-sm i {
        font-size: 0.7rem;
    }

    .btn-sm.me-1 {
        margin-right: 1px !important;
    }

    /* Modal para móvil pequeño */
    .modal-message {
        min-width: 90%;
        max-width: 100%;
        margin: 10px;
    }

    .modal-header-custom {
        padding: 12px 12px;
    }

    .modal-body-custom {
        padding: 12px;
        font-size: 0.9rem;
    }

    .modal-footer-custom {
        padding: 8px 12px;
    }
}

/* Ultra pequeños (less de 380px) */
@media (max-width: 380px) {
    h1.display-6 {
        font-size: 1.1rem;
    }

    .filter-section button {
        width: 100%;
        margin-right: 0;
        margin-bottom: 4px;
    }

    .convenio-header {
        flex-direction: column;
    }

    .tabla-usuarios thead th {
        padding: 3px 2px;
        font-size: 0.55rem;
        line-height: 1.1;
    }

    .tabla-usuarios tbody td {
        padding: 3px 2px;
        font-size: 0.65rem;
    }

    .tabla-usuarios {
        overflow-x: auto;
        display: block;
    }

    .tabla-usuarios .table {
        table-layout: auto;
        min-width: 600px;
    }

    .btn-sm {
        padding: 1px 2px;
        font-size: 0.55rem;
        margin-right: 1px;
    }
}

/* Clases legacy por compatibilidad */
.error {
    color: red;
}

.success {
    color: green;
}

/* Colores personalizados para cargos adicionales */
.bg-purple {
    background-color: #6f42c1 !important;
}

.bg-orange {
    background-color: #fd7e14 !important;
}

.bg-teal {
    background-color: #20c997 !important;
}
</style>
