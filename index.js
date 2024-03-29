const express = require('express');
const fs = require('fs-extra');
const morgan = require('morgan');
const helmet = require('helmet')
const cors = require('cors')
const secure = require('ssl-express-www');
require('dotenv').config();
const app = express();
app.enable('trust proxy');
const ytpl = require('ytpl');
const ytdlwrap = require('youtube-dl-wrap');
ytdlwrap.downloadFromGithub();
const ffmpeg = require('@ffmpeg-installer/ffmpeg');
const ytdl = new ytdlwrap("./youtube-dl");

app.use(cors())
// app.use(cors({ origin: true, credentials: true }));
// app.use(helmet())
app.use(
  helmet({
    contentSecurityPolicy: false,
  })
);
// app.use(secure)
app.use(morgan('common'));
app.use(express.json());
app.use(express.static('dist/'));

fs.emptyDirSync('downloaded')
let filecount = 0

async function dl(url, format, filename) {
  const arguments = {
    audio: [url, "-x", "--no-playlist", "--no-continue", "--audio-quality", "0", "--audio-format", "mp3", "-f", "bestaudio", "-o", filename, "--ffmpeg-location", ffmpeg.path],
    video: [url, "--no-playlist", "-f", "bestvideo[ext=mp4]+bestaudio[ext=m4a]/mp4", "-o", filename, "--ffmpeg-location", ffmpeg.path]
  }
  console.log(arguments[format])
  return new Promise((resolve, reject) => {
    ytdl.exec(arguments[format])
      .on("progress", (progress) => console.log(progress.percent, progress.totalSize, progress.currentSpeed, progress.eta))
      .on("youtubeDlEvent", (eventType, eventData) => console.log(eventType, eventData))
      .on("error", (error) => {
        console.log('reject')
        const regex = /ERROR: (.*)/
        errorstring = error.message.toString()
        extracted = errorstring.match(regex)[1]
        reject(extracted)
      })
      .once("close", () => {
        console.log("all done")
        resolve()
      })
  })
}

app.use(async (req,res,next) => {
  res.header("Access-Control-Allow-Origin", "*");
  const body = req.body
  if (body.url) {
    next()
  } else {
    res.statusMessage = "didn't include url"
    res.sendStatus(400)
  }
})

app.post('/audio', async (req,res) =>{
  res.header("Access-Control-Allow-Origin", "*");
  url = req.body.url
  filecount += 1
  const filename = `downloaded/${filecount}.%(ext)s`
  const filenamefinal = `downloaded/${filecount}.mp3`
  await dl(url, 'audio', filename)
    .then(() => {
      res.download(filenamefinal)
      fs.remove(filename)
      fs.remove(filenamefinal)
    })
    .catch(e => {
      res.statusMessage = e
      res.sendStatus(400)
    })
});

app.post('/video', async (req,res) =>{
  res.header("Access-Control-Allow-Origin", "*");
  url = req.body.url
  filecount += 1
  const filename = `downloaded/${filecount}.mp4`
  await dl(url, 'video', filename)
    .then(() => {
      res.download(filename)
    })
    .catch(e => {
      res.statusMessage = e
      res.sendStatus(400)
    })
});

app.post('/getinfo', async (req,res) =>{
  res.header("Access-Control-Allow-Origin", "*");
  console.log(req.body.url)
  res.json(
    await ytdl.getVideoInfo(req.body.url)
    .catch(e => {
      console.log(e)
      res.statusMessage = e
      res.sendStatus(400)
    })
  )
});

app.post('/playlist', async (req,res) =>{
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


const PORT = process.env.PORT
app.listen(PORT, () => console.log(`app listening on ${PORT}`))
