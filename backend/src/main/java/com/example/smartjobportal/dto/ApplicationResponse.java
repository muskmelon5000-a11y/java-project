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
public class ApplicationResponse {
    private Long id;
    private Long jobId;
    private String jobTitle;
    private String companyName;
    private Long seekerId;
    private String seekerName;
    private String status;
    private Double matchScore;
    private LocalDateTime applicationDate;
    private String seekerEmail;
    private String seekerPhone;
    private String seekerSkills;
    private String seekerEducation;
    private String seekerExperience;
    private String jobRequiredSkills;
    private String resumeUrl;
}
