//package com.wellness.analytics.dto;
//
//import lombok.*;
//import java.util.List;
//
//@Data
//@AllArgsConstructor
//@NoArgsConstructor
//public class GraphResponseDTO {
//    private List<String> x;
//    private List<Double> y;
//}


package com.wellness.analytics.dto;

import lombok.*;
import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class GraphResponseDTO<T, U> {
    private String label;
    private List<DataPoint<T, U>> data;

    @Data
    @AllArgsConstructor
    public static class DataPoint<T, U> {
        private T x;
        private U y;
    }
}