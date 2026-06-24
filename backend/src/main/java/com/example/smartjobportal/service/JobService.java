package com.example.smartjobportal.service;

import com.example.smartjobportal.dto.JobRequest;
import com.example.smartjobportal.dto.JobResponse;
import com.example.smartjobportal.entity.Job;
import com.example.smartjobportal.entity.Recruiter;
import com.example.smartjobportal.entity.User;
import com.example.smartjobportal.repository.JobRepository;
import com.example.smartjobportal.repository.RecruiterRepository;
import com.example.smartjobportal.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class JobService {

    private final JobRepository jobRepository;
    private final RecruiterRepository recruiterRepository;
    private final UserRepository userRepository;

    public JobResponse createJob(JobRequest request, String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        Recruiter recruiter = recruiterRepository.findByUser(user)
                .orElseThrow(() -> new RuntimeException("Recruiter profile not found"));

        Job job = Job.builder()
                .title(request.getTitle())
                .description(request.getDescription())
                .requiredSkills(request.getRequiredSkills())
                .salary(request.getSalary())
                .location(request.getLocation())
                .experienceRequired(request.getExperienceRequired())
                .deadline(request.getDeadline())
                .status("OPEN")
                .recruiter(recruiter)
                .build();

        Job savedJob = jobRepository.save(job);
        return mapToResponse(savedJob);
    }

    public List<JobResponse> getAllJobs() {
        return jobRepository.findAll().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public List<JobResponse> getJobsByRecruiter(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        Recruiter recruiter = recruiterRepository.findByUser(user)
                .orElseThrow(() -> new RuntimeException("Recruiter profile not found"));

        return jobRepository.findByRecruiter(recruiter).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    private JobResponse mapToResponse(Job job) {
        return JobResponse.builder()
                .id(job.getId())
                .title(job.getTitle())
                .description(job.getDescription())
                .requiredSkills(job.getRequiredSkills())
                .salary(job.getSalary())
                .location(job.getLocation())
                .experienceRequired(job.getExperienceRequired())
                .deadline(job.getDeadline())
                .status(job.getStatus())
                .companyName(job.getRecruiter().getCompanyName())
                .recruiterId(job.getRecruiter().getId())
                .build();
    }
}
