const windowStateManager = require('electron-window-state');
const contextMenu = require('electron-context-menu');
const { app, BrowserWindow, ipcMain } = require('electron');
const serve = require('electron-serve');
const path = require('path');

try {
	require('electron-reloader')(module);
} catch (e) {
	console.error(e);
}

const serveURL = serve({ directory: '.' });
const port = process.env.PORT || 5173;
const dev = !app.isPackaged;

const WIDTH = 420;
const HEIGHT = 800;

let mainWindow;

function createWindow() {
	let windowState = windowStateManager({
		defaultWidth: WIDTH,
		defaultHeight: HEIGHT
	});

	const mainWindow = new BrowserWindow({
		backgroundColor: 'whitesmoke',
		titleBarStyle: 'hidden',
		autoHideMenuBar: true,
		trafficLightPosition: {
			x: 17,
			y: 32
		},
		minHeight: HEIGHT,
		minWidth: WIDTH,
		maxHeight: HEIGHT,
		maxWidth: WIDTH,
		webPreferences: {
			enableRemoteModule: true,
			contextIsolation: true,
			nodeIntegration: true,
			spellcheck: false,
			devTools: dev,
			preload: path.join(__dirname, 'preload.cjs')
		},
		x: windowState.x,
		y: windowState.y,
		width: windowState.width,
		height: windowState.height
	});

	windowState.manage(mainWindow);

	mainWindow.once('ready-to-show', () => {
		mainWindow.show();
		mainWindow.focus();
	});

	mainWindow.on('close', () => {
		windowState.saveState(mainWindow);
	});

	return mainWindow;
}

contextMenu({
	showLookUpSelection: false,
	showSearchWithGoogle: false,
	showCopyImage: false,
	prepend: (defaultActions, params, browserWindow) => [
		{
			label: 'Make App 💻'
		}
	]
});

function loadVite(port) {
	mainWindow.loadURL(`http://localhost:${port}`).catch((e) => {
		console.log('Error loading URL, retrying', e);
		setTimeout(() => {
			loadVite(port);
		}, 200);
	});
}

function createMainWindow() {
	mainWindow = createWindow();
	mainWindow.once('close', () => {
		mainWindow = null;
	});

	if (dev) loadVite(port);
	else serveURL(mainWindow);
}

app.once('ready', createMainWindow);
app.on('activate', () => {
	if (!mainWindow) {
		createMainWindow();
	}
});
app.on('window-all-closed', () => {
	if (process.platform !== 'darwin') app.quit();
});

ipcMain.on('to-main', (event, count) => {
	return mainWindow.webContents.send('from-main', `next count is ${count + 1}`);
});

ipcMain.handle('get/players', async (_, path) => {
	console.log(path);

	// Get folder metadata

	// Get latest slippi file based on recent update metadata of Slippi folder

	// If no files containing name - scan for latest

	// Copy file with new name

	const { SlippiGame } = require('@slippi/slippi-js');

	const game = new SlippiGame(path);

	const settings = game.getSettings();
	const metadata = game.getMetadata();
	const stats = game.getStats();

	mainWindow.webContents.send('get-settings', settings);
	mainWindow.webContents.send('get-metadata', metadata);
	mainWindow.webContents.send('get-stats', stats);

	ReadFolderData();
});

function GetNewestFileInFolder() {
	const fs = require('fs');
	const path = require('path');

	const files = fs.readdirSync(dir).map((filename) => path.parse(filename).name);
	console.log(files);
	// return newest file - highest value file name
}

function GetSlippiFromPython() {
	const { spawn } = require('child_process');

	const childPython = spawn('python3', [`src/python/venv/slippi-data.py`, path]);

	childPython.stdout.on('data', (data) => {
		mainWindow.webContents.send('get-data', `${data}`);
	});
	childPython.stderr.on('data', (data) => {
		mainWindow.webContents.send('remove-data', `${data}`);
	});
}
