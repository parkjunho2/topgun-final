package com.kh.topgunFinal.dao;

import java.util.List;

import org.apache.ibatis.session.SqlSession;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

import com.kh.topgunFinal.dto.FlightDto;
import com.kh.topgunFinal.mapper.FlightMapper;

@Repository
public class FlightDao {
    
    @Autowired
    private JdbcTemplate jdbcTemplate;
    @Autowired
    private FlightMapper flightMapper; // FlightMapper로 변경
    
    @Autowired
    private SqlSession sqlSession;
    
    // 등록
    public void insert(FlightDto dto) {
        sqlSession.insert("flight.add", dto);
    }
    
    // 수정
    public boolean update(FlightDto dto) {
        int result = sqlSession.update("flight.fix", dto);
        return result > 0;
    }
    
    // 삭제
    public boolean delete(int flightId) {
        return sqlSession.delete("flight.del", flightId) > 0;
    }
    
    // 조회
    public List<FlightDto> selectList() {
        return sqlSession.selectList("flight.list");
    }
    
  //검색
  	public List<FlightDto> selectList(String column, String keyword) {
  		String sql = "select * from flight "
  						+ "where instr("+column+", ?) > 0 "
  						+ "order by "+column+" asc, flight_id asc";
  		Object[] data = {keyword};
  		return jdbcTemplate.query(sql, flightMapper, data);
  	}
    
    // 상세
    public FlightDto selectOne(int flightId) {
        return sqlSession.selectOne("flight.find", flightId);
    }
    
     
    // 시퀀스 생성 및 등록 메소드
    public int sequence() {
        String sql = "select flight_seq.nextval from dual";
        return jdbcTemplate.queryForObject(sql, int.class);
    }
    
    public void insertWithSequence(FlightDto flightDto) {
        String sql = "insert into flight("
                        + "flight_id, flight_number, departure_time, arrival_time, "
                        + "flight_time, departure_airport, arrival_airport, user_id, flight_total_seat"
                    + ") values(?, ?, ?, ?, ?, ?, ?, ?, ?)";
        Object[] data = {
            flightDto.getFlightId(), 
            flightDto.getFlightNumber(),
            flightDto.getDepartureTime(),
            flightDto.getArrivalTime(),
            flightDto.getFlightTime(),
            flightDto.getDepartureAirport(),
            flightDto.getArrivalAirport(),
            flightDto.getUserId(),
            flightDto.getFlightTotalSeat()
        };
        jdbcTemplate.update(sql, data);
    }
    
}


