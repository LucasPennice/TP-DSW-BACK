# Proyecto Full Stack con Node.js, Express, Next.js y React

Este proyecto consta de un backend desarrollado con Node.js y Express y un frontend con Next.js y React.

## Requisitos previos

Antes de comenzar, asegúrate de tener instalado:

- [Node.js](https://nodejs.org/) (versión recomendada: LTS)
- [npm](https://www.npmjs.com/) o [yarn](https://yarnpkg.com/) (viene con Node.js)
- [Git](https://git-scm.com/)

## Instalación y ejecución

### 1. Clonar los repositorios

Clona ambos repositorios en diferentes carpetas, el backend y el frontend:

```bash
git clone https://github.com/LucasPennice/TP-DSW-BACK.git backend
git clone https://github.com/LucasPennice/tp_dsw_front_next.git frontend
```

### 2. Instalación de dependencias

Ejecuta estos comandos en ambas carpetas (`backend` y `frontend`):

```bash
cd backend
npm install  # o yarn install
cd ../frontend
npm install  # o yarn install
```

### 3. Configuración de variables de entorno

En cada carpeta (`backend` y `frontend`), crea un archivo `.env` basado en los archivos de ejemplo `.env.example` y configura las variables necesarias.

#### Backend (`backend/.env`):
```
PORT=3000
MONGO_URI=mongodb://localhost:27017/tu_base_de_datos
JWT_SECRET=tu_secreto
```

#### Frontend (`frontend/.env.local`):
```
NEXT_PUBLIC_API_URL=http://localhost:3000
```

### 4. Ejecutar el proyecto

Ejecuta los siguientes comandos en terminales separadas para iniciar backend y frontend:

#### Iniciar el backend
```bash
cd backend
npm start  # o yarn start
```

#### Iniciar el frontend
```bash
cd frontend
npm run dev  # o yarn dev
```

### 5. Acceso a la aplicación

- **Backend**: `http://localhost:3000`
- **Frontend**: `http://localhost:3001`

## Scripts disponibles

Cada parte del proyecto tiene scripts definidos en `package.json`:

### Backend (`backend/package.json`):
- `npm start`: Inicia el servidor en modo producción
- `npm run dev`: Inicia el servidor en modo desarrollo con nodemon

### Frontend (`frontend/package.json`):
- `npm run dev`: Inicia el frontend en modo desarrollo
- `npm run build`: Construye la aplicación para producción
- `npm start`: Ejecuta la aplicación en modo producción



