package com.example.smartjobportal.repository;

import com.example.smartjobportal.entity.Application;
import com.example.smartjobportal.entity.Job;
import com.example.smartjobportal.entity.JobSeeker;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ApplicationRepository extends JpaRepository<Application, Long> {
    List<Application> findBySeeker(JobSeeker seeker);
    List<Application> findByJob(Job job);
}
