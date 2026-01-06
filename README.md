# Auth Service (Java + Spring Boot) — Registro, Login, Roles y Seguridad

Microservicio de autenticación y autorización desarrollado con **Spring Boot**, **Spring Security**, **JPA/Hibernate** y **PostgreSQL**.  
Incluye **registro y login**, **hash de contraseñas con BCrypt**, **roles (ROLE_USER / ROLE_ADMIN)**, protección de endpoints con **JWT Bearer**, y un **frontend de prueba en React + TypeScript + Bootstrap** para validar el flujo end-to-end.

---

## Stack / Tecnologías

### Backend
- Java + Spring Boot
- Spring Web (API REST)
- Spring Security (autenticación/autorización)
- Spring Data JPA + Hibernate (persistencia)
- PostgreSQL (base de datos)
- Lombok
- Bean Validation (DTOs con validaciones)
- (Opcional) Spring Boot Actuator (health checks)
- JWT (Bearer Token) para seguridad stateless

### Frontend (tester UI)
- React + TypeScript (Vite template `react-ts`)
- Bootstrap + CSS propio
- React Router (pantallas: Register / Login / Me / Admin)

---

## Arquitectura / Capas

Estructura típica por capas:

- **controller/**: endpoints REST (`AuthController`, `UserController`, `AdminController`, etc.)
- **service/**: lógica de negocio (`AuthService`, `AuthServiceImpl`)
- **repository/**: acceso a datos (`UserRepository`, `RoleRepository`)
- **entity/**: entidades JPA (`User`, `Role`, `RoleName`)
- **config/**: seguridad y cross-cutting (`SecurityConfig`, CORS, filtros, etc.)
- **exception/**: excepciones y handler global (`GlobalExceptionHandler`)

---

## Funcionalidades implementadas

### ✅ Registro de usuario
- Endpoint `/auth/register`
- Validación de duplicados (username/email)
- Password almacenada **encriptada con BCrypt**
- Asignación automática de rol por defecto **ROLE_USER**
- Respuesta consistente en JSON

### ✅ Login
- Endpoint `/auth/login`
- Validación de credenciales con BCrypt (`matches`)
- Generación de **JWT** y retorno en el `AuthResponse.token`
- Errores normalizados:
  - 401 cuando credenciales inválidas
  - 400 cuando usuario ya existe

### ✅ Roles y autorización
- Entidad `Role` + enum `RoleName`
- Relación `User` ↔ `Role` (Many-to-Many)
- Roles inicializados en startup (CommandLineRunner)
- Endpoints protegidos por rol:
  - `/admin/**` requiere `ROLE_ADMIN`
  - `/users/me` requiere estar autenticado

### ✅ Seguridad stateless con JWT
- `Authorization: Bearer <token>`
- Filtro JWT que:
  - extrae token,
  - lo valida,
  - carga el usuario,
  - setea el `Authentication` en el `SecurityContext`

### ✅ Frontend de prueba (React)
- Pantallas:
  - Register
  - Login (guarda token)
  - Me (`/users/me`)
  - Admin (`/admin/ping`)
- Manejo de token vía `localStorage`
- Bootstrap base + CSS propio
- Ajuste backend para retornar **JSON** en `/admin/ping` (evita parse errors en frontend)

---

## Requisitos

- Java 17+ (o 21)
- Maven
- PostgreSQL instalado y corriendo (puerto por defecto 5432)
- Node.js + npm (para el frontend)

---

## Configuración de PostgreSQL

1. Crear base de datos:
   - `auth_db`
2. Crear usuario (opcional, recomendado):
   - `auth_user` con permisos sobre `auth_db`

### Verificación rápida en pgAdmin
- Navegar: `Databases > auth_db > Schemas > public > Tables`
- Tabla esperada: `users`, `roles`, `user_roles`

---

## Configuración Backend (`application.properties`)

Ejemplo mínimo (ajustar credenciales):

```properties
server.port=8080

spring.datasource.url=jdbc:postgresql://localhost:5432/auth_db
spring.datasource.username=auth_user
spring.datasource.password=auth_password
spring.datasource.driver-class-name=org.postgresql.Driver

spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=true
spring.jpa.properties.hibernate.format_sql=true

# JWT (HMAC) - si aplica
jwt.secret=unaClaveLoSuficientementeLargaYSecreta123456
jwt.expiration-ms=3600000

