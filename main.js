const electron = require('electron');
const app = electron.app;
const BrowserWindow = electron.BrowserWindow;
const ipc = electron.ipcMain;
const Tray = electron.Tray;

let mainWindow;
let tray;

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 450,
        height: 450,
        useContentSize: true,
        icon: './favicon/favicon-32x32.png',
        webPreferences: {
            nodeIntegration: true
        },
    });

    setupWindow();

    mainWindow.loadFile('./index.html');
}

function setupWindow() {
    mainWindow.resizable = false;
    mainWindow.autoHideMenuBar = true;
    mainWindow.setMenuBarVisibility(false);
    mainWindow.center();
}

// ********************************************
// Life-cycle events
// ********************************************
app.on('ready', () => {
    createWindow();

    tray = new Tray('./favicon/favicon-32x32.png')
});

ipc.on('updateTrayTimer', (event, arg) => {
    tray.setToolTip(arg);
})

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
    }
});