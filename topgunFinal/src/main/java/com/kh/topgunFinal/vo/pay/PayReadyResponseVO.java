package com.kh.topgunFinal.vo.pay;

import java.time.LocalDateTime;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.databind.PropertyNamingStrategies;
import com.fasterxml.jackson.databind.annotation.JsonNaming;

import lombok.Data;

@Data
@JsonNaming(PropertyNamingStrategies.SnakeCaseStrategy.class)//언더바를 카멜케이스로 변환
@JsonIgnoreProperties(ignoreUnknown =true)//받지 않을 정보는 무시
public class PayReadyResponseVO {
	private String tid;
//	private String nextRedirectAppUrl;//앱결제
//	private String nextRedirectMobileUrl;//모바일결제
	private String nextRedirectPcUrl;
//	private String androidAppScheme;//안드로이드결제
//	private String iosAppScheme;//아이폰결제
	private LocalDateTime createdAt;
}
