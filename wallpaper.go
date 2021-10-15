package main

import (
	"crypto/md5"
	"encoding/hex"
	"errors"
	"fmt"
	"io/ioutil"
	"net/http"
	"os"
	"path/filepath"
	"syscall"
	"time"
	"unsafe"

	"github.com/google/uuid"
)

const (
	DownloadURL    = "https://source.unsplash.com/1920x1080"
	CurrentPathDir = "cache/"
)

func updateWallpaper() {
	fmt.Println("开始下载壁纸")
	absPath, err := DownloadImage(DownloadURL)
	fmt.Println("完成下载壁纸", absPath)
	if err != nil {
		fmt.Printf("%v", err)
		return
	}
	fmt.Println("开始设置壁纸")
	SetWindowsWallpaper(absPath)
	fmt.Println("完成设置壁纸")
}

func SetWindowsWallpaper(imagePath string) error {
	dll := syscall.NewLazyDLL("user32.dll")
	proc := dll.NewProc("SystemParametersInfoW")
	_t, _ := syscall.UTF16PtrFromString(imagePath)
	ret, _, _ := proc.Call(20, 1, uintptr(unsafe.Pointer(_t)), 0x1|0x2)
	if ret != 1 {
		return errors.New("系统调用失败")
	}
	return nil
}

// EncodeMD5 MD5编码
func EncodeMD5(value string) string {
	m := md5.New()
	m.Write([]byte(value))
	return hex.EncodeToString(m.Sum(nil))
}

func Exists(path string) bool {
	_, err := os.Stat(path) //os.Stat获取文件信息
	if err != nil {
		return os.IsExist(err)
	}
	return true
}

func DownloadImage(imageURL string) (string, error) {
	client := http.Client{Timeout: 120 * time.Second}

	request, err := http.NewRequest("GET", imageURL, nil)
	if err != nil {
		return "", err
	}

	response, err := client.Do(request)
	if err != nil {
		return "", err
	}

	body, err := ioutil.ReadAll(response.Body)

	if err != nil {
		return "", err
	}

	day := time.Now().Format("2006-01-02")
	uuid := uuid.New()
	path := CurrentPathDir + fmt.Sprintf("%s.%s", day, uuid.String()) + ".jpg"

	absPath, err := filepath.Abs(path)
	if err != nil {
		return "", err
	}

	if !Exists(CurrentPathDir) {
		os.Mkdir(CurrentPathDir, os.ModePerm)
	}

	err = ioutil.WriteFile(absPath, body, 0755)

	if err != nil {
		return "", err
	}

	return absPath, nil
}
