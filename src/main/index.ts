import path from "path";
import { app, BrowserWindow, screen } from "electron";
import { register } from "./communication";
import https from "https";
import fs from "fs";
import wallpaper from "wallpaper";
import schedule from "node-schedule";

let rule = new schedule.RecurrenceRule();
let win: BrowserWindow | null = null;

function bootstrap() {
  win = new BrowserWindow({
    webPreferences: {
      preload: path.join(__dirname, "../preload/index.js"),
    },
  });

  if (app.isPackaged) {
    win.loadFile(path.join(__dirname, "../render/index.html"));
  } else {
    win.maximize();
    win.webContents.openDevTools();
    win.loadURL(`http://localhost:${process.env.PORT}`);
  }

  // something init setup
  register(win);

  rule.second = 30;

  schedule.scheduleJob(rule, () => {
    updateWallpaper();
  });
}

app.whenReady().then(bootstrap);

app.on("window-all-closed", () => {
  win = null;
  app.quit();
});

async function updateWallpaper() {
  const url = await getWallpaperUrl();
  const file = await downloadFile(url);
  wallpaper.set(path.resolve(file)).catch(() => {});
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
    const dest = path.join(Math.random().toString(32).slice(2) + ".png");

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
