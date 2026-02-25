package com.wellness.analytics.service;

import com.wellness.analytics.dto.GraphResponseDTO;
import com.wellness.analytics.dto.ReportRequestDTO;
import com.wellness.analytics.model.Report;
import com.wellness.activity.repository.IActivityRepository;
import com.wellness.challenge.repository.ChallengeRepository;
import com.wellness.challenge.repository.GoalRepository;
import com.wellness.userAdmin.repository.IUserRepository;
import com.wellness.program.repository.ProgramRepository;
import com.wellness.analytics.repository.ReportRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDate;
import java.time.Month;
import java.time.format.TextStyle;
import java.util.*;

@RequiredArgsConstructor
@Service
public class AnalyticsService {

    private final IActivityRepository activityRepo;
    private final GoalRepository goalRepo;
    private final ChallengeRepository challengeRepo;
    private final IUserRepository userRepo;
    private final ProgramRepository programRepo;
    private final ReportRepository reportsRepo;

    // Generic mapping logic to create PAIRS (DataPoints)
    private <T, U> GraphResponseDTO<T, U> map(String label, List<Object[]> data) {
        List<GraphResponseDTO.DataPoint<T, U>> points = new ArrayList<>();
        if (data != null) {
            for (Object[] row : data) {
                T xVal = (row.length > 0) ? (T) row[0] : null;
                // Safely handle numeric conversion for Y values
                U yVal = null;
                if (row.length > 1 && row[1] != null) {
                    yVal = (U) row[1];
                }
                points.add(new GraphResponseDTO.DataPoint<>(xVal, yVal));
            }
        }
        return new GraphResponseDTO<>(label, points);
    }

    private void log(String scope, String metric) {
        Report reportObj = new Report();
        reportObj.setScope(scope);
        reportObj.setMetrics(metric);
        reportObj.setGeneratedDate(LocalDate.now());
        reportsRepo.save(reportObj);
    }

    private String getMonthName(Object monthObj) {
        if (monthObj == null) return "Other";
        try {
            int monthInt = ((Number) monthObj).intValue();
            return Month.of(monthInt).getDisplayName(TextStyle.SHORT, Locale.ENGLISH);
        } catch (Exception e) {
            return String.valueOf(monthObj);
        }
    }

    // --- Analytics Methods ---

    public GraphResponseDTO<String, Long> participationStatus() {
        log("ORG", "Participation Status");
        return map("Participation Status", activityRepo.participationStatus());
    }

    public GraphResponseDTO<String, Long> departmentParticipation() {
        log("MANAGER", "Department Participation");
        return map("Department Participation", activityRepo.participationByDepartment());
    }

    public GraphResponseDTO<String, Long> programParticipation() {
        log("ORG", "Program Participation");
        return map("Program Participation", activityRepo.participationByProgram());
    }

    public GraphResponseDTO<String, Long> categoryParticipation() {
        log("ORG", "Category Participation");
        return map("Category Participation", activityRepo.participationByCategory());
    }

    public GraphResponseDTO<String, Double> monthlyTrend() {
        log("ORG", "Monthly Trend");
        List<Object[]> data = activityRepo.monthlyTrend();
        List<GraphResponseDTO.DataPoint<String, Double>> points = new ArrayList<>();
        if (data != null) {
            for (Object[] row : data) {
                points.add(new GraphResponseDTO.DataPoint<>(
                    getMonthName(row[0]), 
                    row.length > 1 && row[1] != null ? ((Number) row[1]).doubleValue() : 0.0
                ));
            }
        }
        return new GraphResponseDTO<>("Monthly Trend", points);
    }

    public GraphResponseDTO<String, Long> challengeCompletion() {
        log("ORG", "Challenge Completion");
        return map("Challenge Completion", challengeRepo.challengeCompletion());
    }

    public GraphResponseDTO<String, Double> engagementByDepartment() {
        log("ORG", "Department Engagement");
        return map("Department Engagement", goalRepo.engagementByDepartment());
    }

    public GraphResponseDTO<String, Long> managerTeamSize() {
        log("MANAGER", "Team Size");
        return map("Manager Team Size", userRepo.managerTeamSize());
    }

    public GraphResponseDTO<String, Long> completionStatus() {
        log("ORG", "Completion Status");
        return map("Activity Completion Status", activityRepo.completionStatus());
    }

    public GraphResponseDTO<String, Long> goalStatus() {
        log("ORG", "Goal Status");
        return map("Goal Status", goalRepo.goalStatus());
    }

    public GraphResponseDTO<String, Long> programStatus() {
        log("ORG", "Program Status");
        return map("Program Status", programRepo.programStatusCount());
    }

    // --- Reports CRUD ---

    public Report createReport(ReportRequestDTO dto) {
        Report report = new Report();
        report.setScope(dto.getScope());
        report.setMetrics(dto.getMetrics());
        report.setGeneratedDate(LocalDate.now());
        return reportsRepo.save(report);
    }

    public List<Report> getAllReports() { return reportsRepo.findAll(); }

    public Report getReportById(Long id) {
        return reportsRepo.findById(id).orElseThrow(() -> 
            new ResponseStatusException(HttpStatus.NOT_FOUND, "Report not found with id " + id));
    }

    public Report updateReport(Long id, ReportRequestDTO dto) {
        Report report = getReportById(id);
        report.setScope(dto.getScope());
        report.setMetrics(dto.getMetrics());
        return reportsRepo.save(report);
    }

    public void deleteReport(Long id) {
        reportsRepo.deleteById(id);
    }
}