package com.kh.topgunFinal;

import java.net.URI;
import java.net.URISyntaxException;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.web.client.RestTemplate;

import lombok.extern.slf4j.Slf4j;

@Slf4j
@SpringBootTest
public class PayTest01 {

	
	
	@Test
	public void test() throws URISyntaxException {
		//#1 외부 API 전송할때 필요함
		RestTemplate template = new RestTemplate();
		
		//#2
		URI uri = new URI("https://open-api.kakaopay.com/online/v1/payment/ready");
		
		//#3
		HttpHeaders headers = new HttpHeaders();
		headers.add("Authorization", "SECRET_KEY DEV701B1882029E1561FEB7DC2C49194A65F1E53");
		headers.add("Content-Type", "application/json");
		
		//#4
		Map<String, String> body = new HashMap<>();	
		body.put("cid", "TC0ONETIME");
		body.put("partner_order_id", UUID.randomUUID().toString());
		body.put("partner_user_id", UUID.randomUUID().toString());
		body.put("item_name", "테스트연습");
		body.put("quantity", "1");
		body.put("total_amount", "99000");
		body.put("tax_free_amount", "0");
		body.put("approval_url", "http://localhost:8080/success");
		body.put("cancel_url", "http://localhost:8080/cancel");
		body.put("fail_url", "http://localhost:8080/fail");
		
		//3+4
		HttpEntity entity = new HttpEntity(body, headers);
		
		//1+2+5
		Map response = template.postForObject(uri, entity, Map.class);
		log.info("url={}", response.get("next_redirect_pc_url"));
		log.info("tid={}", response.get("tid"));
		log.info("partner_order_id={}", body.get("partner_order_id"));
		log.info("partner_user_id={}", body.get("partner_user_id"));
		
	}
	
}
