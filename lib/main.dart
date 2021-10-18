import 'dart:io';
import 'dart:async';

import 'package:dio/dio.dart';
import 'package:flutter/material.dart';
import 'package:ffi/ffi.dart';
import 'package:nanoid/non_secure.dart';
import 'package:path_provider/path_provider.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:win32/win32.dart';
import 'package:system_tray/system_tray.dart';
import 'package:path/path.dart' as p;
import 'package:window_manager/window_manager.dart';

var appWindow = WindowManager.instance;

const TASK_KEY = 'TASK_MINUTE';
Timer? timer;

const DownloadURL = "https://source.unsplash.com/1920x1080";
main() async {
  SharedPreferences prefs = await SharedPreferences.getInstance();

  WidgetsFlutterBinding.ensureInitialized();
  // 设置系统托盘
  setupSystemTray();
  // 隐藏默认窗口
  WindowManager.instance.hide();

  var minutes = prefs.getInt(TASK_KEY);

  if (minutes != null && minutes > 0) {
    setTimerTask(minutes);
  }

  runApp(const WallpaperApp());
}

setWallpaper() async {
  print("开始更新壁纸");
  var path = await downloadWallpaper();

  SystemParametersInfo(20, 1, path.toNativeUtf16(), 0x2);
  print(path);
}

setTimerTask(int minute) {
  if (timer != null) {
    timer?.cancel();
  }

  var duration = Duration(minutes: minute);
  timer = Timer.periodic(duration, (timer) {
    setWallpaper();
  });
}

Future<String> downloadWallpaper() async {
  // 获取文件路径
  var path = await getApplicationSupportDirectory();
  var file = File(p.joinAll([path.path, "${nanoid()}.jpg"]));

  await Dio().download(DownloadURL, file.path);
  return file.path;
}

Future<void> setupSystemTray() async {
  String path;
  // 设置托盘图标
  if (Platform.isWindows) {
    path = p.joinAll([
      p.dirname(Platform.resolvedExecutable),
      'data/flutter_assets/assets',
      'icon.ico'
    ]);
  } else if (Platform.isMacOS) {
    path = p.joinAll(['AppIcon']);
  } else {
    path = p.joinAll([
      p.dirname(Platform.resolvedExecutable),
      'data/flutter_assets/assets',
      'icon.png'
    ]);
  }

  var systemTray = SystemTray();
  // 初始化托盘
  await systemTray.initSystemTray("每刻壁纸", iconPath: path);

  await setupSystemTrayState(systemTray);

  // handle system tray event
  systemTray.registerSystemTrayEventHandler((eventName) {
    print("eventName: $eventName");
  });
}

setupSystemTrayState(SystemTray systemTray) async {
  SharedPreferences prefs = await SharedPreferences.getInstance();

  var minutes = prefs.getInt(TASK_KEY);
  print(minutes);
  return systemTray.setContextMenu(
    [
      MenuItem(
        label: '更新壁纸',
        onClicked: () {
          setWallpaper();
        },
      ),
      MenuSeparator(),
      SubMenu(
        label: "自动更新",
        children: [
          MenuItem(
            label: "关闭${minutes == null ? '(当前)' : ''}",
            onClicked: () {
              prefs.clear();
              timer?.cancel();
              setupSystemTrayState(systemTray);
            },
          ),
          MenuItem(
            label: "1分钟${minutes == 1 ? '(当前)' : ''}",
            onClicked: () {
              print('11');
              prefs.setInt(TASK_KEY, 1);
              setTimerTask(1);
              setupSystemTrayState(systemTray);
            },
          ),
          MenuItem(
            label: "15分钟${minutes == 15 ? '(当前)' : ''}",
            onClicked: () {
              prefs.setInt(TASK_KEY, 15);
              setTimerTask(15);
              setupSystemTrayState(systemTray);
            },
          ),
          MenuItem(
            label: "30分钟${minutes == 30 ? '(当前)' : ''}",
            onClicked: () {
              prefs.setInt(TASK_KEY, 30);
              setTimerTask(30);
              setupSystemTrayState(systemTray);
            },
          ),
          MenuItem(
            label: "60分钟${minutes == 60 ? '(当前)' : ''}",
            onClicked: () {
              prefs.setInt(TASK_KEY, 60);
              setTimerTask(60);
              setupSystemTrayState(systemTray);
            },
          ),
        ],
      ),
      MenuSeparator(),
      MenuItem(
        label: '退出',
        onClicked: () {
          exit(0);
        },
      ),
    ],
  );
}

class WallpaperApp extends StatelessWidget {
  const WallpaperApp();

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      home: Scaffold(
        body: Container(
          child: Row(
            children: [],
          ),
        ),
      ),
    );
  }
}
