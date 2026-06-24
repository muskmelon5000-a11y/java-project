package com.example.smartjobportal.service;

import com.example.smartjobportal.dto.AuthRequest;
import com.example.smartjobportal.dto.AuthResponse;
import com.example.smartjobportal.dto.RegisterRequest;
import com.example.smartjobportal.entity.JobSeeker;
import com.example.smartjobportal.entity.Recruiter;
import com.example.smartjobportal.entity.Role;
import com.example.smartjobportal.entity.User;
import com.example.smartjobportal.repository.JobSeekerRepository;
import com.example.smartjobportal.repository.RecruiterRepository;
import com.example.smartjobportal.repository.UserRepository;
import com.example.smartjobportal.security.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final JobSeekerRepository jobSeekerRepository;
    private final RecruiterRepository recruiterRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final AuthenticationManager authenticationManager;
    private final UserDetailsService userDetailsService;

    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email is already in use");
        }

        var user = User.builder()
                .name(request.getName())
                .phone(request.getPhone())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .role(request.getRole())
                .build();
        
        userRepository.save(user);

        if (request.getRole() == Role.JOB_SEEKER) {
            JobSeeker seeker = JobSeeker.builder()
                    .user(user)
                    .build();
            jobSeekerRepository.save(seeker);
        } else if (request.getRole() == Role.EMPLOYER) {
            Recruiter recruiter = Recruiter.builder()
                    .user(user)
                    .build();
            recruiterRepository.save(recruiter);
        }

        UserDetails userDetails = userDetailsService.loadUserByUsername(user.getEmail());
        var jwtToken = jwtUtil.generateToken(userDetails);
        
        return AuthResponse.builder()
                .token(jwtToken)
                .email(user.getEmail())
                .role(user.getRole().name())
                .build();
    }

    public AuthResponse authenticate(AuthRequest request) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.getEmail(),
                        request.getPassword()
                )
        );
        
        var user = userRepository.findByEmail(request.getEmail())
                .orElseThrow();
        UserDetails userDetails = userDetailsService.loadUserByUsername(user.getEmail());
        var jwtToken = jwtUtil.generateToken(userDetails);
        
        return AuthResponse.builder()
                .token(jwtToken)
                .email(user.getEmail())
                .role(user.getRole().name())
                .build();
    }
}
