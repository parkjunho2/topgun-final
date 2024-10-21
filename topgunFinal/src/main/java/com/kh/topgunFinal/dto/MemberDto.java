package com.kh.topgunFinal.dto;

import java.time.LocalDateTime;

import lombok.Data;

// 사용자 상세 정보
@Data
public class MemberDto {
	private String memberId; // member_id, users_id와 동일하게 관리됨
	private String memberEngName; // member_eng_name
	private LocalDateTime memberBirth; // member_birth
	private String memberGender; // member_gender 'M' 또는 'W'
	private int memberPoint; // member_point
}
