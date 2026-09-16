# ToolTrack — BodegaControl ORIMEC

Aplicación de escritorio para el control de bodega de ORIMEC C.A.: inventario de activos, préstamos y devoluciones, consumibles, calibraciones, personal técnico y reportes, con sincronización en tiempo real sobre Firebase.

## Stack técnico

- React 19 + TypeScript + Vite
- Tailwind CSS
- Firebase (Authentication + Firestore)
- Electron (empaquetado de escritorio con `electron-builder`)
- Recharts (gráficos del panel de control), jsPDF (documentos imprimibles)

## Requisitos previos

- Node.js 18 o superior
- Un proyecto de Firebase con **Authentication** (correo/contraseña) y **Firestore** habilitados

## Configuración

1. Instala las dependencias:

   ```bash
   npm install
   ```

2. Copia `.env.example` a `.env` y completa los valores con la configuración de tu proyecto de Firebase (Configuración del proyecto → Tus apps → SDK de Firebase):

   ```bash
   cp .env.example .env
   ```

   | Variable | Descripción |
   | --- | --- |
   | `VITE_FIREBASE_API_KEY` | API key del proyecto de Firebase |
   | `VITE_FIREBASE_AUTH_DOMAIN` | Dominio de autenticación |
   | `VITE_FIREBASE_PROJECT_ID` | ID del proyecto |
   | `VITE_FIREBASE_STORAGE_BUCKET` | Bucket de almacenamiento |
   | `VITE_FIREBASE_MESSAGING_SENDER_ID` | Sender ID de Firebase Cloud Messaging |
   | `VITE_FIREBASE_APP_ID` | ID de la app web |
   | `VITE_FIREBASE_MEASUREMENT_ID` | ID de Google Analytics (opcional) |
   | `VITE_BOOTSTRAP_ADMIN_EMAIL` | Correo de la cuenta que se auto-asigna el rol de Administrador al registrarse por primera vez |

   El archivo `.env` no se sube al repositorio (ver `.gitignore`).

3. Publica las reglas de seguridad de `firestore.rules` en tu proyecto de Firebase (consola de Firebase → Firestore Database → Reglas, o `firebase deploy --only firestore:rules` con el Firebase CLI). Sin estas reglas, cualquier cliente con las credenciales del proyecto podría leer o modificar los datos directamente.

## Scripts disponibles

| Comando | Descripción |
| --- | --- |
| `npm run dev` | Levanta el servidor de desarrollo de Vite |
| `npm run build` | Compila TypeScript y genera el build de producción |
| `npm run lint` | Ejecuta ESLint sobre el proyecto |
| `npm run preview` | Sirve el build de producción localmente |
| `npm run electron` | Abre la app empaquetada con Electron (requiere `build` previo) |
| `npm run dist` | Genera el instalador de Windows (`.exe`) con `electron-builder` |

## Roles de usuario

| Rol | Alcance |
| --- | --- |
| **Administrador** | Acceso total: gestión de personal, fusión de perfiles duplicados, asignación de herramientas personales y cambio de roles de otros usuarios. |
| **Bodeguero** | Operación diaria de bodega: inventario, préstamos, consumibles, calibraciones y resolución de solicitudes. |
| **Ingeniero** | Consulta el inventario disponible y gestiona sus propias solicitudes de préstamo. |

El rol de Administrador **no puede auto-asignarse** desde el formulario de registro público; únicamente la cuenta definida en `VITE_BOOTSTRAP_ADMIN_EMAIL` lo recibe automáticamente, y a partir de ahí un administrador promueve a otros usuarios desde la ficha de Personal Técnico.

## Estructura del proyecto

```
src/
  componentes/       Vistas por pestaña (inventario, préstamos, consumibles, etc.)
  componentes/modales/  Modales de detalle, formularios y confirmaciones
  firebase.ts        Inicialización de Firebase (lee variables de entorno)
  tipos.ts           Modelos de datos compartidos
  utilidades.ts      Importación CSV, exportación de reportes y utilidades varias
main.js              Proceso principal de Electron
firestore.rules      Reglas de seguridad recomendadas para Firestore
```

## Notas de seguridad

- Las credenciales de Firebase se cargan desde variables de entorno; nunca deben quedar escritas directamente en el código fuente ni subirse al control de versiones.
- `main.js` ejecuta la ventana de Electron con `contextIsolation` activo y sin integración de Node en el renderer, y bloquea la apertura de ventanas o navegación fuera de la app empaquetada.
- Las contraseñas de las cuentas requieren un mínimo de 8 caracteres.
- Revisa periódicamente en la consola de Firebase que las reglas de Firestore y Authentication sigan activas (no en "modo de prueba") y que solo las cuentas necesarias tengan rol de Administrador.
