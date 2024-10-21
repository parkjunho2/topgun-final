package com.kh.topgunFinal.vo;

import com.fasterxml.jackson.annotation.JsonInclude;

import lombok.Data;
@JsonInclude(JsonInclude.Include.NON_NULL) // null인 필드 제외
@Data
public class InfoResponseVO {
    private String usersId;
    private String usersName;
    private String usersEmail;
    private String usersContact;
    private String usersType;

    // 회원일 경우
    private String memberEngName;
    private String memberBirth; // 생년월일
    private String memberGender; // 성별

    // 항공사일 경우
    private String airlineName;
    private String airlineNo;
    
    //관리자일 경우
    private String adminDepartment;
    private String adminAccessLevel;
}
