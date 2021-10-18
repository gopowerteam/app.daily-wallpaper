import 'dart:io';
import 'dart:async';

import 'package:flutter/material.dart';
import 'package:ffi/ffi.dart';
import 'package:win32/win32.dart';
import 'package:system_tray/system_tray.dart';
import 'package:path/path.dart' as p;
import 'package:window_manager/window_manager.dart';

var appWindow = WindowManager.instance;

main() async {
  WidgetsFlutterBinding.ensureInitialized();

  setupSystemTray();

  runApp(const WallpaperApp());

  // 隐藏默认窗口
  WindowManager.instance.hide();
}

setWallpaper() {
  SystemParametersInfo(20, 1, 'D:/test.jpg'.toNativeUtf16(), 0x2);
}

Future<void> setupSystemTray() async {
  String path;

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

  // We first init the systray menu and then add the menu entries
  await systemTray.initSystemTray("system tray",
      iconPath: path, toolTip: "How to use system tray with Flutter");

  await systemTray.setContextMenu(
    [
      MenuItem(
        label: 'Show',
        onClicked: () {
          // appWindow.show();
        },
      ),
      MenuSeparator(),
      SubMenu(
        label: "SubMenu",
        children: [
          MenuItem(
            label: 'SubItem1',
            enabled: false,
            onClicked: () {
              print("click SubItem1");
            },
          ),
          MenuItem(label: 'SubItem2'),
          MenuItem(label: 'SubItem3'),
        ],
      ),
      MenuSeparator(),
      MenuItem(
        label: 'Exit',
        onClicked: () {
          // appWindow.close();
        },
      ),
    ],
  );

  // handle system tray event
  systemTray.registerSystemTrayEventHandler((eventName) {
    print("eventName: $eventName");
  });
}

class WallpaperApp extends StatelessWidget {
  const WallpaperApp();

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      home: Scaffold(
        body: Container(
          child: Row(
            children: [Text('test')],
          ),
        ),
      ),
    );
  }
}
