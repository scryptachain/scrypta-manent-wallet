import Vue from 'vue'
import VueRouter from 'vue-router'

Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    name: 'Dashboard',
    component: () => import(/* webpackChunkName: "dashboard" */ '../standalone/views/Dashboard.vue')
  },
  {
    path: '/payments',
    name: 'Payments',
    component: () => import(/* webpackChunkName: "receive" */ '../standalone/views/Payments.vue')
  },
  {
    path: '/portfolio',
    name: 'Portfolio',
    component: () => import(/* webpackChunkName: "receive" */ '../standalone/views/Portfolio.vue')
  },
  {
    path: '/planum/:chain',
    name: 'Planum',
    component: () => import(/* webpackChunkName: "receive" */ '../standalone/views/Planum.vue')
  },
  {
    path: '/contacts',
    name: 'Contacts',
    component: () => import(/* webpackChunkName: "contacts" */ '../standalone/views/Contacts.vue')
  },
  {
    path: '/identities',
    name: 'Identities',
    component: () => import(/* webpackChunkName: "identities" */ '../standalone/views/Identities.vue')
  },
  {
    path: '/identity/:identity',
    name: 'Identity',
    component: () => import(/* webpackChunkName: "receive" */ '../standalone/views/Identity.vue')
  },
  {
    path: '/settings',
    name: 'Settings',
    component: () => import(/* webpackChunkName: "settings" */ '../standalone/views/Settings.vue')
  },
  {
    path: '/notarize',
    name: 'Notarize',
    component: () => import(/* webpackChunkName: "settings" */ '../standalone/views/Notarize.vue')
  }
]

const router = new VueRouter({
  routes
})

export default router
