package com.example.smartjobportal.repository;

import com.example.smartjobportal.entity.Job;
import com.example.smartjobportal.entity.Recruiter;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface JobRepository extends JpaRepository<Job, Long> {
    List<Job> findByRecruiter(Recruiter recruiter);
}
