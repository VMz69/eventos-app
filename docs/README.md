# Eventos APP

Aplicación móvil desarrollada con React Native y Expo para la gestión de eventos, asistencia y participación de usuarios. El proyecto fue realizado como parte de la actividad final de la materia, aplicando trabajo colaborativo mediante Git y desarrollo por ramas, una rama para cada participante de esta actividad de acuerdo a los criterios de la Ruta de Aprendizaje.

---

## Descripción

Eventos App permite a los usuarios:

- Registrarse e iniciar sesión
- Iniciar sesión con Google (en Web al correr en `localhost:8081`)
- Crear eventos
- Editar y eliminar eventos propios
- Confirmar asistencia a eventos
- Comentar y dar puntaje a los eventos
- Visualizar estadísticas básicas de los eventos

La aplicación fue desarrollada utilizando una arquitectura basada en componentes y navegación modular con Expo Router.

---

## Tecnologías utilizadas en la APP

- React Native
- Expo
- Expo Router
- TypeScript
- Firebase Authentication
- Firebase Firestore
- React Context API

---

## Arquitectura del APP

El proyecto utiliza una arquitectura modular separada por funcionalidades para facilitar el mantenimiento y escalabilidad del código.

### Frontend
La interfaz fue desarrollada con React Native utilizando Expo.

### Backend
Se utilizó Firebase como Backend as a Service (BaaS), aprovechando:

- Autenticación ya incluida
- Base de datos Firestore
- Persistencia de datos en tiempo real

### Navegación
La navegación se implementó utilizando Expo Router mediante rutas basadas en archivos.

---

## Estructura del proyecto

```text
app/
 ├── (auth)
 │    ├── login.tsx
 │    └── register.tsx
 │
 ├── (tabs)
 │    ├── index.tsx
 │    ├── create.tsx
 │    └── stats.tsx
 │
 └── event
      ├── [id].tsx
      └── EventDetailScreen.tsx

src/
 ├── components
 ├── context
 ├── services
 ├── types
 ├── utils
 └── constants

docs/
 ├── LICENSE.md
 ├── Manual de desarrollador y usuario.pdf
 └── Documentacion.pdf
```

---

## Instalación

### 1. Clonar el repositorio

```bash
git clone https://github.com/VMz69/eventos-app.git
```

### 2. Instalar dependencias

```bash
npm install
```

### 2.1 Si falla: revisar los mensajes/logs para utilizar la versión de Node 20^

```bash 
nvm install 20
nvm use 20
```

### 3. Configurar variables de entorno

Agregar el archivo `.env` en la raíz del proyecto. Puede crearse a partir del `.env.example` y deben agregarse todos los `secrets` dentro de el. 

Ejemplo:

```env
EXPO_PUBLIC_FIREBASE_API_KEY=...
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=...
EXPO_PUBLIC_FIREBASE_PROJECT_ID=...
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=...
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
EXPO_PUBLIC_FIREBASE_APP_ID=...
```

---

## Ejecución del proyecto

```bash
npx expo start
```

---

## Usuarios de prueba

```text
1. user@test.com
   Password: 123456

2. user2@test.com
   Password: 123456
```

---

### Comandos importantes 

- `w` para usar la App en Web
- `i` para el simulador iOS en dispositivos MacOS
- `a` par el simulador Android
- Se puede escanear desde el celular en Android/iOS si se tiene instalada la app Expo GO.

## Funcionalidades principales

### Autenticación
- Registro de usuarios
- Inicio de sesión
- Login con Google (sólo en web, `w`)

### Gestión de eventos
- Crear eventos
- Editar eventos
- Eliminar eventos
- Ver detalles

### Participación
- Confirmar asistencia (RSVP)
- Comentar eventos
- Puntuar eventos

### Estadísticas
- Visualización básica de datos y actividad

---

## Flujo del APP

```text
Usuario → Login/Registro → Lista de Eventos → Seleccionar Evento

Si es creador:
- Editar evento
- Eliminar evento

Si es participante:
- Confirmar asistencia
- Comentar
- Puntuar
```

---

## Mockups

Mockups desarrollados en Figma:

https://www.figma.com/proto/yWNTjbwcgw2qKDVOtCDSEZ/App_Eventos?node-id=1-907&t=2y7Z61bKyunRQ8zG-0&scaling=min-zoom&content-scaling=fixed&page-id=0%3A1&starting-point-node-id=1%3A907

---

## Capturas de pantalla

> Las capturas oficiales de la aplicación se encuentran dentro de la carpeta `/docs/screenshots`. A continuación algunas capturas

## Capturas de pantalla

### Autenticación

<p align="center">
  <img src="docs/capturas/login.png" width="250"/>
  <img src="docs/capturas/sign-up.png" width="250"/>
  <img src="docs/capturas/post-login.png" width="250"/>
</p>

---

### Gestión de eventos

<p align="center">
  <img src="docs/capturas/home.png" width="250"/>
  <img src="docs/capturas/create-event.png" width="250"/>
  <img src="docs/capturas/edit-event.png" width="250"/>
</p>

---

<details>
  <summary>Ver más capturas...</summary>

  <br>

  <p align="center">
    <img src="docs/capturas/view-existing-event-owner.png" width="250"/>
    <img src="docs/capturas/view-existing-event-not-owner.png" width="250"/>
  </p>

  <p align="center">
    <img src="docs/capturas/delete-event-dialog.png" width="250"/>
    <img src="docs/capturas/event-deleted-confirmation.png" width="250"/>
    <img src="docs/capturas/history.png" width="250"/>
  </p>

</details>

---

## Integrantes del Grupo DPS941

- Fernando Gomez
- Jose Aquino
- Milton Ayala
- Victor Velasco
- William Montano

---

## Flujo de trabajo Git

Para mantener el trabajo colaborativo, cada integrante trabajó en su propia rama de Git y las integraciones se realizaron mediante Pull Requests hacia la rama principal. Estas eran aprobadas por el lider del equipo.

---

## Licencia

Este proyecto se distribuye bajo la licencia Creative Commons CC BY-NC-SA 4.0.

La licencia fue seleccionada para permitir el aprendizaje y reutilización académica del proyecto, evitando usos comerciales no autorizados y manteniendo el reconocimiento al equipo desarrollador. Puede ver mas información en `/docs` o en el enlace de abajo:

Más información:
https://creativecommons.org/licenses/by-nc-sa/4.0/

---

## Manual de usuario y desarrollador

La documentación técnica y manual de usuario se encuentra dentro de la carpeta:

```text
/docs
```

---


Este es un proyecto académico funcional tipo MVP desarrollado como entrega final de la materia. Puede continuar escalando con nuevas funcionalidades y mejoras futuras.
