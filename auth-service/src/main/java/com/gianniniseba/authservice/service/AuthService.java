package com.gianniniseba.authservice.service;

import com.gianniniseba.authservice.dto.AuthResponse;
import com.gianniniseba.authservice.dto.LoginRequest;
import com.gianniniseba.authservice.dto.RegisterRequest;
import com.gianniniseba.authservice.entity.User;
import com.gianniniseba.authservice.exception.InvalidCredentialsException;
import com.gianniniseba.authservice.exception.UserAlreadyExistsException;
import com.gianniniseba.authservice.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthService implements IAuthService {

    private final UserRepository userRepository;

    @Override
    public AuthResponse register(RegisterRequest request) {

        if(userRepository.existsByUsername(request.getUsername())){
            throw new UserAlreadyExistsException("El nombre de usuario ingresado ya se encuentra en uso.");
        }

        if(userRepository.existsByEmail(request.getEmail())){
            throw new UserAlreadyExistsException("El email ingresado ya se encuentra en uso.");
        }

        User user = User.builder()
                .username(request.getUsername())
                .email(request.getEmail())
                .password(request.getPassword())
                .enabled(true)
                .build();

        userRepository.save(user);

        return AuthResponse.builder()
                .message("Usuario registrado exitosamente.")
                .token(null)
                .build();

    }

    @Override
    public AuthResponse login(LoginRequest request) {
        User user = userRepository.findByUsername(request.getUsername())
                .orElseThrow(
                        () -> new InvalidCredentialsException("Usuario o contraseña incorrectos.")
                );

        if(!user.getPassword().equals(request.getPassword())){
            throw new InvalidCredentialsException("Usuario o contraseña incorrectos.");

        }

        return AuthResponse.builder()
                .message("Inicio de sesión exitoso.")
                .token(null)
                .build();
    }
}
