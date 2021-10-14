import { app, Menu, Tray } from "electron";
import path from "path";
import {
  cancelScheduleJob,
  setScheduleJob,
  updateWallpaper,
} from "./wallpaper";
import Store from "electron-store";
import fs from "fs";

const store = new Store();

let tray: Tray | null = null;
const isDev = process.env.NODE_ENV === "development";

export function setupTary() {
  const minute = store.get("schedule") || 0;

  const iconPath = isDev
    ? path.join(__dirname, "..", "..", "icons/icon.png")
    : path.join(__dirname, "..", "..", "..", "icons/icon.png");

  tray = new Tray(iconPath);

  const contextMenu = Menu.buildFromTemplate([
    {
      label: "更新壁纸",
      type: "normal",
      click: () => {
        updateWallpaper();
      },
    },
    {
      label: "自动更新",
      type: "submenu",
      submenu: [
        {
          label: "关闭",
          type: "radio",
          click: () => store.set("minute", 0),
          checked: minute === 0,
        },
        {
          label: "1分钟",
          type: "radio",
          click: () => store.set("minute", 1),
          checked: minute === 1,
        },
        {
          label: "15分钟",
          type: "radio",
          click: () => store.set("minute", 15),
          checked: minute === 15,
        },
        {
          label: "30分钟",
          type: "radio",
          click: () => store.set("minute", 30),
          checked: minute === 30,
        },
        {
          label: "60分钟",
          type: "radio",
          click: () => store.set("minute", 60),
          checked: minute === 60,
        },
        {
          label: "12小时",
          type: "radio",
          checked: minute === 12 * 60,
          click: () => store.set("minute", 12 * 60),
        },
      ],
    },
    {
      label: "退出",
      type: "normal",
      click: () => {
        cancelScheduleJob();
        app.quit();
      },
    },
  ]);
  tray.setToolTip("每刻壁纸");
  tray.setContextMenu(contextMenu);
  // 开启自动更新调度
  setScheduleJob();
}
