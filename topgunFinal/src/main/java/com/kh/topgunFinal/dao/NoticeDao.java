package com.kh.topgunFinal.dao;

import java.util.List;

import org.apache.ibatis.session.SqlSession;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Repository;
import com.kh.topgunFinal.dto.NoticeDto;

@Repository
public class NoticeDao {

    @Autowired
    private SqlSession sqlSession;

    // 등록
    public void insert(NoticeDto dto) {
        sqlSession.insert("notice.add", dto);
    }

    // 수정
    public boolean update(NoticeDto dto) {
        int result = sqlSession.update("notice.update", dto);
        return result > 0;
    }

    // 삭제
    public boolean delete(int noticeId) {
        return sqlSession.delete("notice.delete", noticeId) > 0;
    }

    // 전체 목록 조회
    public List<NoticeDto> selectList() {
        return sqlSession.selectList("notice.list");
    }

    // 단일 조회
    public NoticeDto selectOne(int noticeId) {
        return sqlSession.selectOne("notice.detail", noticeId);
    }

    // 시퀀스 생성
    public int getNextSequence() {
        return sqlSession.selectOne("notice.getSequence");
    }
}