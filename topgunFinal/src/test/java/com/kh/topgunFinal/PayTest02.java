package com.kh.topgunFinal;

import java.net.URI;
import java.net.URISyntaxException;
import java.util.HashMap;
import java.util.Map;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.web.client.RestTemplate;

import lombok.extern.slf4j.Slf4j;

@Slf4j
@SpringBootTest
public class PayTest02 {
	
	@Test
	public void test() throws URISyntaxException {
		//#1
		RestTemplate template = new RestTemplate();
		//#2
		URI uri = new URI("https://open-api.kakaopay.com/online/v1/payment/approve");
		//#3
		HttpHeaders headers = new HttpHeaders();
		headers.add("Authorization", "SECRET_KEY DEV701B1882029E1561FEB7DC2C49194A65F1E53");
		headers.add("Content-Type", "application/json");
		//#4
		Map<String, String> body = new HashMap<>();	
		body.put("cid", "TC0ONETIME");
		body.put("partner_order_id", "b0d3a8f4-2328-416c-b443-e7594a5dd8fc");
		body.put("partner_user_id", "453e5911-4a4c-41dc-a4f9-f8de52fa7323");
		body.put("tid", "T710e88e058063938a4f");
		body.put("pg_token", "5c04da7947653a37f20d");
		//#5
		HttpEntity entity = new HttpEntity(body, headers);
		//#6
		Map response = template.postForObject(uri, entity, Map.class);
		log.info("response={}", response);
	}
}
