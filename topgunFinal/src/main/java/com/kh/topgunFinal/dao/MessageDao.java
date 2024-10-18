package com.kh.topgunFinal.dao;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.apache.ibatis.session.SqlSession;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import com.kh.topgunFinal.dto.MessageDto;
import com.kh.topgunFinal.vo.MessageVO;

@Repository
public class MessageDao {
	@Autowired
	private SqlSession sqlSession;
	
	//시퀀스 생성
	public int sequence() {
		return sqlSession.selectOne("message.sequence");
	}
	//메세지 등록
	public void insert(MessageDto messageDto) {
		sqlSession.insert("message.insert", messageDto);
	}
	
	//채팅방 입장 시 DB에 저장된 메세지 조회
	public List<MessageVO> selectListMessage(String usersId, int beginRow, int endRow,int roomNo){
		Map<String, Object> params = new HashMap<>();
		params.put("usersId", usersId);
		params.put("beginRow", beginRow);
		params.put("endRow", endRow);
		params.put("roomNo", roomNo);
		
		return sqlSession.selectList("message.listMessage", params);
	}
	
	//더보기
	public List<MessageVO> selectListMessage(String usersId, int beginRow, int endRow, 
																		int firstMessageNo ,int roomNo){
		Map<String, Object> params = new HashMap<>();
		params.put("usersId", usersId);
		params.put("beginRow", beginRow);
		params.put("endRow", endRow);
		params.put("firstMessageNo", firstMessageNo);
		params.put("roomNo", roomNo);
		
		return sqlSession.selectList("message.listMessage", params);
	}
}
