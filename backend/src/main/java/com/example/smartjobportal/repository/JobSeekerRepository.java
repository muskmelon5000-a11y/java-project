package com.example.smartjobportal.repository;

import com.example.smartjobportal.entity.JobSeeker;
import com.example.smartjobportal.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface JobSeekerRepository extends JpaRepository<JobSeeker, Long> {
    Optional<JobSeeker> findByUser(User user);
}
