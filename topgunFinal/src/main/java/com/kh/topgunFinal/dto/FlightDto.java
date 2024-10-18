package com.kh.topgunFinal.dto;

import java.sql.Timestamp;

import lombok.Data;

@Data
public class FlightDto {
    private int flightId; 
    private String flightNumber; 
    private Timestamp departureTime; 
    private Timestamp arrivalTime; 
    private Timestamp flightTime; 
    private String departureAirport; 
    private String arrivalAirport; 
    private String userId; 
    private int flightTotalSeat; 
    private String flightStatus; 
}

