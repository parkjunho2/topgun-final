package com.kh.topgunFinal.service;

import java.net.URI;
import java.net.URISyntaxException;
import java.util.HashMap;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import com.kh.topgunFinal.configuration.PayProperties;
import com.kh.topgunFinal.vo.pay.PayApproveResponseVO;
import com.kh.topgunFinal.vo.pay.PayApproveRequestVO;
import com.kh.topgunFinal.vo.pay.PayReadyRequestVO;
import com.kh.topgunFinal.vo.pay.PayReadyResponseVO;

@Service
public class PayService {
	//#1~#6
	@Autowired
	private PayProperties payProperties;// cid, secret
	@Autowired//#1 보내는 방법
	private RestTemplate template;// 외부 API통신 도구
	@Autowired//#3 보내는 사람
	private HttpHeaders headers;// Authorization + Content-Type

	// 결제 준비(ready)
	public PayReadyResponseVO ready(PayReadyRequestVO request) throws URISyntaxException {
		//#2 보낼 주소
		URI uri = new URI("https://open-api.kakaopay.com/online/v1/payment/ready");
		//#4 보낼 내용
		Map<String, String> body = new HashMap<>();
		body.put("cid", payProperties.getCid());
		body.put("partner_order_id", request.getPartnerOrderId());//주문번호
		body.put("partner_user_id", request.getPartnerUserId());//회원아이디
		body.put("item_name", request.getItemName());//상품명 (비지니스 || 이코노미 + 좌석번호)
		body.put("quantity", "1");//수량
		body.put("total_amount", String.valueOf(request.getTotalAmount()));//숫자를 문자열로 바꾸는 변환명령 String.valueOf
		body.put("tax_free_amount", "0");
		body.put("approval_url", request.getApprovalUrl() + "/" + request.getPartnerOrderId());
		body.put("cancel_url", request.getCancelUrl());
		body.put("fail_url", request.getFailUrl());
		//#5(#3+#4) , 4번의 설정된 정보를 불러와야 되서 configuration 에 넣을 수 없음 , 모두 모아서 kakaopay 로부터 전송
		HttpEntity entity = new HttpEntity(body, headers);
		//#6 response= #1.post(#2+#5.#6.class) ,모두 담아서 SeatsResController에 전송
		PayReadyResponseVO response = template.postForObject(uri, entity, PayReadyResponseVO.class);
		//SeatResController로부터 받아온 tid,url,partner_order_id, partner_user_id 받음
		return response;
	}

	// 결제 승인(approve) , ready (tid,partner_order_id, partner_user_id, pg_token)을 입력후 다시 전송
	public PayApproveResponseVO approve(PayApproveRequestVO request) throws URISyntaxException {
		//#2 다시 보낼 주소
		URI uri = new URI("https://open-api.kakaopay.com/online/v1/payment/approve");
		//#4 입력해야될 정보들
		Map<String, String> body = new HashMap<>();
		body.put("cid", payProperties.getCid());
		body.put("partner_order_id", request.getPartnerOrderId());
		body.put("partner_user_id", request.getPartnerUserId());
		body.put("tid", request.getTid());
		body.put("pg_token", request.getPgToken());
		//#5(#3+#4)
		HttpEntity entity = new HttpEntity(body, headers);
		//#6
		PayApproveResponseVO response = template.postForObject(uri, entity, PayApproveResponseVO.class);
		return response;
	}
}
