<template>
<div>
    <p v-if="message" :class="messageType">{{ message }}</p>
    <div class="container">

        <nav>
            <div class="nav nav-tabs" id="nav-tab" role="tablist">
                <button class="nav-link active" id="nav-home-tab" data-bs-toggle="tab" data-bs-target="#nav-home" type="button" role="tab" aria-controls="nav-home" aria-selected="true">
                    Gestionar
                </button>
                <button class="nav-link" id="nav-profile-tab" data-bs-toggle="tab" data-bs-target="#nav-profile" type="button" role="tab" aria-controls="nav-profile" aria-selected="false">
                    + Crear
                </button>
                <!-- <button class="nav-link" id="nav-contact-tab" data-bs-toggle="tab" data-bs-target="#nav-contact" type="button" role="tab" aria-controls="nav-contact" aria-selected="false">Contact</button>
        <button class="nav-link" id="nav-disabled-tab" data-bs-toggle="tab" data-bs-target="#nav-disabled" type="button" role="tab" aria-controls="nav-disabled" aria-selected="false" disabled>Disabled</button> -->
            </div>
        </nav>
        <div class="tab-content" id="nav-tabContent">
            <div class="tab-pane fade show active" id="nav-home" role="tabpanel" aria-labelledby="nav-home-tab" tabindex="0">
                <h1>Listado de usuarios del sistema</h1>
                <!--       {{ this.users }} -->

                <div style="max-height: 700px; overflow-y: auto;">
                    <table class="table">
                        <thead>
                            <tr>
                                <th>nombre</th>
                                <!--    <th>rol</th> -->
                                <th>cargo</th>
                                <th>Grupo</th>
                                <th>opciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="(user, index) in this.users" :key="index">
                                <td>{{ user.nombre }}</td>
                                <!--    <td>{{ user.rol }}</td> -->
                                <td>{{ user.cargo }}</td>
                                <td>{{ user.grupo }}</td>
                                <td>
                                    <button class="btn btn-warning btn-sm" @click="resetPassword(user.email)">
                                        <i class="bi bi-key-fill"></i>
                                    </button>
                                </td>
                            </tr>
                        </tbody>
                    </table>
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
                        <div class="col col-12 col-md-4 mb-3" v-if="cargo === 'Auxiliar de enfermeria' || cargo === 'Enfermero' || cargo === 'Medico'">
                            <label for="grupo"># Grupo</label>
                            <input type="number" id="grupo" v-model="grupo" />
                        </div>

                    </div>

                    <button type="submit" :disabled="loading" class="btn btn-warning btn-sm">
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
    getDocs
} from "firebase/firestore";
import {
    mapActions
} from "vuex";

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
    methods: {
        //crear el usuario en la bd
        async createUserByAdmin() {
            if (
                !this.userEmail ||
                !this.nombre ||
                !this.numDocumento ||
                !this.cargo
            ) {
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
.error {
    color: red;
}

.success {
    color: green;
}
</style>
