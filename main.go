//go:generate rsrc -ico resource/icon.ico -manifest resource/goversioninfo.exe.manifest -o main.syso

package main

import (
	_ "embed"
	"os"
	"strconv"

	"github.com/getlantern/systray"
	"github.com/jasonlvhit/gocron"
	"github.com/peterbourgon/diskv"
)

const (
	MINUTE_KEY = "minute"
)

//go:embed icons/icon.ico
var icon []byte

var store = diskv.New(diskv.Options{
	BasePath:     ".db",
	CacheSizeMax: 1024 * 1024,
})

func main() {
	systray.Run(onReady, onExit)
	loadUpdateInterval()
}

func closeItems(items []*systray.MenuItem) {
	for _, item := range items {
		item.Uncheck()
	}
}

func onReady() {
	systray.SetIcon(icon)

	systray.SetTitle("Awesome App")
	systray.SetTooltip("Pretty awesome超级棒")
	mUpdateWallpaper := systray.AddMenuItem("更新壁纸", "")
	mAutoUpdate := systray.AddMenuItem("自动更新", "")

	m0minute := mAutoUpdate.AddSubMenuItemCheckbox("关闭", "", true)
	m1minute := mAutoUpdate.AddSubMenuItemCheckbox("1分钟", "", false)
	m15minute := mAutoUpdate.AddSubMenuItemCheckbox("15分钟", "", false)
	m30minute := mAutoUpdate.AddSubMenuItemCheckbox("30分钟", "", false)
	m60minute := mAutoUpdate.AddSubMenuItemCheckbox("1小时", "", false)

	items := []*systray.MenuItem{m0minute, m1minute, m15minute, m30minute, m60minute}

	mQuit := systray.AddMenuItem("退出", "")

	go func() {
		for {
			select {
			case <-m0minute.ClickedCh:
				closeItems(items)
				m0minute.Check()
				setUpdateInterval(0)
			case <-m1minute.ClickedCh:
				closeItems(items)
				m1minute.Check()
				setUpdateInterval(1)
			case <-m15minute.ClickedCh:
				closeItems(items)
				m15minute.Check()
				setUpdateInterval(15)
			case <-m30minute.ClickedCh:
				closeItems(items)
				m30minute.Check()
				setUpdateInterval(30)
			case <-m60minute.ClickedCh:
				closeItems(items)
				m60minute.Check()
				setUpdateInterval(60)
			}
		}
	}()

	go func() {
		for {
			select {
			case <-mUpdateWallpaper.ClickedCh:
				updateWallpaper()
			case <-mQuit.ClickedCh:
				systray.Quit()
			}
		}
	}()

}

func setUpdateInterval(minute uint64) {
	store.Write(MINUTE_KEY, []byte(strconv.Itoa(int(minute))))
	gocron.Clear()

	if minute != 0 {
		gocron.Every(minute).Minute().Do(updateWallpaper)
		gocron.Start()
	}

}

func loadUpdateInterval() {
	minute, _ := store.Read(MINUTE_KEY)
	value, _ := strconv.Atoi(string(minute))

	if value != 0 {
		setUpdateInterval(uint64(value))
	}

}

func onExit() {
	os.Exit(3)
}
