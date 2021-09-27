<template>
  <main class="flex flex-col min-h-screen font-bold text-white bg-black">
    <h1 class="m-5 text-xl text-center text-transparent md:text-5xl bg-clip-text bg-gradient-to-r from-pink-600 via-purple-600 to-purple-900">Yet Another Youtube-DL</h1>
    <form @submit.prevent="search()" name="form" class="inline-flex my-2">
      <a @mouseover="gitover=true" @mouseleave="gitover=false" href="https://github.com/mirsella/tutubedl" target="_blank" class="m-auto mx-1">
        <img v-if="!gitover" src="./assets/github.png" alt="github" class="w-12">
        <img v-if="gitover" src="./assets/github-face.png" alt="github" class="w-12">
      </a>
      <input ref="searchbar" type="text" v-model="url" placeholder="url" class="w-full h-10 p-2 text-base leading-normal rounded-l-lg bg-gradient-to-r from-pink-600 to-purple-600 md:text-lg placeholder-current focus:outline-none">
      <button class="inline-flex justify-center ml-1 mr-2 focus:outline-none">
        <span class="w-24 h-10 px-4 py-2 rounded-r-lg md:text-lg md:w-48 bg-gradient-to-r from-purple-600 to-purple-900 hover:from-purple-700">
          <svg v-if="loading.get" class="inline-flex w-5 h-4 mb-1 mr-3 text-white animate-spin" fill="none" viewBox="0 0 24 24">
            <path class="bg-purple-600 opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span :class="{ hidden: loading.get }" class="md:inline-block">search</span>
        </span>
      </button>
    </form>
    <h1 v-if="err" class="m-10 text-red-700 place-self-center">{{err}}</h1>
    <div v-if="videos.length > 1" class="m-5 w-min place-self-center">
      <div class="p-1 mb-1 text-center rounded-t-lg bg-gradient-to-r from-pink-500 via-pink-600 to-purple-700">
        download all :
      </div>
      <div class="w-auto inline-flex">
        <button @click="downloadallaudio()" class="px-8 py-2 mr-1 text-white bg-purple-700 rounded-bl-lg bg-gradient-to-r from-pink-500 to-pink-600 focus:outline-none place-self-center">
          audio
        </button>
        <button @click="downloadallvideo()" class="px-8 py-2 text-white bg-purple-700 rounded-br-lg bg-gradient-to-r from-pink-600 to-purple-700 focus:outline-none place-self-center">
          video
        </button>
      </div>
      <svg v-if="loading.all" class="w-5 mx-auto mt-5 animate-spin place-self-center" fill="none" viewBox="0 0 24 24">
        <path class="bg-purple-600 opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
      </svg>
    </div>
    <div :key="index" v-for="(video, index) in videos" class="flex justify-center">
      <div class="w-1/2 items-center block m-10 md:flex justify-center">
        <div class="flex justify-center md:w-1/2 w-full">
          <img class="w-50" :src="video.thumbnail">
        </div>
        <div class="md:w-1/2">
          <div class="m-3 text-center">
            <button @click="downloadaudio(index)" class="px-4 py-2 mx-px text-center text-white bg-purple-700 rounded-l-lg bg-gradient-to-r from-pink-500 to-pink-600 focus:outline-none hover:bg-purple-800" target="_blank"> audio </button>
            <button @click="downloadvideo(index)" class="px-4 py-2 mx-px text-center text-white bg-purple-700 rounded-r-lg bg-gradient-to-r from-pink-600 to-purple-700 focus:outline-none hover:bg-purple-800" target="_blank"> video </button>
            <svg v-if="loading.single[index]" class="inline-block h-4 ml-2 text-white animate-spin" fill="none" viewBox="0 0 24 24">
              <path class="bg-purple-600 opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          </div>
          <div class="flex justify-center md:w-full">
            <span class="m-2 text-transparent bg-clip-text bg-gradient-to-r from-pink-500 via-pink-600 to-purple-700">{{video.title}} {{video.duration}}</span>
          </div>
        </div>
        <div noshade class="h-1 bg-gradient-to-r from-pink-500 via-pink-600 to-purple-700 rounded"></div>
      </div>
    </div>
  </main>
</template>

<script>
import download from 'downloadjs'
import axios from 'axios'

export default {
  name: 'App',
  data() {
    return {
      // apiurl: 'https://tutubedl.herokuapp.com',
      apiurl: 'http://localhost:8080',
      url: 'https://soundcloud.com/secret-service-862007284/industry-baby',
      err: '',
      gitover: false,
      loading: {
        all: false,
        get: false,
        single: []
      },
      videos: []
    }
  },
  methods: {
    async search() {
      this.loading.get = true
      this.err = ''
      if (this.url.includes('playlist?list=')) {
        await axios.post(this.apiurl + '/playlist',
          { url: this.url },
          { headers: { 'Content-Type': 'application/json'} }
        )
          .then(res => {
            if (res.status === 200) {
              this.videos = res.data.items.map(e => {
                return {
                  title: e.title,
                  url: e.url,
                  duration: e.duration,
                  thumbnail: e.bestThumbnail.url
                }
              })
            } else {
              this.err = res.statusText
            }
          })
      } else {
        await axios.post(this.apiurl + '/getinfo',
          { url: this.url },
          { headers: { 'Content-Type': 'application/json'} }
        )
          .then(res => {
            if (res.status === 200) {
              this.videos = [{
                title: res.data.title,
                duration: `${Math.floor(res.data.duration / 60)}:${Math.floor(res.data.duration % 60)}`,
                thumbnail: res.data.thumbnail,
                url: res.data.webpage_url
              }]
            } else {
              this.err = res.statusText
            }
          })
      }
      this.loading.get = false
    },
    async downloadvideo(index) {
      this.loading.single[index] = true
      await axios.post(this.apiurl + '/video',
        { url: this.videos[index].url },
        { headers: { 'Content-Type': 'application/json'}, responseType: 'blob' }
      )
        .then(res => {
          // download(res.data, this.videos[index].title.replace(/[^\x20-\x7E]/g, "")+'.mp3');
          download(res.data, this.videos[index].title+'.mp3');
        })
        .catch(e => {
          this.err = e.response.data
        })
      this.loading.single[index] = false
    },
    async downloadaudio(index) {
      this.loading.single[index] = true
      await axios.post(this.apiurl + '/audio',
        { url: this.videos[index].url },
        { headers: { 'Content-Type': 'application/json'}, responseType: 'blob' }
      )
        .then(res => {
          if(res.status === 200) {
            // download(res.data, this.videos[index].title.replace(/[^\x20-\x7E]/g, "")+'.mp4');
            download(res.data, this.videos[index].title+'.mp4');
          } else {
            console.log('in error', res.statusText)
            this.err = res.statusText
          }
        })
      this.loading.single[index] = false
    },
    async downloadallvideo() {
      this.loading.all = true
      let promises = []
      let index
      for (index in this.videos) {
        promises.push(this.downloadvideo(index))
      }
      Promise.all(promises)
        .then(() => this.loading.all = false)
    },
    async downloadallaudio() {
      this.loading.all = true
      let promises = []
      let index
      for (index in this.videos) {
        promises.push(this.downloadaudio(index))
      }
      Promise.all(promises)
        .then(() => this.loading.all = false)
    }
  },
  mounted() {
    this.$refs.searchbar.focus()
    // ping heroku server to pre wake it up
    // fetch(this.apiurl)
  },
}
</script>
