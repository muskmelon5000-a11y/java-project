package com.example.smartjobportal.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "jobs")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Job {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "job_id")
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "recruiter_id", nullable = false)
    private Recruiter recruiter;

    @Column(name = "job_title", nullable = false)
    private String title;

    @Column(name = "job_description", nullable = false, columnDefinition = "TEXT")
    private String description;

    @Column(name = "required_skills", nullable = false)
    private String requiredSkills; // comma separated skills

    private String salary;

    private String location;

    @Column(name = "experience_required")
    private String experienceRequired;

    private LocalDateTime deadline;

    @Column(nullable = false)
    private String status;

    @PrePersist
    protected void onCreate() {
        if (status == null) {
            status = "OPEN";
        }
    }
}
