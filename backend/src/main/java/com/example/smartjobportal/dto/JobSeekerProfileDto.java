package com.example.smartjobportal.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class JobSeekerProfileDto {
    private String name;
    private String email;
    private String phone;
    private String education;
    private String experience;
    private String skills;
    private String resumeUrl;
}
