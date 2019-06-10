
const electron = require('electron');
const { app, BrowserWindow } = electron;
const path = require('path');
const url = require('url');
const globalShortcut = electron.globalShortcut;

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow = undefined;

function createWindow() {
  // Create the browser window.
  const { screen } = electron;
  const { width, height } = screen.getPrimaryDisplay().workAreaSize;
  mainWindow = new BrowserWindow({ width: width, height: height, show: false, fullscreen: true });

  mainWindow.setMenu(null);  
  // FOR DEBUGGIN TODO REMOVE!
  globalShortcut.register('f5', function() {		
	mainWindow.reload()
  });
  globalShortcut.register('f6', function() {
	mainWindow.webContents.openDevTools();  
  });

  // Emitted when the window is closed.
  mainWindow.on('closed', () => {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    mainWindow = null
  })

  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });

  // and load the index.html of the app.
  // const htmlFilePath = process.argv[2];
  const htmlFilePath = "../electron_prod.html";
  console.log("Loading URL: " + htmlFilePath);
  mainWindow.loadURL(url.format({
    pathname: path.join(__dirname, htmlFilePath),
    protocol: 'file:',
    slashes: true
  }));
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', () => {
  /*electron.protocol.interceptFileProtocol('file', (request, callback) => {
    const url = request.url.substr(7)    // all urls start with 'file://'
    callback({ path: path.normalize(`${__dirname}/${url}`)})
  }, (err) => {
    if (err) console.error('Failed to register protocol')
  });*/
  createWindow();
});

// Quit when all windows are closed.
app.on('window-all-closed', function () {
  // On OS X it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', function () {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (mainWindow === null) {
    createWindow()
  }
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
