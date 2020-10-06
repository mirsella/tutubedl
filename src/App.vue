<template>
  <main class="flex flex-col min-h-screen font-bold text-white bg-black" :class="[ bgstyles[0] ? bgstyles[1]: '' ]">
    <form @submit.prevent="list()" name="form" class="inline-flex my-2">
      <a @mouseover="gitover=true" @mouseleave="gitover=false" href="https://github.com/mirsella/tutubedl" target="_blank" class="m-auto mx-1">
        <img v-if="!gitover" src="@/assets/github.png" alt="github" class="w-12">
        <img v-if="gitover" src="@/assets/github-face.png" alt="github" class="w-12">
      </a>
      <input type="text" v-model="url" placeholder="youtube url" class="w-full h-10 p-2 text-base leading-normal rounded-l-lg bg-gradient-to-r from-pink-600 to-purple-600 md:text-lg placeholder-current focus:outline-none">
      <button class="inline-flex justify-center ml-1 mr-2 focus:outline-none">
        <span class="w-32 h-10 px-4 py-2 text-sm rounded-r-lg md:text-lg md:w-48 bg-gradient-to-r from-purple-600 to-purple-900 hover:from-purple-700">
          <svg v-if="loading.get" class="inline-flex w-5 h-4 mb-1 mr-3 text-white animate-spin" fill="none" viewBox="0 0 24 24">
            <path class="bg-purple-600 opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span :class="{ hidden: loading.get }" class="md:inline-block">get video(s) list</span>
        </span>
      </button>
    </form>
    <h1 v-if="err" class="m-10 text-red-700 place-self-center">{{err}}</h1>
    <div v-if="videos.length > 1" class="self-center m-5">
      <div class="p-1 mb-1 text-center rounded-t-lg bg-gradient-to-r from-pink-500 via-pink-600 to-purple-700">
        download all :
      </div>
      <button @click="downloadall('audio')" class="px-8 py-2 mr-1 text-white bg-purple-700 rounded-bl-lg bg-gradient-to-r from-pink-500 to-pink-600 focus:outline-none place-self-center">
        audio
      </button>
      <button @click="downloadall('video')" class="px-8 py-2 text-white bg-purple-700 rounded-br-lg bg-gradient-to-r from-pink-600 to-purple-700 focus:outline-none place-self-center">
        video
      </button>
      <svg v-if="loading.all" class="w-5 mx-auto mt-5 animate-spin place-self-center" fill="none" viewBox="0 0 24 24">
        <path class="bg-purple-600 opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
      </svg>
    </div>
    <div :key="video.title" v-for="(video, index) in videos">
      <div class="items-center block m-10 lg:flex">
        <iframe class="m-2 md:m-5 md:w-4/12 w-42" :src="'https://youtube.com/embed/'+video.id" frameborder="0" allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
        <div>
          <div class="m-3 text-center md:text-left">
            <button @click="onedownload(video, 'audio', index)" class="px-4 py-2 mx-px text-center text-white bg-purple-700 rounded-l-lg bg-gradient-to-r from-pink-500 to-pink-600 focus:outline-none hover:bg-purple-800" target="_blank">
              audio
            </button>
            <button @click="onedownload(video, 'video', index)" class="px-4 py-2 mx-px text-center text-white bg-purple-700 rounded-r-lg bg-gradient-to-r from-pink-600 to-purple-700 focus:outline-none hover:bg-purple-800" target="_blank">
              video
            </button>
            <svg v-if="loading.single[index]" class="inline-block h-4 ml-2 text-white animate-spin" fill="none" viewBox="0 0 24 24">
              <path class="bg-purple-600 opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          </div>
          <span class="m-2 text-transparent bg-clip-text bg-gradient-to-r from-pink-500 via-pink-600 to-purple-700">{{video.title}}</span>
          <span class="block m-2 text-transparent bg-clip-text bg-gradient-to-r from-pink-500 via-pink-600 to-purple-700">{{video.duration}}</span>
        </div>
      </div>
    </div>
    <button :class="[ !bgstyles[2] ? bgstyles[3]: '' ]" class="w-56 text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-red-500 to-pink-500" @click="bgstyles[0] = !bgstyles[0]">toggle ununsable background :)</button>
  </main>
</template>

<script>
import download from 'downloadjs'
export default {
  name: 'App',
  data() {
    return {
      api: process.env.VUE_APP_API || '',
      url: '',
      err: '',
      gitover: false,
      bgstyles: [ false, 'bg-gradient-to-r from-orange-400 via-red-500 to-pink-500', false, 'fixed bottom-0' ],
      loading: {
        all: false,
        get: false,
        single: []
      },
      videos: [],
    }
  },
  methods: {
    async list() { 
      this.loading.get = true
      this.err = ''
      // this.videos = []
      const response = await fetch(this.api+'/check', {
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
        let index
        for(index in this.videos) {
          this.loading.single[index] = false
        }
      } else {
        this.err = await response.statusText;
      }
      this.loading.get = false
      setTimeout(() => { 
        this.bgstyles[2] = document.querySelector('main').offsetHeight > screen.height ? true : false
      }, 0)
    },
    async downloadall(type) {
      this.loading.all = true
      let promises = []
      let video
      for (video of this.videos) {
        promises.push(this.download(video, type))
      }
      Promise.all(promises)
        .then(() => this.loading.all = false)
    },
    async onedownload(video, type, index) {
      this.loading.single[index] = true
      await this.download(video, type)
      this.loading.single[index] = false
    },
    async download(video, type) {
      await fetch(this.api+`/${type}?id=${video.id}`, {
        method: 'GET'
      })
        .then(resp => resp.blob())
        .then(blob => {
          if (type == "audio") {
            download(blob, video.title.replace(/[^\x20-\x7E]/g, "")+'.mp3');
          } else {
            download(blob, video.title.replace(/[^\x20-\x7E]/g, "")+'.mp4');
          }
        })
        .catch(err => {
          this.err = err;
        })
    }
  }
}
</script>

