const express = require('express');
const fs = require('fs-extra');
const morgan = require('morgan');
const helmet = require('helmet')
const cors = require('cors')
require('dotenv').config();
const app = express();
app.enable('trust proxy');
const ytpl = require('ytpl');
const ytdlwrap = require('youtube-dl-wrap');
ytdlwrap.downloadFromGithub();
const ffmpeg = require('@ffmpeg-installer/ffmpeg');
const ytdl = new ytdlwrap();

app.use(helmet())
app.use(cors())
app.use(morgan('common'));
app.use(express.json());

fs.emptyDirSync('downloaded')
let filecount = 0

async function dl(url, format, filename) {
  // options : video / audio
  const arguments = {
    audio: [url, "-x", "--no-continue", "--audio-quality", "0", "--audio-format", "mp3", "-f", "bestaudio", "-o", filename, "--ffmpeg-location", ffmpeg.path],
    video: [url, "-f", "bestvideo[ext=mp4]+bestaudio[ext=m4a]/mp4", "-o", filename, "--ffmpeg-location", ffmpeg.path]
  }
  return new Promise(resolve => {
    ytdl.exec(arguments[format])
      .on("progress", (progress) => console.log(progress.percent, progress.totalSize, progress.currentSpeed, progress.eta))
      .on("youtubeDlEvent", (eventType, eventData) => console.log(eventType, eventData))
      .on("error", (error) => console.error(error))
      .once("close", () => {
        console.log("all done")
        resolve()
      })
  })
}

app.use(async (req,res,next) => {
  const body = req.body
  if (body.url) {
    next()
  } else {
    res.statusMessage = "didn't include url"
    res.sendStatus(400)
  }
})

app.all('/audio', async (req,res) =>{
  url = req.body.url
  const filename = `downloaded/${filecount}.%(ext)s`
  const filenamefinal = `downloaded/${filecount}.mp3`
  filecount += 1
  await dl(url, 'audio', filename)
  res.download(filenamefinal)
  fs.remove(filenamefinal)
});

app.all('/video', async (req,res) =>{
  url = req.body.url
  const filename = `downloaded/${filecount}.mp4`
  filecount += 1
  await dl(url, 'video', filename)
  res.download(filename)
  fs.remove(filename)
});

app.all('/getinfo', async (req,res) =>{
  res.json(await ytdl.getVideoInfo(req.body.url))
});

app.all('/playlist', async (req,res) =>{
  url = req.body.url
  if (await ytpl.validateID(url)) {
    res.json(
      await ytpl(url)
      .then(data => {
        return data
      })
      .catch(e => {
        res.statusMessage(e)
        res.sendStatus(500)
      })
    )
  } else {
      res.statusMessage = 'invalid url'
      res.sendStatus(400)
    }
});

const PORT = process.env.PORT || 8080
app.listen(PORT, () => console.log(`app listening on ${PORT}`))

