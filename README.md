# Auth Service (Java + Spring Boot) — Registro, Login, Roles y Seguridad con OAuth2

Microservicio de autenticación y autorización desarrollado con **Spring Boot**, **Spring Security**, **JPA/Hibernate** y **PostgreSQL**.  
Incluye **registro y login**, **hash de contraseñas con BCrypt**, **roles (ROLE_USER / ROLE_ADMIN)**, protección de endpoints con **OAuth2 JWT Bearer Tokens**, y un **frontend de prueba en React + TypeScript + Bootstrap** para validar el flujo end-to-end.

---

## 📋 Tabla de Contenidos

- [Stack / Tecnologías](#stack--tecnologías)
- [Arquitectura / Capas](#arquitectura--capas)
- [Sistema de Autenticación OAuth2](#sistema-de-autenticación-oauth2)
- [Funcionalidades Implementadas](#funcionalidades-implementadas)
- [Endpoints de la API](#endpoints-de-la-api)
- [Flujo de Autenticación](#flujo-de-autenticación)
- [Requisitos](#requisitos)
- [Configuración](#configuración)
- [Ejecución](#ejecución)
- [Estructura del Proyecto](#estructura-del-proyecto)

---

## 🛠 Stack / Tecnologías

### Backend
- **Java 21** + **Spring Boot 4.0.0**
- **Spring Web MVC** (API REST)
- **Spring Security** (autenticación/autorización)
- **Spring Data JPA** + **Hibernate** (persistencia ORM)
- **PostgreSQL** (base de datos relacional)
- **Spring Security OAuth2 Authorization Server** (servidor de autorización OAuth2)
- **Spring Security OAuth2 Resource Server** (validación de tokens JWT)
- **Lombok** (reducción de boilerplate)
- **Bean Validation** (validación de DTOs)
- **Spring Boot Actuator** (health checks y métricas)
- **Nimbus JOSE + JWT** (generación y validación de tokens JWT con RSA)

### Frontend (tester UI)
- **React 18** + **TypeScript**
- **Vite** (build tool y dev server)
- **React Router** (navegación entre pantallas)
- **Bootstrap 5** + CSS propio
- **Fetch API** (comunicación con backend)

---

## 🏗 Arquitectura / Capas

Estructura del proyecto siguiendo el patrón de capas de Spring Boot:

```
auth-service/
├── controller/          # Endpoints REST
│   ├── AuthController      # /auth/register, /auth/login
│   ├── UserController      # /users/me
│   ├── AdminController     # /admin/**
│   └── TestController      # /test/** (endpoints de prueba)
│
├── service/            # Lógica de negocio
│   ├── AuthService         # Lógica de registro y login
│   ├── OAuth2TokenService  # Generación de tokens OAuth2 JWT
│   ├── CustomUserDetailsService  # Carga de usuarios para Spring Security
│   ├── JwtService          # (Legacy - comentado, reemplazado por OAuth2TokenService)
│   └── IAuthService        # Interfaz del servicio de autenticación
│
├── repository/         # Acceso a datos (Spring Data JPA)
│   ├── UserRepository      # Operaciones CRUD de usuarios
│   └── RoleRepository      # Operaciones CRUD de roles
│
├── entity/            # Entidades JPA (modelo de dominio)
│   ├── User              # Usuario con username, email, password, roles
│   ├── Role              # Rol del sistema
│   └── RoleName          # Enum: ROLE_USER, ROLE_ADMIN
│
├── dto/               # Data Transfer Objects
│   ├── RegisterRequest    # DTO para registro
│   ├── LoginRequest       # DTO para login
│   ├── AuthResponse       # Respuesta de autenticación (token + mensaje)
│   └── UserResponse       # Información del usuario
│
├── config/            # Configuración de Spring
│   ├── OAuth2AuthorizationServerConfig  # Configuración del servidor OAuth2
│   ├── OAuth2ResourceServerConfig      # Configuración del resource server
│   └── SecurityConfig                  # (Legacy - comentado)
│
├── exception/         # Manejo de excepciones
│   ├── GlobalExceptionHandler  # Handler global de excepciones
│   ├── InvalidCredentialsException
│   └── UserAlreadyExistsException
│
└── security/          # Componentes de seguridad
    └── JwtAuthenticationFilter  # (Legacy - comentado, reemplazado por OAuth2 Resource Server)
```

---

## 🔐 Sistema de Autenticación OAuth2

Este proyecto implementa **OAuth2** utilizando **Spring Security OAuth2 Authorization Server** y **Resource Server**. A diferencia de una implementación JWT simple, OAuth2 proporciona un estándar más robusto y escalable.

### Características de OAuth2 Implementadas

#### 1. **OAuth2 Authorization Server**
- **Configuración**: `OAuth2AuthorizationServerConfig`
- **Funcionalidad**: 
  - Genera tokens JWT OAuth2 usando **RSA keys** (más seguro que HMAC)
  - Registra clientes OAuth2 (actualmente: `react-client`)
  - Configura scopes: `openid`, `profile`, `read`, `write`
  - Define tiempos de expiración: Access Token (1 hora), Refresh Token (7 días)
- **Endpoints expuestos**:
  - `/.well-known/**` - Metadata del servidor OAuth2
  - `/oauth2/**` - Endpoints del servidor de autorización

#### 2. **OAuth2 Resource Server**
- **Configuración**: `OAuth2ResourceServerConfig`
- **Funcionalidad**:
  - Valida tokens JWT OAuth2 recibidos en el header `Authorization: Bearer <token>`
  - Extrae roles del usuario del claim `authorities` del token
  - Protege endpoints según roles y autenticación
- **Converter personalizado**: `JwtAuthenticationConverter` que extrae roles del token en lugar de scopes

#### 3. **Generación de Tokens**
- **Servicio**: `OAuth2TokenService`
- **Proceso**:
  1. Recibe un `User` autenticado
  2. Extrae los roles del usuario
  3. Crea un `JwtClaimsSet` con:
     - `issuer`: "http://localhost:8080"
     - `subject`: username del usuario
     - `authorities`: roles del usuario (ej: "ROLE_USER")
     - `roles`: roles del usuario (duplicado para compatibilidad)
     - `scope`: "read write openid profile"
  4. Firma el token con RSA private key
  5. Retorna el token JWT como string

#### 4. **Validación de Tokens**
- El Resource Server valida automáticamente:
  - Firma del token (usando RSA public key)
  - Expiración del token
  - Formato JWT válido
- El `JwtAuthenticationConverter` personalizado:
  - Lee el claim `authorities` del token
  - Convierte los roles en `GrantedAuthority` de Spring Security
  - Permite que Spring Security use los roles para autorización

### Ventajas de OAuth2 sobre JWT Simple

1. **Seguridad mejorada**: Uso de RSA keys en lugar de HMAC (secret compartido)
2. **Estándar**: Implementa el estándar OAuth2, facilitando integración con otros sistemas
3. **Escalabilidad**: Preparado para múltiples clientes y flujos de autorización
4. **Refresh Tokens**: Soporte para renovación de tokens sin re-autenticación
5. **Scopes**: Sistema de permisos granular mediante scopes

---

## ✅ Funcionalidades Implementadas

### 🔹 Registro de Usuario
- **Endpoint**: `POST /auth/register`
- **Request Body**:
  ```json
  {
    "username": "usuario123",
    "email": "usuario@example.com",
    "password": "password123"
  }
  ```
- **Validaciones**:
  - Username único (no duplicados)
  - Email único (no duplicados)
  - Campos requeridos validados con Bean Validation
- **Proceso**:
  1. Valida que username y email no existan
  2. Encripta la contraseña con **BCrypt**
  3. Asigna rol por defecto **ROLE_USER**
  4. Guarda el usuario en la base de datos
  5. Retorna mensaje de éxito (sin token, el usuario debe hacer login)
- **Respuesta**:
  ```json
  {
    "message": "Usuario registrado exitosamente.",
    "token": null
  }
  ```

### 🔹 Login
- **Endpoint**: `POST /auth/login`
- **Request Body**:
  ```json
  {
    "username": "usuario123",
    "password": "password123"
  }
  ```
- **Proceso**:
  1. Busca el usuario por username
  2. Valida la contraseña con BCrypt (`matches`)
  3. Genera un **token OAuth2 JWT** usando `OAuth2TokenService`
  4. Retorna el token en la respuesta
- **Respuesta**:
  ```json
  {
    "message": "Login exitoso.",
    "token": "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
  ```
- **Errores**:
  - `401 Unauthorized`: Credenciales inválidas
  - `400 Bad Request`: Validación fallida

### 🔹 Roles y Autorización
- **Sistema de Roles**:
  - `ROLE_USER`: Rol por defecto para usuarios registrados
  - `ROLE_ADMIN`: Rol administrativo con acceso a endpoints protegidos
- **Relación**: `User` ↔ `Role` (Many-to-Many)
- **Endpoints protegidos**:
  - `/admin/**` → Requiere `ROLE_ADMIN`
  - `/users/me` → Requiere estar autenticado (cualquier rol)
  - `/test/**` → Requiere estar autenticado
  - `/auth/**` → Público (permitido sin autenticación)

### 🔹 Seguridad Stateless con OAuth2 JWT
- **Autenticación**: 
  - El cliente envía el token en el header: `Authorization: Bearer <token>`
  - El Resource Server valida el token automáticamente
  - Spring Security extrae los roles del token y los usa para autorización
- **Ventajas**:
  - No requiere sesiones en el servidor (stateless)
  - Tokens firmados con RSA (más seguro)
  - Información de roles incluida en el token
  - Expiración automática (1 hora)

### 🔹 Frontend de Prueba (React)
- **Pantallas implementadas**:
  - **Register** (`/register`): Formulario de registro
  - **Login** (`/login`): Formulario de login, guarda token en `localStorage`
  - **Me** (`/me`): Muestra información del usuario autenticado
  - **Admin** (`/admin`): Endpoint protegido que requiere `ROLE_ADMIN`
- **Manejo de tokens**:
  - Almacenamiento en `localStorage`
  - Inclusión automática en headers de peticiones autenticadas
  - Limpieza al cerrar sesión
- **UI**: Bootstrap 5 + CSS personalizado

---

## 📡 Endpoints de la API

### Autenticación (Públicos)

#### `POST /auth/register`
Registra un nuevo usuario en el sistema.

**Request**:
```json
{
  "username": "string (requerido, único, max 50 caracteres)",
  "email": "string (requerido, único, formato email válido)",
  "password": "string (requerido)"
}
```

**Response** (201 Created):
```json
{
  "message": "Usuario registrado exitosamente.",
  "token": null
}
```

**Errores**:
- `400 Bad Request`: Username o email ya existe, o validación fallida
- `500 Internal Server Error`: Error del servidor

#### `POST /auth/login`
Autentica un usuario y genera un token OAuth2 JWT.

**Request**:
```json
{
  "username": "string (requerido)",
  "password": "string (requerido)"
}
```

**Response** (200 OK):
```json
{
  "message": "Login exitoso.",
  "token": "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Errores**:
- `401 Unauthorized`: Credenciales incorrectas
- `400 Bad Request`: Validación fallida

### Usuario (Requiere Autenticación)

#### `GET /users/me`
Obtiene la información del usuario autenticado.

**Headers**:
```
Authorization: Bearer <token>
```

**Response** (200 OK):
```json
{
  "id": 1,
  "username": "usuario123",
  "email": "usuario@example.com",
  "roles": ["ROLE_USER"]
}
```

**Errores**:
- `401 Unauthorized`: Token inválido o expirado
- `403 Forbidden`: Token válido pero sin permisos

### Administración (Requiere ROLE_ADMIN)

#### `GET /admin/ping`
Endpoint de prueba para verificar acceso administrativo.

**Headers**:
```
Authorization: Bearer <token>
```

**Response** (200 OK):
```json
{
  "message": "Admin access granted"
}
```

**Errores**:
- `401 Unauthorized`: No autenticado
- `403 Forbidden`: Autenticado pero sin rol ADMIN

### Prueba (Requiere Autenticación)

#### `GET /test/ping`
Endpoint de prueba para verificar autenticación básica.

**Headers**:
```
Authorization: Bearer <token>
```

**Response** (200 OK):
```json
{
  "message": "Authenticated"
}
```

---

## 🔄 Flujo de Autenticación

### Flujo de Registro

```
1. Cliente → POST /auth/register
   {
     "username": "usuario",
     "email": "usuario@email.com",
     "password": "password123"
   }

2. Backend:
   - Valida username/email únicos
   - Encripta password con BCrypt
   - Asigna ROLE_USER
   - Guarda en PostgreSQL
   - Retorna mensaje de éxito

3. Cliente → Usuario debe hacer login para obtener token
```

### Flujo de Login

```
1. Cliente → POST /auth/login
   {
     "username": "usuario",
     "password": "password123"
   }

2. Backend:
   - Busca usuario por username
   - Valida password con BCrypt.matches()
   - OAuth2TokenService genera token JWT:
     * Crea JwtClaimsSet con roles del usuario
     * Firma con RSA private key
     * Retorna token JWT

3. Cliente:
   - Recibe token en response
   - Guarda token en localStorage
   - Usa token en headers: Authorization: Bearer <token>
```

### Flujo de Acceso a Endpoints Protegidos

```
1. Cliente → GET /users/me
   Headers: Authorization: Bearer <token>

2. OAuth2 Resource Server:
   - Extrae token del header
   - Valida firma con RSA public key
   - Verifica expiración
   - JwtAuthenticationConverter extrae roles del claim "authorities"
   - Crea Authentication con roles

3. Spring Security:
   - Verifica que el usuario esté autenticado
   - Autoriza según roles si es necesario
   - Permite acceso al endpoint

4. Controller:
   - Recibe Authentication con username y roles
   - Busca usuario en BD
   - Retorna información del usuario
```

---

## 📦 Requisitos

### Backend
- **Java 21** (o superior)
- **Maven 3.6+**
- **PostgreSQL 12+** (instalado y corriendo en puerto 5432)

### Frontend
- **Node.js 18+**
- **npm** o **yarn**

---

## ⚙️ Configuración

### 1. Base de Datos PostgreSQL

#### Crear Base de Datos
```sql
CREATE DATABASE auth_db;
```

#### Crear Usuario (Opcional)
```sql
CREATE USER auth_user WITH PASSWORD 'tu_password';
GRANT ALL PRIVILEGES ON DATABASE auth_db TO auth_user;
```

#### Verificación
En pgAdmin o psql, verificar que existan las tablas:
- `users` - Usuarios del sistema
- `roles` - Roles disponibles (ROLE_USER, ROLE_ADMIN)
- `user_roles` - Tabla de relación Many-to-Many

### 2. Backend (`application.properties`)

```properties
# Aplicación
spring.application.name=auth-service
server.port=8080

# Base de Datos PostgreSQL
spring.datasource.url=jdbc:postgresql://localhost:5432/auth_db
spring.datasource.username=postgres
spring.datasource.password=postgres
spring.datasource.driver-class-name=org.postgresql.Driver

# JPA / Hibernate
spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=true
spring.jpa.properties.hibernate.format_sql=true
spring.jpa.properties.hibernate.jdbc.lob.non_contextual_creation=true

# Logs SQL (opcional, para debugging)
logging.level.org.hibernate.SQL=DEBUG
logging.level.org.hibernate.type.descriptor.sql.BasicBinder=TRACE

# OAuth2 Configuration
# Los tokens OAuth2 se generan usando RSA keys (configuradas en código)
# El issuer del servidor de autorización
spring.security.oauth2.authorizationserver.issuer=http://localhost:8080

# Configuración de tokens (valores por defecto en código)
# Access token expiration: 1 hora (3600 segundos)
# Refresh token expiration: 7 días
```

**Nota**: Ya no se requiere `jwt.secret` ni `jwt.expiration-ms` porque OAuth2 usa RSA keys generadas automáticamente.

### 3. Frontend (`.env` o `vite.config.ts`)

Crear archivo `.env` en `login-app/`:
```env
VITE_API_BASE_URL=http://localhost:8080
```

---

## 🚀 Ejecución

### Backend

1. **Compilar y ejecutar**:
   ```bash
   cd auth-service
   ./mvnw spring-boot:run
   # O en Windows:
   mvnw.cmd spring-boot:run
   ```

2. **Verificar que esté corriendo**:
   - Abrir: http://localhost:8080
   - Debería mostrar una página de error 404 (normal, no hay endpoint raíz)
   - O verificar: http://localhost:8080/actuator/health

### Frontend

1. **Instalar dependencias**:
   ```bash
   cd login-app
   npm install
   ```

2. **Ejecutar servidor de desarrollo**:
   ```bash
   npm run dev
   ```

3. **Abrir en navegador**:
   - http://localhost:5173

---

## 📁 Estructura del Proyecto

```
Registro-login/
├── auth-service/              # Backend Spring Boot
│   ├── src/
│   │   ├── main/
│   │   │   ├── java/
│   │   │   │   └── com/gianniniseba/authservice/
│   │   │   │       ├── AuthServiceApplication.java
│   │   │   │       ├── config/          # Configuraciones Spring
│   │   │   │       ├── controller/      # REST Controllers
│   │   │   │       ├── dto/            # Data Transfer Objects
│   │   │   │       ├── entity/         # Entidades JPA
│   │   │   │       ├── exception/      # Excepciones personalizadas
│   │   │   │       ├── repository/     # Repositorios JPA
│   │   │   │       ├── security/       # Filtros de seguridad (legacy)
│   │   │   │       └── service/        # Servicios de negocio
│   │   │   └── resources/
│   │   │       └── application.properties
│   │   └── test/                       # Tests
│   ├── pom.xml                         # Dependencias Maven
│   └── mvnw, mvnw.cmd                  # Maven Wrapper
│
├── login-app/                 # Frontend React
│   ├── src/
│   │   ├── api/               # Cliente HTTP
│   │   ├── components/       # Componentes React
│   │   ├── pages/            # Páginas/Vistas
│   │   ├── styles/           # Estilos CSS
│   │   ├── App.tsx           # Componente principal
│   │   └── main.tsx          # Punto de entrada
│   ├── package.json          # Dependencias npm
│   └── vite.config.ts        # Configuración Vite
│
└── README.md                  # Este archivo
```

---

## 🔧 Configuración de Seguridad

### Cadenas de Filtros de Spring Security

El proyecto utiliza múltiples `SecurityFilterChain` con diferentes `@Order`:

1. **Order 1**: `OAuth2AuthorizationServerConfig`
   - Maneja: `/oauth2/**`, `/.well-known/**`
   - Propósito: Endpoints del servidor de autorización OAuth2

2. **Order 2**: `OAuth2ResourceServerConfig`
   - Maneja: Todas las demás rutas
   - Propósito: Validación de tokens y protección de endpoints

### CORS (Cross-Origin Resource Sharing)

Configurado para permitir peticiones desde el frontend:
- **Origen permitido**: `http://localhost:5173` (Vite dev server)
- **Métodos**: GET, POST, PUT, DELETE, OPTIONS
- **Headers**: Authorization, Content-Type
- **Credentials**: Habilitado

---

## 🧪 Pruebas

### Probar Registro
```bash
curl -X POST http://localhost:8080/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "email": "test@example.com",
    "password": "password123"
  }'
```

### Probar Login
```bash
curl -X POST http://localhost:8080/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "password": "password123"
  }'
```

### Probar Endpoint Protegido
```bash
# Reemplazar <token> con el token recibido en login
curl -X GET http://localhost:8080/users/me \
  -H "Authorization: Bearer <token>"
```

---

## 📝 Notas Importantes

### Tokens OAuth2 JWT

- **Formato**: Tokens JWT firmados con algoritmo **RS256** (RSA)
- **Contenido del token**:
  - `sub`: Username del usuario
  - `authorities`: Roles del usuario (ej: "ROLE_USER")
  - `roles`: Roles del usuario (duplicado)
  - `scope`: Scopes OAuth2 ("read write openid profile")
  - `iss`: Issuer ("http://localhost:8080")
  - `exp`: Fecha de expiración (1 hora desde emisión)
- **Validación**: El Resource Server valida automáticamente la firma y expiración

### Roles en el Token

Los roles se extraen del claim `authorities` del token JWT. El `JwtAuthenticationConverter` personalizado convierte estos roles en `GrantedAuthority` de Spring Security, permitiendo que la autorización funcione correctamente.

### Archivos Legacy

Los siguientes archivos están comentados pero se mantienen como referencia:
- `JwtService.java` - Reemplazado por `OAuth2TokenService`
- `JwtAuthenticationFilter.java` - Reemplazado por OAuth2 Resource Server
- `SecurityConfig.java` - Reemplazado por `OAuth2ResourceServerConfig`

---

## 🔐 Seguridad

### Mejores Prácticas Implementadas

1. **Contraseñas**: Encriptadas con BCrypt (algoritmo de hashing seguro)
2. **Tokens**: Firmados con RSA (más seguro que HMAC)
3. **Validación**: Tokens validados automáticamente por Spring Security
4. **Roles**: Incluidos en el token para autorización stateless
5. **CORS**: Configurado para permitir solo el origen del frontend
6. **Stateless**: No se almacenan sesiones en el servidor

### Consideraciones de Producción

Para un entorno de producción, considera:
- Cambiar las RSA keys por keys persistentes (no generadas en cada inicio)
- Configurar HTTPS
- Implementar rate limiting
- Agregar logging de seguridad
- Configurar refresh tokens para renovación automática
- Implementar revocación de tokens

---

## 📚 Referencias

- [Spring Security OAuth2 Authorization Server](https://docs.spring.io/spring-authorization-server/reference/)
- [Spring Security OAuth2 Resource Server](https://docs.spring.io/spring-security/reference/servlet/oauth2/resource-server/index.html)
- [JWT.io](https://jwt.io/) - Para decodificar y verificar tokens JWT
- [Spring Boot Documentation](https://spring.io/projects/spring-boot)

---

## 👤 Autor

Desarrollado como proyecto académico para implementar autenticación y autorización con Spring Boot y OAuth2.

---

## 📄 Licencia

Este proyecto es de uso educativo/académico.
