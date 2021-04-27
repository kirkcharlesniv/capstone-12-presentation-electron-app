const { app, BrowserWindow, ipcMain } = require("electron");
const process = require("process");
const path = require("path");
const SerialPort = require("serialport");
const Readline = require("@serialport/parser-readline");

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require("electron-squirrel-startup")) {
  // eslint-disable-line global-require
  app.quit();
}

var serialPort = new SerialPort(process.env.ARDUINO_COM_PATH, {
  baudRate: 9600,
});
const parser = serialPort.pipe(new Readline({ delimiter: "\r\n" }));

const createWindow = () => {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
  });

  // and load the index.html of the app.
  mainWindow.loadFile(path.join(__dirname, "index.html"));

  // Open the DevTools.
  // mainWindow.webContents.openDevTools();

  parser.on("data", function (data) {
    mainWindow.webContents.send("new-data-available", data);
  });
};

app.allowRendererProcessReuse = false;

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on("ready", createWindow);

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.
ipcMain.on("accept-entry", (event, arg) => {
  serialPort.write("1");
});

ipcMain.on("deny-entry", (event, arg) => {
  serialPort.write("0");
});
