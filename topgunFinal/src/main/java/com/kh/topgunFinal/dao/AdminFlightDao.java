package com.kh.topgunFinal.dao;

import java.util.List;

import org.apache.ibatis.session.SqlSession;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Repository;

import com.kh.topgunFinal.dto.FlightDto;

@Repository
public class AdminFlightDao {
	
	@Autowired
    private SqlSession sqlSession;
	
	 // 수정
    public boolean update(FlightDto dto) {
        int result = sqlSession.update("admin.fix", dto);
        return result > 0;
    }
    
 // 조회
    public List<FlightDto> selectList() {
        return sqlSession.selectList("admin.list");
    }
    
 // 상세
    public FlightDto selectOne(int flightId) {
        return sqlSession.selectOne("admin.find", flightId);
    }
	
	

}
