# Backend de Gestión de Películas y Funciones

Este repositorio contiene el backend de la aplicación, encargado de la gestión de películas y funciones, así como la interacción con la base de datos Neo4j.

## Tecnologías Utilizadas

- **Node.js**: Entorno de ejecución para JavaScript.
- **Express.js**: Framework web para Node.js, utilizado para construir la API REST.
- **Neo4j Driver**: Conector oficial para interactuar con la base de datos Neo4j.
- **Dotenv**: Para la gestión de variables de entorno.
- **Nodemon**: Herramienta para el desarrollo que reinicia automáticamente la aplicación al detectar cambios.
- **Express-validator**: Middleware para la validación de datos en las solicitudes HTTP.

## Estructura del Proyecto

El proyecto sigue una estructura modular, con controladores y modelos separados para una mejor organización y mantenimiento.

## Configuración del Entorno

1. **Variables de Entorno**: Es necesario configurar un archivo `.env` en la raíz del proyecto con las siguientes variables para la conexión a Neo4j:

   - NEO4J_URI=URI de conexión a la base de datos Neo4j
   - NEO4J_USER=Usuario de la base de datos Neo4j
   - NEO4J_PASSWORD=Contraseña del usuario de la base de datos Neo4j

2. **Instalación de Dependencias**:
```bash
npm install
```

3. **Ejecución del servidor**:
- Modo Desarrollo
```
npm run dev
```
- Modo Producción
```
npm start
```

## Endpoints de la API

La API expone los siguientes endpoints para la gestión de funciones y películas:

### Funciones

- (POST) /api/funciones: Crea una nueva función (o múltiples funciones para diferentes horarios).
   - Body (JSON):
   ```
   {
      "peliculaId": "ID de la película (requerido)",
      "sucursalId": "ID de la sucursal (requerido)",
      "salaId": "ID de la sala (requerido)",
      "fecha": "Fecha de la función (YYYY-MM-DD, requerido)",
      "horarios": ["Array de horarios (HH:MM, requerido)"],
      "formato": "Formato (2D, 3D, IMAX, requerido)",
      "idioma": "Idioma (Español, Subtitulado, Inglés, requerido)"
   }
  ```
- (GET) /api/funciones/:id: Obtiene una función específica por su ID.

- (GET) /api/funciones/pelicula/:peliculaId: Lista las funciones disponibles para una película específica.

- (GET) /api/funciones/sucursal/:sucursalId: Lista las funciones disponibles para una sucursal específica.

- (GET) /api/funciones/salas-disponibles?sucursalId={id}&fecha={fecha}&hora={hora}: Obtiene las salas disponibles para una sucursal en una fecha y hora determinadas.

### Peliculas

- static async crear({ titulo, anio, duracion, calificacion, sinopsis, director, reparto, generos, formatos, imagen_url }): Crea una nueva película con sus géneros y formatos asociados.

- static async listar(): Lista todas las películas registradas en la base de datos, incluyendo sus géneros.

- static async buscarPorId(id): Busca una película por su ID, incluyendo sus géneros y formatos.

- static async obtenerGeneros(): Obtiene una lista de todos los géneros de películas disponibles.

- static async obtenerFormatos(): Obtiene una lista de todos los formatos de películas disponibles.

## CI/CD - Sincronización de GitHub a GitLab

Este repositorio utiliza GitHub Actions para mantener una sincronización automática con un repositorio espejo en GitLab. Esto significa que cada vez que se realiza un push a la rama main en GitHub, los cambios se reflejarán automáticamente en el repositorio de GitLab.

