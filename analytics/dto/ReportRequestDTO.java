package com.wellness.analytics.dto;
import lombok.Data;

@Data
public class ReportRequestDTO {
    private String scope;
    private String metrics;
}