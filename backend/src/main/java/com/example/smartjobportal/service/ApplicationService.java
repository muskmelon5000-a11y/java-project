package com.example.smartjobportal.service;

import com.example.smartjobportal.dto.ApplicationRequest;
import com.example.smartjobportal.dto.ApplicationResponse;
import com.example.smartjobportal.entity.Application;
import com.example.smartjobportal.entity.Job;
import com.example.smartjobportal.entity.JobSeeker;
import com.example.smartjobportal.entity.User;
import com.example.smartjobportal.repository.ApplicationRepository;
import com.example.smartjobportal.repository.JobRepository;
import com.example.smartjobportal.repository.JobSeekerRepository;
import com.example.smartjobportal.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ApplicationService {

    private final ApplicationRepository applicationRepository;
    private final JobRepository jobRepository;
    private final JobSeekerRepository jobSeekerRepository;
    private final UserRepository userRepository;

    public ApplicationResponse applyForJob(ApplicationRequest request, String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        JobSeeker seeker = jobSeekerRepository.findByUser(user)
                .orElseThrow(() -> new RuntimeException("Job Seeker profile not found"));

        Job job = jobRepository.findById(request.getJobId())
                .orElseThrow(() -> new RuntimeException("Job not found"));

        // Basic match score logic based on skills
        double matchScore = calculateMatchScore(job.getRequiredSkills(), request.getApplicantSkills());

        Application application = Application.builder()
                .job(job)
                .seeker(seeker)
                .matchPercentage(matchScore)
                .status("PENDING")
                .build();

        Application savedApp = applicationRepository.save(application);
        return mapToResponse(savedApp);
    }

    public List<ApplicationResponse> getMyApplications(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        JobSeeker seeker = jobSeekerRepository.findByUser(user)
                .orElseThrow(() -> new RuntimeException("Job Seeker profile not found"));

        return applicationRepository.findBySeeker(seeker).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public List<ApplicationResponse> getApplicationsByJob(Long jobId, String email) {
        // Validate that the job belongs to the recruiter
        Job job = jobRepository.findById(jobId)
                .orElseThrow(() -> new RuntimeException("Job not found"));

        if (!job.getRecruiter().getUser().getEmail().equals(email)) {
            throw new RuntimeException("Unauthorized to view these applications");
        }

        return applicationRepository.findByJob(job).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public ApplicationResponse updateApplicationStatus(Long applicationId, String status, String email) {
        Application application = applicationRepository.findById(applicationId)
                .orElseThrow(() -> new RuntimeException("Application not found"));

        if (!application.getJob().getRecruiter().getUser().getEmail().equals(email)) {
            throw new RuntimeException("Unauthorized to update this application");
        }

        application.setStatus(status);
        Application savedApp = applicationRepository.save(application);
        return mapToResponse(savedApp);
    }

    private double calculateMatchScore(String requiredSkills, String applicantSkills) {
        if (requiredSkills == null || requiredSkills.isEmpty() || applicantSkills == null || applicantSkills.isEmpty()) {
            return 0.0;
        }

        String[] reqSkills = requiredSkills.toLowerCase().split(",");
        String[] appSkills = applicantSkills.toLowerCase().split(",");
        
        int matchCount = 0;
        for (String req : reqSkills) {
            String cleanReq = req.trim();
            for (String app : appSkills) {
                if (cleanReq.equals(app.trim())) {
                    matchCount++;
                    break;
                }
            }
        }
        
        return ((double) matchCount / reqSkills.length) * 100.0;
    }

    private ApplicationResponse mapToResponse(Application app) {
        return ApplicationResponse.builder()
                .id(app.getId())
                .jobId(app.getJob().getId())
                .jobTitle(app.getJob().getTitle())
                .companyName(app.getJob().getRecruiter().getCompanyName())
                .seekerId(app.getSeeker().getId())
                .seekerName(app.getSeeker().getUser().getName())
                .seekerEmail(app.getSeeker().getUser().getEmail())
                .seekerPhone(app.getSeeker().getUser().getPhone())
                .seekerSkills(app.getSeeker().getSkills())
                .seekerEducation(app.getSeeker().getEducation())
                .seekerExperience(app.getSeeker().getExperience())
                .jobRequiredSkills(app.getJob().getRequiredSkills())
                .resumeUrl(app.getSeeker().getResumePath() != null ? "/api/job-seekers/" + app.getSeeker().getId() + "/resume" : null)
                .status(app.getStatus())
                .matchScore(app.getMatchPercentage())
                .applicationDate(app.getApplicationDate())
                .build();
    }
}
