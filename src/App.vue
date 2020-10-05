<template class="h-full font-bold text-white bg-black">
  <div class="flex flex-col"> 
    <form @submit.prevent="list()" name="form" class="inline-flex m-2">
      <a @mouseover="gitover=true" @mouseleave="gitover=false" href="https://github.com/mirsella/tutubedl" target="_blank" class="my-2">
        <img v-if="!gitover" src="github.png" alt="github" class="w-12">
        <img v-if="gitover" src="github-face.png" alt="github" class="w-12">
      </a>
      <input type="text" v-model="url" placeholder="youtube url" class="w-full px-2 py-2 m-1 mr-0 text-base leading-normal bg-purple-400 rounded-l-lg md:text-xl placeholder-current focus:outline-none focus:bg-purple-500">
      <button class="inline-flex justify-center w-56 px-4 py-2 m-1 ml-0 text-sm bg-purple-700 rounded-r-lg md:text-lg focus:outline-none hover:bg-purple-800">
        <svg v-if="loading.get" class="w-5 h-4 mt-px mr-3 text-white animate-spin" fill="none" viewBox="0 0 24 24">
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        get video(s) list
      </button>
    </form>
    <h1 v-if="err" class="m-10 text-red-700 place-self-center">{{err}}</h1>
    <button v-if="videos.length > 1" @click="downloadall()" class="inline-flex self-center justify-center px-8 py-2 m-4 bg-purple-700 rounded focus:outline-none hover:bg-purple-800 place-self-center">
      <svg v-if="loading.all" class="w-5 h-4 mt-px mr-6 text-white animate-spin" fill="none" viewBox="0 0 24 24">
        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
      </svg>
      download all
    </button>
    <div :key="index" v-for="(video, index) in videos">
      <div class="items-center m-10 lg:flex sm:block">
        <iframe class="m-2 md:m-5 md:w-1/3 w-42" :src="'https://youtube.com/embed/'+video.id" frameborder="0" allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
        <div>
          <button @click="onedownload(video, index)" class="px-4 py-2 text-center text-white bg-purple-700 rounded hover:bg-purple-800" target="_blank">
            <svg v-if="loading.single[index]" class="inline-block h-4 mt-px mr-6 text-white animate-spin" fill="none" viewBox="0 0 24 24">
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            download
          </button>
          <span class="m-5">{{video.title}}</span>
          <span class="block m-5">{{video.duration}}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
// import download from '@/assets/download.min.js'
export default {
  name: 'App',
  data() {
    return {
      url: '',
      err: '',
      gitover: false,
      loading: {
        get: false,
        all: false,
        single: []
      },
      videos: [],
    }
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
        var index
        for(index in this.videos) {
          this.loading.single[index] = false;
        }
      } else {
        this.err = await response.statusText;
      }
      this.loading.get = false
    },
    async downloadall() {
      let promises = []
      this.loading.all = true
      var video
      for (video of this.videos) {
        promises.push(this.download(video))
      }
      Promise.all(promises)
        .then(this.loading.all = false)
    },
    async onedownload(video, index) {
      this.set(this.loading.single, index, true)
      await this.download(video)
      this.set(this.loading.single, index, false)
    },
    async download(video) {
      await fetch('/audio?id='+video.id, {
        method: 'GET'
      })
        .then(resp => resp.blob())
        .then(blob => {
          // download(blob, video.title.replace(/[^\x20-\x7E]/g, "")+'.mp3');
          console.log(blob)
        })
        .catch(err => {
          this.err = err;
        })
    }
  }
}
</script>

