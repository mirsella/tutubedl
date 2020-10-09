import { createApp } from 'vue'
import App from './App.vue'
import "@/assets/tailwind.css";
import Ads from 'vue-google-adsense'

const app = createApp(App)

app.use(require('vue-script2'))
app.use(Ads.AutoAdsense, { adClient: 'ca-pub-5245653360027652' })
// app.use(Ads.Adsense)

app.mount('#app')
