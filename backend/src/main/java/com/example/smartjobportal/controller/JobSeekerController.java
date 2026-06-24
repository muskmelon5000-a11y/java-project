package com.example.smartjobportal.controller;

import com.example.smartjobportal.dto.JobSeekerProfileDto;
import com.example.smartjobportal.service.JobSeekerService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/job-seekers")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:5173")
public class JobSeekerController {

    private final JobSeekerService jobSeekerService;

    @GetMapping("/profile")
    public ResponseEntity<JobSeekerProfileDto> getProfile(@AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(jobSeekerService.getProfile(userDetails.getUsername()));
    }

    @PutMapping("/profile")
    public ResponseEntity<JobSeekerProfileDto> updateProfile(
            @RequestBody JobSeekerProfileDto request,
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(jobSeekerService.updateProfile(request, userDetails.getUsername()));
    }

    @PostMapping("/profile/resume")
    public ResponseEntity<String> uploadResume(
            @RequestParam("file") org.springframework.web.multipart.MultipartFile file,
            @AuthenticationPrincipal UserDetails userDetails) {
        try {
            jobSeekerService.uploadResume(file, userDetails.getUsername());
            return ResponseEntity.ok("Resume uploaded successfully");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/{seekerId}/resume")
    public ResponseEntity<org.springframework.core.io.Resource> getResume(@PathVariable Long seekerId) {
        try {
            org.springframework.core.io.Resource resource = jobSeekerService.getResumeFile(seekerId);
            return ResponseEntity.ok()
                    .header(org.springframework.http.HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + resource.getFilename() + "\"")
                    .body(resource);
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }
}
