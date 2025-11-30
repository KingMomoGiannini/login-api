# login-api

#Estructura de capas de la api:

com.seba.authservice
 ├─ config        // Configuración general (CORS, seguridad, etc.)
 ├─ controller    // Controladores REST (LoginController, AuthController...)
 ├─ dto           // Clases para requests/responses (RegisterRequest, LoginRequest...)
 ├─ entity        // Entidades JPA (User, Role...)
 ├─ repository    // Interfaces de repositorio (UserRepository, RoleRepository...)
 ├─ service       // Lógica de negocio (AuthService, UserService...)
 └─ exception     // Manejo de errores personalizados
