import type { RouteRecordRaw } from 'vue-router';
import type { App } from 'vue';

import { createRouter, createWebHashHistory, createWebHistory } from 'vue-router';

import { basicRoutes } from './routes/';

const router = createRouter({
  history: createWebHashHistory(), // createWebHistory
  routes: basicRoutes as RouteRecordRaw[]
})

// config router
export function setupRouter(app: App<Element>) {
  app.use(router);
}

export default router
