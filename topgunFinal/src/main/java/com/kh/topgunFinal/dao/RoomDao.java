package com.kh.topgunFinal.dao;

import java.util.List;

import org.apache.ibatis.session.SqlSession;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Repository;

import com.kh.topgunFinal.dto.RoomDto;
import com.kh.topgunFinal.dto.RoomMemberDto;
import com.kh.topgunFinal.vo.RoomVO;

@Repository
public class RoomDao {

	@Autowired
	private SqlSession sqlSession;
	
	public int sequence() {
		return sqlSession.selectOne("room.sequence");
	}
	public void insert(RoomDto roomDto) {
		sqlSession.insert("room.insert", roomDto);
	}
	public List<RoomDto> selectList(){
		return sqlSession.selectOne("room.list");
	}
	public List<RoomVO> selectList(String usersId){
		return sqlSession.selectOne("room.listByUser", usersId);
	}
	public RoomDto selectOne(int roomNo) {
		return sqlSession.selectOne("room.detail", roomNo);
	}
	
	//채팅방 입장(roomMember 테이블)
	public void enter(RoomMemberDto roomMemberDto) {
		sqlSession.insert("roomMember.enter", roomMemberDto);
	}
	//채팅방 퇴장(roomMember 테이블)
	public boolean leave(RoomMemberDto roomMemberDto) {
		return sqlSession.delete("roomMember.leave", roomMemberDto) > 0;
	}
	//채팅방 자격 검사(roomMember 테이블)
	public boolean check(RoomMemberDto roomMemberDto) {
		int result = sqlSession.selectOne("roomMember.check", roomMemberDto);
		return result > 0;
	}
}
