package com.kh.topgunFinal.mapper;

import java.sql.ResultSet;
import java.sql.SQLException;

import org.springframework.jdbc.core.RowMapper;
import org.springframework.stereotype.Service;

import com.kh.topgunFinal.dto.FlightDto;

@Service
public class FlightMapper implements RowMapper<FlightDto> {
    @Override
    public FlightDto mapRow(ResultSet rs, int rowNum) throws SQLException {
        FlightDto flightDto = new FlightDto();
        
        flightDto.setFlightId(rs.getInt("flightId"));
        flightDto.setFlightNumber(rs.getString("flightNumber"));
        flightDto.setDepartureTime(rs.getTimestamp("departureTime"));
        flightDto.setArrivalTime(rs.getTimestamp("arrivalTime"));
        flightDto.setFlightTime(rs.getTimestamp("flightTime"));
        flightDto.setDepartureAirport(rs.getString("departureAirport"));
        flightDto.setArrivalAirport(rs.getString("arrivalAirport"));
        flightDto.setUserId(rs.getString("userId"));
        flightDto.setFlightTotalSeat(rs.getInt("flightTotalSeat"));
        flightDto.setFlightStatus(rs.getString("flightStatus"));
        
        return flightDto;
    }
}
