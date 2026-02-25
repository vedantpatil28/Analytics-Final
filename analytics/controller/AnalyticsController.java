package com.wellness.analytics.controller;

import com.wellness.analytics.dto.GraphResponseDTO;
import com.wellness.analytics.dto.ReportRequestDTO;
import com.wellness.analytics.model.Report;
import com.wellness.analytics.service.AnalyticsService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/analytics")
@CrossOrigin(origins = "http://localhost:5173")
public class AnalyticsController {

    @Autowired private AnalyticsService analyticsService;

    // --- Generic Graph Endpoints ---

    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    @GetMapping("/participation/status")
    public ResponseEntity<GraphResponseDTO<String, Long>> participationStatus() { 
        return ResponseEntity.ok(analyticsService.participationStatus()); 
    }

    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    @GetMapping("/participation/department")
    public ResponseEntity<GraphResponseDTO<String, Long>> departmentParticipation() { 
        return ResponseEntity.ok(analyticsService.departmentParticipation()); 
    }

    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    @GetMapping("/participation/program")
    public ResponseEntity<GraphResponseDTO<String, Long>> programParticipation() { 
        return ResponseEntity.ok(analyticsService.programParticipation()); 
    }

    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    @GetMapping("/participation/category")
    public ResponseEntity<GraphResponseDTO<String, Long>> categoryParticipation() { 
        return ResponseEntity.ok(analyticsService.categoryParticipation()); 
    }

    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    @GetMapping("/trend/monthly")
    public ResponseEntity<GraphResponseDTO<String, Double>> monthlyTrend() { 
        return ResponseEntity.ok(analyticsService.monthlyTrend()); 
    }

    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    @GetMapping("/challenge/completion")
    public ResponseEntity<GraphResponseDTO<String, Long>> challengeCompletion() { 
        return ResponseEntity.ok(analyticsService.challengeCompletion()); 
    }

    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    @GetMapping("/engagement/department")
    public ResponseEntity<GraphResponseDTO<String, Double>> engagementByDepartment() { 
        return ResponseEntity.ok(analyticsService.engagementByDepartment()); 
    }

    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    @GetMapping("/manager/team-size")
    public ResponseEntity<GraphResponseDTO<String, Long>> managerTeamSize() { 
        return ResponseEntity.ok(analyticsService.managerTeamSize()); 
    }

    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    @GetMapping("/activity/completion-status")
    public ResponseEntity<GraphResponseDTO<String, Long>> completionStatus() { 
        return ResponseEntity.ok(analyticsService.completionStatus()); 
    }

    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    @GetMapping("/goal/status")
    public ResponseEntity<GraphResponseDTO<String, Long>> goalStatus() { 
        return ResponseEntity.ok(analyticsService.goalStatus()); 
    }

    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    @GetMapping("/program/status")
    public ResponseEntity<GraphResponseDTO<String, Long>> programStatus() { 
        return ResponseEntity.ok(analyticsService.programStatus()); 
    }

    // --- Reports Section ---

    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    @PostMapping("/reports")
    public ResponseEntity<Report> createReport(@RequestBody ReportRequestDTO dto) { 
        return ResponseEntity.status(HttpStatus.CREATED).body(analyticsService.createReport(dto)); 
    }

    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    @GetMapping("/reports")
    public ResponseEntity<List<Report>> getAllReports() { 
        return ResponseEntity.ok(analyticsService.getAllReports()); 
    }

    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    @GetMapping("/reports/{id}")
    public ResponseEntity<Report> getReportById(@PathVariable Long id) { 
        return ResponseEntity.ok(analyticsService.getReportById(id)); 
    }

    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    @PutMapping("/reports/{id}")
    public ResponseEntity<Report> updateReport(@PathVariable Long id, @RequestBody ReportRequestDTO dto) { 
        return ResponseEntity.ok(analyticsService.updateReport(id, dto)); 
    }

    @PreAuthorize("hasAnyRole('ADMIN')")
    @DeleteMapping("/reports/{id}")
    public ResponseEntity<String> deleteReport(@PathVariable Long id) {
        analyticsService.deleteReport(id);
        return ResponseEntity.ok("Report deleted successfully");
    }
}