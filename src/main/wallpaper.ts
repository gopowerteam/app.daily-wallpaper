import https from "https";
import fs from "fs";
import path from "path";
import wallpaper from "wallpaper";
import schedule, { Job } from "node-schedule";
import { screen } from "electron";
import Store from "electron-store";

const store = new Store();

let job: Job | null = null;

const downloadDir = path.join("wallpapers");

export async function updateWallpaper() {
  const url = await getWallpaperUrl();
  const file = await downloadFile(url);

  wallpaper.set(path.resolve(file)).catch((...e) => {
    console.log(e);
  });
}

export function cancelScheduleJob() {
  if (job) {
    job.cancel();
  }
}

function callScheduleJob() {
  const latest = store.get("latest", 0) as number;
  const minute = store.get("minute", 0) as number;

  if (minute === 0) {
    return;
  }

  const diff = (Date.now() - latest) / 1000 / 60;

  if (minute < diff) {
    store.set("latest", Date.now());
    updateWallpaper();
  }
}

export function setScheduleJob(minute: number = 0) {
  const rule = new schedule.RecurrenceRule();
  // 每秒一次
  rule.second = Array.from(Array(60), (_, i) => i);

  job = schedule.scheduleJob(rule, () => {
    callScheduleJob();
  });
}
/**
 * 获取壁纸地址
 * @returns
 */
function getWallpaperUrl() {
  const { width, height } = screen.getPrimaryDisplay().bounds;

  return new Promise<string>((resolve, reject) => {
    https.get(`https://source.unsplash.com/${width}x${height}`, (res) => {
      if (res.statusCode === 302) {
        resolve(res.headers.location as string);
      } else {
        reject();
      }
    });
  });
}

/**
 * 下载壁纸文件
 */
function downloadFile(url: string) {
  return new Promise<string>(async (resolve, reject) => {
    if (!fs.existsSync(downloadDir)) {
      fs.mkdirSync(downloadDir);
    }

    const dest = path.join(
      downloadDir,
      Math.random().toString(32).slice(2) + ".png"
    );

    const file = fs.createWriteStream(dest);
    https.get(url, (res) => {
      if (res.statusCode !== 200) {
        reject(res.statusCode);
        return;
      }

      res.on("end", () => {
        resolve(dest);
      });

      file.on("finish", () => {
        file.close();
      });

      file.on("error", (err) => {
        fs.unlink(dest, () => {});
        reject(err.message);
      });

      res.pipe(file);
    });
  });
}
