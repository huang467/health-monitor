import { createApp } from 'vue';
import App from './App.vue';

// 引入路由
import router from './router';

// 引入 Pinia
import { pinia } from './stores';

// 引入全局样式
import './assets/scss/global.scss';

// 引入 Tailwind 样式
import './assets/scss/tailwind.scss';

// 引入高级样式
import './assets/scss/animations.scss';
import './assets/scss/components.scss';

// 引入全局组件
import IconSvg from './components/IconSvg.vue';
import ToastContainer from './components/ToastContainer.vue';
import GlobalLoading from './components/GlobalLoading.vue';
import ConfirmModal from './components/ConfirmModal.vue';

// 创建 Vue 实例
const app = createApp(App);

// 注册全局组件
app.component('IconSvg', IconSvg);
app.component('ToastContainer', ToastContainer);
app.component('GlobalLoading', GlobalLoading);
app.component('ConfirmModal', ConfirmModal);

// 挂载插件
app.use(router);
app.use(pinia);

// 挂载应用
app.mount('#app');
