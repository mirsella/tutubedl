import { createApp } from 'vue'
import App from './App.vue'
import "@/assets/tailwind.css";
import Ads from 'vue-google-adsense'

App.use(require('vue-script2'))
// App.use(Ads.Adsense)
App.use(Ads.AutoAdsense, { adClient: 'ca-pub-5245653360027652' })

createApp(App).mount('#app')
