package com.wellness.analytics.model;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;

@Entity
@Table(name = "reports")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Report {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "report_id")
    private Long reportId;
    @Column(nullable = false)
    private String scope;
    @Column(nullable = false, length = 500)
    private String metrics;
    @Column(name = "generated_date", nullable = false)
    private LocalDate generatedDate;
}