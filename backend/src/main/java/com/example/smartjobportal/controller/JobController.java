package com.example.smartjobportal.controller;

import com.example.smartjobportal.dto.JobRequest;
import com.example.smartjobportal.dto.JobResponse;
import com.example.smartjobportal.service.JobService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/jobs")
@RequiredArgsConstructor
public class JobController {

    private final JobService jobService;

    @PostMapping
    public ResponseEntity<JobResponse> createJob(@RequestBody JobRequest request, Authentication authentication) {
        return ResponseEntity.ok(jobService.createJob(request, authentication.getName()));
    }

    @GetMapping
    public ResponseEntity<List<JobResponse>> getAllJobs() {
        return ResponseEntity.ok(jobService.getAllJobs());
    }

    @GetMapping("/recruiter")
    public ResponseEntity<List<JobResponse>> getJobsByRecruiter(Authentication authentication) {
        return ResponseEntity.ok(jobService.getJobsByRecruiter(authentication.getName()));
    }
}
