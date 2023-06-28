import Vue from 'vue'
import App from './App.vue'
import router from './router'
import 'ant-design-vue/dist/antd.css';
import Antd from 'ant-design-vue';
import moment from 'moment';
import locale from 'ant-design-vue/lib/locale-provider/zh_CN';
import 'moment/locale/zh-cn';
moment.locale('zh-cn');

Vue.config.productionTip = false
Vue.use(Antd)
new Vue({
  router,
  render: h => h(App)
}).$mount('#app')
