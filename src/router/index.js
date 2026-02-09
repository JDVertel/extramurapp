import { createRouter, createWebHistory } from "vue-router";
import HomeView from "../views/HomeView.vue";

const routes = [
  /* Soportes */
  {
    path: "/",
    name: "home",
    component: () => import("../views/dashboard.vue"),
    meta: { hideNavbar: true }
  },
  /* Rutas equipo */

  {
    path: "/homeviews",
    name: "homeviews",
    component: () => import("../views/HomeView.vue"),
  },

  /* --------------------------------------------- */

  {
    path: "/sop_encuesta",
    name: "sop_encuesta",
    component: () => import("../views/sop_encuesta.vue"),
    meta: { requiresAuth: true },
  },
  {
    path: "/sop_agendas",
    name: "sop_agendas",
    component: () => import("../views/sop_agendas.vue"),
    meta: { requiresAuth: true },
  },
  {
    path: "/sop_facturacion",
    name: "sop_facturacion",
    component: () => import("../views/sop_facturacion.vue"),
    meta: { requiresAuth: true },
  },

  {
    path: "/sop_aux",
    name: "sop_aux",
    component: () => import("../views/sop_aux.vue"),
    meta: { requiresAuth: true },
  },
  {
    path: "/sop_agendamiento/:idEncuesta/:tipo",
    name: "sop_agendamiento",
    component: () => import("../views/sop_agendamiento.vue"),
    meta: { requiresAuth: true },
  },
  {
    path: "/sop_profesional",
    name: "sop_profesional",
    component: () => import("../views/sop_profesional.vue"),
    meta: { requiresAuth: true },
  },

  {
    path: "/sop_enfermero",
    name: "sop_enfermero",
    component: () => import("../views/sop_enfermero.vue"),
    meta: { requiresAuth: true },
  },
  {
    path: "/sop_caracterizacion/:idEncuesta",
    name: "sop_caracterizacion",
    component: () => import("../views/sop_caracterizacion.vue"),
    meta: { requiresAuth: true },
  },

  {
    path: "/sop_cups/:idEncuesta",
    name: "sop_cups",
    component: () => import("../views/sop_cups_auxiliar.vue"),
    meta: { requiresAuth: true },
  },
  /* Admin */
  {
    path: "/admin_encuestas",
    name: "admin_encuestas",
    component: () => import("../views/admin_encuestas.vue"),
    meta: { requiresAuth: true },
  },
  {
    path: "/admin_parametros",
    name: "admin_parametros",
    component: () =>
      import("../views/admin_parametros.vue"),
    meta: { requiresAuth: true },
  },
  {
    path: "/aux_informes",
    name: "aux_informes",
    component: () => import("../views/aux_informes.vue"),
    meta: { requiresAuth: true },
  },
  {
    path: "/admin_informes",
    name: "admin_informes",
    component: () => import("../views/admin_informes.vue"),
    meta: { requiresAuth: true },
  },
  {
    path: "/medico_informes",
    name: "medico_informes",
    component: () => import("../views/medico_informes.vue"),
    meta: { requiresAuth: true },
  },
  {
    path: "/enfermero_informes",
    name: "enfermero_informes",
    component: () => import("../views/enfermero_informes.vue"),
    meta: { requiresAuth: true },
  },
  {
    path: "/admin_ips",
    name: "admin_ips",
    component: () => import("../views/admin_ips.vue"),
    meta: { requiresAuth: true },
  },
  {
    path: "/admin_programavisitas",
    name: "admin_programavisitas",
    component: () =>
      import("../views/admin_programavisitas.vue"),
    meta: { requiresAuth: true },
  },
  {
    path: "/admin_registrousuarios",
    name: "admin_registrousuarios",
    component: () => import("../views/registrousuarios.vue"),
    meta: { requiresAuth: true },
  },
  {
    path: "/admin_caracterizacion",
    name: "admin_caracterizacion",
    component: () => import("../views/admin_caracterizacion.vue"),
    meta: { requiresAuth: true },
  },




  /* Login y registro */
  {
    path: "/login",
    name: "login",
    component: () => import("../views/login.vue"),
    meta: { hideNavbar: true }
  },
  {
    path: "/registrousuarios",
    name: "registrousuarios",
    component: () => import("../views/registrousuarios.vue"),
    meta: { requiresAuth: true },
  },

  {
    path: "/logout",
    name: "logout",
    component: () => import("../views/logout.vue"),
    meta: { hideNavbar: true }
  },
  /* Ruta catch-all para redirigir rutas no definidas */
  {
    path: "/:pathMatch(.*)*",
    redirect: "/",
  },
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
});

router.beforeEach((to, from, next) => {
  const loggedIn = !!localStorage.getItem("token"); // O el método que uses para validar sesión

  if (to.matched.some((record) => record.meta.requiresAuth) && !loggedIn) {
    // Si la ruta requiere auth y no hay token, redirige a login
    next("/login");
  } else {
    // Si está autenticado o la ruta no es protegida, permite el acceso
    next();
  }
});
export default router;
