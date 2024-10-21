package com.kh.topgunFinal.restcontroller;

import java.util.List;


import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import com.kh.topgunFinal.dao.NoticeDao;
import com.kh.topgunFinal.dto.NoticeDto;
import com.kh.topgunFinal.error.TargetNotFoundException;

@CrossOrigin(origins = {"http://localhost:3000"}) // CORS 해제 설정
@RestController
@RequestMapping("/notice")
public class NoticeRestController {

    @Autowired
    private NoticeDao noticeDao;

    // 공지사항 등록
    @PostMapping("/") // Create (등록) - 200, 500
    public void insert(@RequestBody NoticeDto noticeDto) {
        noticeDto.setNoticeId(noticeDao.getNextSequence());
        noticeDao.insert(noticeDto);
    }

    // 공지사항 목록 조회
    @GetMapping("/") // Read (목록) - 200, 500
    public List<NoticeDto> list() {
        return noticeDao.selectList();
    }

    // 단일 공지사항 조회
    @GetMapping("/{noticeId}") // Read (상세) - 200, 404, 500
    public NoticeDto detail(@PathVariable int noticeId) {
        NoticeDto noticeDto = noticeDao.selectOne(noticeId);
        if (noticeDto == null) {
            throw new TargetNotFoundException();
        }
        return noticeDto;
    }

    // 공지사항 수정
    @PutMapping("/") // Update (수정) - 200, 404, 500
    public void update(@RequestBody NoticeDto noticeDto) {
        boolean result = noticeDao.update(noticeDto);
        if (!result) {
            throw new TargetNotFoundException();
        }
    }

    // 공지사항 삭제
    @DeleteMapping("/{noticeId}") // Delete (삭제) - 200, 404, 500
    public void delete(@PathVariable int noticeId) {
        boolean result = noticeDao.delete(noticeId);
        if (!result) {
            throw new TargetNotFoundException();
        }
    }
}