package com.example.smartjobportal.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "assessments")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Assessment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "assessment_id")
    private Long id;

    @Column(name = "assessment_name", nullable = false)
    private String name;

    @Column(name = "assessment_type", nullable = false)
    private String type;

    @Column(name = "total_marks", nullable = false)
    private Double totalMarks;
}
