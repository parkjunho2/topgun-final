package com.kh.topgunFinal.dto;

import java.time.LocalDateTime;

import com.fasterxml.jackson.annotation.JsonFormat;

import lombok.Data;


@Data
public class NoticeDto {
    private int noticeId;          // 공지사항 ID
    private String title;          // 공지사항 제목
    private String content;        // 공지사항 내용
    private String author;         // 작성자
    private String createdAt; // 작성일자 
}
