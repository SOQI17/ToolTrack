const { app, BrowserWindow } = require('electron');
const path = require('path');

function createWindow() {
  // Crear la ventana del navegador.
  const mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    title: "BodegaControl - ORIMEC",
    // Icono de la aplicación (debe estar en la carpeta public)
    icon: path.join(__dirname, 'public/Logo-Orimec.png'), 
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
  });

  // Ocultar la barra de menú por defecto (Archivo, Editar, etc.)
  mainWindow.setMenuBarVisibility(false);

  // --- CARGA DE LA APLICACIÓN ---
  
  // MODO PRODUCCIÓN (IMPORTANTE: Usa esta línea para crear el .exe)
  // Esta línea busca los archivos en la carpeta 'dist' que crea el comando build
  mainWindow.loadFile(path.join(__dirname, 'dist/index.html'));

  // MODO DESARROLLO (Solo si quieres probar con 'npm run dev' en paralelo)
  // Si usas esta, comenta la línea de arriba con //
  // mainWindow.loadURL('http://localhost:5173');
}

// Inicialización de Electron
app.whenReady().then(() => {
  createWindow();

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

// Cerrar la aplicación cuando todas las ventanas se cierran
app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit();
});