const app = new Vue({
  el: '#app',
  data: {
    url: '',
    err: '',
    gitover: false,
    loading: {
      get: false,
      all: false,
      single: []
    },
    videos: [],
  },
  methods: {
    async list() { 
      this.loading.get = true
      this.err = ''
      this.videos = []
      const response = await fetch('/check', {
        method: 'POST',
        headers: {
          'content-type': 'application/json'
        },
        body: JSON.stringify({
          url: this.url
        }),
      })
      if(response.ok) {
        this.videos = await response.json();
        for(index in this.videos) {
          this.loading.single[index] = false
        }
      } else {
        this.err = await response.statusText;
      }
      this.loading.get = false
    },
    async downloadall(type) {
      let promises = []
      this.loading.all = true
      for (video of this.videos) {
        promises.push(this.download(video, type))
      }
      Promise.all(promises)
        .then(res => this.loading.all = false)
    },
    async onedownload(video, type, index) {
      Vue.set(this.loading.single, index, true)
      await this.download(video, type)
      Vue.set(this.loading.single, index, false)
    },
    async download(video, type) {
      await fetch(`/${type}?id=${video.id}`, {
        method: 'GET'
      })
        .then(resp => resp.blob())
        .then(blob => {
          if (type = "audio") {
          download(blob, video.title.replace(/[^\x00-\x7F]/g, "")+'.mp3');
          } else {
          download(blob, video.title.replace(/[^\x00-\x7F]/g, "")+'.mp4');
          }
        })
        .catch(err => {
          this.err = err;
        })
    }
  }
});
