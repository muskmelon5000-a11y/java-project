package com.example.smartjobportal.service;

import com.example.smartjobportal.dto.JobSeekerProfileDto;
import com.example.smartjobportal.entity.JobSeeker;
import com.example.smartjobportal.entity.User;
import com.example.smartjobportal.repository.JobSeekerRepository;
import com.example.smartjobportal.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class JobSeekerService {

    private final JobSeekerRepository jobSeekerRepository;
    private final UserRepository userRepository;

    public JobSeekerProfileDto getProfile(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        JobSeeker seeker = jobSeekerRepository.findByUser(user)
                .orElseThrow(() -> new RuntimeException("Job Seeker profile not found"));

        return JobSeekerProfileDto.builder()
                .name(user.getName())
                .email(user.getEmail())
                .phone(user.getPhone())
                .education(seeker.getEducation())
                .experience(seeker.getExperience())
                .skills(seeker.getSkills())
                .resumeUrl(seeker.getResumePath() != null ? "/api/job-seekers/" + seeker.getId() + "/resume" : null)
                .build();
    }

    public JobSeekerProfileDto updateProfile(JobSeekerProfileDto request, String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        JobSeeker seeker = jobSeekerRepository.findByUser(user)
                .orElseThrow(() -> new RuntimeException("Job Seeker profile not found"));

        // Update user fields
        if (request.getName() != null) user.setName(request.getName());
        if (request.getPhone() != null) user.setPhone(request.getPhone());
        userRepository.save(user);

        // Update seeker fields
        if (request.getEducation() != null) seeker.setEducation(request.getEducation());
        if (request.getExperience() != null) seeker.setExperience(request.getExperience());
        if (request.getSkills() != null) seeker.setSkills(request.getSkills());
        JobSeeker savedSeeker = jobSeekerRepository.save(seeker);

        return JobSeekerProfileDto.builder()
                .name(user.getName())
                .email(user.getEmail())
                .phone(user.getPhone())
                .education(savedSeeker.getEducation())
                .experience(savedSeeker.getExperience())
                .skills(savedSeeker.getSkills())
                .resumeUrl(savedSeeker.getResumePath() != null ? "/api/job-seekers/" + savedSeeker.getId() + "/resume" : null)
                .build();
    }

    public void uploadResume(org.springframework.web.multipart.MultipartFile file, String email) throws java.io.IOException {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        JobSeeker seeker = jobSeekerRepository.findByUser(user)
                .orElseThrow(() -> new RuntimeException("Job Seeker profile not found"));

        if (!file.getContentType().equals("application/pdf")) {
            throw new RuntimeException("Only PDF files are allowed");
        }

        String uploadDir = "uploads/resumes/";
        java.io.File directory = new java.io.File(uploadDir);
        if (!directory.exists()) {
            directory.mkdirs();
        }

        String fileName = java.util.UUID.randomUUID().toString() + ".pdf";
        java.nio.file.Path filePath = java.nio.file.Paths.get(uploadDir, fileName);
        java.nio.file.Files.copy(file.getInputStream(), filePath, java.nio.file.StandardCopyOption.REPLACE_EXISTING);

        seeker.setResumePath(filePath.toString());
        jobSeekerRepository.save(seeker);
    }

    public org.springframework.core.io.Resource getResumeFile(Long seekerId) throws java.net.MalformedURLException {
        JobSeeker seeker = jobSeekerRepository.findById(seekerId)
                .orElseThrow(() -> new RuntimeException("Job Seeker not found"));

        if (seeker.getResumePath() == null) {
            throw new RuntimeException("Resume not found");
        }

        java.nio.file.Path filePath = java.nio.file.Paths.get(seeker.getResumePath());
        org.springframework.core.io.Resource resource = new org.springframework.core.io.UrlResource(filePath.toUri());

        if (resource.exists() || resource.isReadable()) {
            return resource;
        } else {
            throw new RuntimeException("Could not read resume file");
        }
    }
}
