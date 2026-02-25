package com.wellness.analytics.controller;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import com.wellness.analytics.model.Report;
import com.wellness.analytics.service.AnalyticsService;
import java.util.ArrayList;
import java.util.List;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

class TestAnalyticsController {

    private MockMvc mockMvc;

    @Mock
    private AnalyticsService analyticsService;

    @InjectMocks
    private AnalyticsController analyticsController;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
        mockMvc = MockMvcBuilders.standaloneSetup(analyticsController).build();
    }

    @Test
    void testGetReportById() throws Exception {
        Report report = new Report();
        report.setReportId(101L);
        report.setScope("ORG");
        when(analyticsService.getReportById(101L)).thenReturn(report);
        mockMvc.perform(get("/api/analytics/reports/101"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.reportId").value(101))
                .andExpect(jsonPath("$.scope").value("ORG"));
    }

    @Test
    void testGetAllReports() throws Exception {
        List<Report> list = new ArrayList<>();
        Report r = new Report();
        r.setReportId(1L);
        list.add(r);
        when(analyticsService.getAllReports()).thenReturn(list);
        mockMvc.perform(get("/api/analytics/reports"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].reportId").value(1));
    }
}