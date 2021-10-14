import path from "path";
import { app, BrowserWindow, Menu, screen, Tray } from "electron";
import { register } from "./communication";
import { setupTary } from "./tray";

let win: BrowserWindow | null = null;
let tray: Tray | null = null;

function bootstrap() {
  // win = new BrowserWindow({
  //   webPreferences: {
  //     preload: path.join(__dirname, "../preload/index.js"),
  //   },
  // });
  // if (app.isPackaged) {
  //   win.loadFile(path.join(__dirname, "../render/index.html"));
  // } else {
  //   win.maximize();
  //   win.webContents.openDevTools();
  //   win.loadURL(`http://localhost:${process.env.PORT}`);
  // }
  // register(win);

  setupTary();
}

app.whenReady().then(bootstrap);

// app.on("window-all-closed", () => {
//   console.log(333);
// });
