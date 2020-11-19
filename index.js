const express = require('express');
const morgan = require('morgan');
const cors = require('cors')
require('dotenv').config();
const app = express();
app.enable('trust proxy');
const ytdl = require('ytdl-core');
const ytpl = require('ytpl');
const secure = require('ssl-express-www');

app.use(morgan('common'));
app.use(cors())
app.use(secure)
app.use(express.json());
app.use(express.static('dist/'));

app.post('/check', async (req, res) => {
  let playlistregex = /\/playlist\?list=/;
  let videos = []
  let url = req.body.url;
  try {
    if (playlistregex.test(url)) {
      ytpl(url)
        .then(info => info.items)
        .then(info => {
          let video
          for (video of info) {
            videos.push({
              title: video.title,
              id: video.id,
              duration: video.duration,
            });
          }
          res.json(videos)
        })
        .catch(err => { 
          res.statusMessage = "can't download video(s) data. probably wrong url : "+err
          res.sendStatus(400)
        })
    } else {
      ytdl.getBasicInfo(url)
        .then(info => info.player_response.videoDetails)
        .then(info => {
          let duration = (info.lengthSeconds/60).toString()
          duration = duration.substring(0, duration.indexOf('.'))+':'+Math.floor((info.lengthSeconds%60).toString())
          videos.push({
            title: info.title,
            id: info.videoId,
            duration: duration
          });
          res.json(videos)
        })
        .catch(err => { 
          res.statusMessage = "can't download video(s) data. probably wrong url : "+err
          res.sendStatus(400)
        })
    }
  } catch(err) {
    res.statusMessage = "can't download video(s) data. probably wrong url : "+err
    res.sendStatus(400)
  }
})

app.get('/audio', async (req, res) => {
  try {
    var url = req.query.id;
    res.header('Content-Disposition', `attachment; filename="audio.mp3"`);
    ytdl(url, {
      format: 'mp3',
      filter: 'audioonly',
    }).pipe(res);

  } catch (err) {
    res.statusMessage = err
    res.sendStatus(400)
  }
});

app.get('/video', async (req, res) => {
  try {
    var url = req.query.id;
    res.header('Content-Disposition', `attachment; filename="audio.mp4"`);
    ytdl(url, {
      format: 'mp4',
    }).pipe(res);

  } catch (err) {
    res.statusMessage = err
    res.sendStatus(400)
  }
});


let PORT = process.env.PORT || 80
app.listen(PORT, () => {
  console.log(`Listening at port :${PORT}`);
});
