package com.example.smartjobportal.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class JobRequest {
    private String title;
    private String description;
    private String requiredSkills;
    private String salary;
    private String location;
    private String experienceRequired;
    private LocalDateTime deadline;
}
