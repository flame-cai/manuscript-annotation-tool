import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'welcome',
      component: () => import('../views/LandingPage.vue'),
    },
    {
      path: '/annotation',
      name: 'annotation-view',
      component: () => import('../views/AnnotationView.vue'),
      children: [
        {
          path: '/annotation/upload',
          name: 'upload-manuscript',
          component: () => import('../components/UploadForm.vue'),
          alias: '/annotation',
        },
        {
          path: '/annotation/annotate',
          name: 'annotation-section',
          component: () => import('../components/AnnotationSection.vue')
        }
      ]
    }
  ],
})

export default router
