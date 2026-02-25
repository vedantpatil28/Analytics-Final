package com.wellness.analytics.service;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.web.server.ResponseStatusException;
import com.wellness.activity.repository.IActivityRepository;
import com.wellness.analytics.dto.GraphResponseDTO;
import com.wellness.analytics.model.Report;
import com.wellness.analytics.repository.ReportRepository;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class TestAnalyticsService {

    @Mock
    private IActivityRepository activityRepo;

    @Mock
    private ReportRepository reportsRepo;

    @InjectMocks
    private AnalyticsService analyticsService;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
    }

    @Test
    void testParticipationStatus() {
        // Arrange
        List<Object[]> mockData = new ArrayList<>();
        mockData.add(new Object[]{"Active", 50.0});
        when(activityRepo.participationStatus()).thenReturn(mockData);

        // Act
        // Note: Using the generic <String, Double> to match the service return type
        GraphResponseDTO<String, Long> result = analyticsService.participationStatus();

        // Assert
        assertNotNull(result);
        assertEquals("Participation Status", result.getLabel());
        assertEquals(1, result.getData().size());
        
        // Accessing the paired data correctly
        assertEquals("Active", result.getData().get(0).getX());
        assertEquals(50, result.getData().get(0).getY());

        // Verify log() was called via reportsRepo save
        verify(reportsRepo, times(1)).save(any(Report.class));
    }

    @Test
    void testGetReportById_Success() {
        // Arrange
        Report mockReport = new Report();
        mockReport.setReportId(1L);
        mockReport.setScope("ORG");
        when(reportsRepo.findById(1L)).thenReturn(Optional.of(mockReport));

        // Act
        Report result = analyticsService.getReportById(1L);

        // Assert
        assertNotNull(result);
        assertEquals("ORG", result.getScope());
        assertEquals(1L, result.getReportId());
    }

    @Test
    void testGetReportById_NotFound() {
        // Arrange
        when(reportsRepo.findById(99L)).thenReturn(Optional.empty());

        // Act & Assert
        assertThrows(ResponseStatusException.class, () -> {
            analyticsService.getReportById(99L);
        });
    }
}