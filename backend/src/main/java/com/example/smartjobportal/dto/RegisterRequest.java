package com.example.smartjobportal.dto;

import com.example.smartjobportal.entity.Role;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class RegisterRequest {
    private String name;
    private String phone;
    private String email;
    private String password;
    private Role role;
}
