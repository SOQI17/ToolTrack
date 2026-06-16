import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // ESTA LÍNEA ES LA CLAVE:
  // Le dice a Vite que use rutas relativas ("./") en lugar de absolutas ("/")
  // para que funcione al abrir el archivo index.html directamente en Electron.
  base: './', 
})