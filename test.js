const ytdlwrap = require('youtube-dl-wrap');
ytdlwrap.downloadFromGithub();
const ffmpeg = require('@ffmpeg-installer/ffmpeg');
const ytdl = new ytdlwrap();

url = 'https://soundcloud.com/secret-service-862007284/industry-baby'
audio1 = [url, "-x", "--no-playlist", "--no-continue", "--audio-quality", "0", "--audio-format", "mp3", "-f", "bestaudio", "--ffmpeg-location", ffmpeg.path],
audio2 = ['https://www.youtube.com/watch?v=7yaWcRmjlcw&list=PLnYA0n5BTNscOOfiChjEcHQu8XH7L3AWd&index=8', '-x', '--no-playlist', '--no-continue', '--audio-quality', '0', '--audio-format', 'mp3', '-f', 'bestaudio', '--ffmpeg-location', '/home/mirsella/dev/dl/node_modules/.pnpm/@ffmpeg-installer+ffmpeg@1.1.0/node_modules/@ffmpeg-installer/linux-x64/ffmpeg', "-o",  "1.mp3"]
video = [url, "-f", "--no-playlist", "bestvideo[ext=mp4]+bestaudio[ext=m4a]/mp4", "--ffmpeg-location", ffmpeg.path]


ytdl.exec(audio2)
  .on("progress", (progress) => console.log(progress.percent, progress.totalSize, progress.currentSpeed, progress.eta))
  .on("youtubeDlEvent", (eventType, eventData) => console.log(eventType, eventData))
  .on("error", (error) => {
    throw error
  })
  .once("close", () => {
    console.log("all done")
  })
