package com.kh.topgunFinal.restcontroller;


import java.net.URISyntaxException;
import java.util.List;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.kh.topgunFinal.dao.PaymentDao;
import com.kh.topgunFinal.dao.SeatsDao;
import com.kh.topgunFinal.dto.PaymentDto;
import com.kh.topgunFinal.dto.SeatsDto;
import com.kh.topgunFinal.error.TargetNotFoundException;
import com.kh.topgunFinal.service.PayService;
import com.kh.topgunFinal.service.TokenService;
import com.kh.topgunFinal.vo.SeatsApproveRequestVO;
import com.kh.topgunFinal.vo.SeatsPurchaseRequestVO;
import com.kh.topgunFinal.vo.SeatsQtyVO;
import com.kh.topgunFinal.vo.UserClaimVO;
import com.kh.topgunFinal.vo.pay.PayApproveRequestVO;
import com.kh.topgunFinal.vo.pay.PayApproveResponseVO;
import com.kh.topgunFinal.vo.pay.PayReadyRequestVO;
import com.kh.topgunFinal.vo.pay.PayReadyResponseVO;

import lombok.extern.slf4j.Slf4j;

@Slf4j
@CrossOrigin(origins= {"http://localhost:3000"})
@RestController
@RequestMapping("/seats")
public class SeatsRestController {

	@Autowired
	private SeatsDao seatsDao;
	
	@Autowired
	private PayService payService;
	
	@Autowired
	private TokenService tokenService;

	@Autowired
	private PaymentDao paymentDao;
	
	//좌석 조회
	@GetMapping("/")
	public List<SeatsDto>list(){
		return seatsDao.selectList();
	}
	
	//좌석 구매
	@PostMapping("/purchase")
	public PayReadyResponseVO purchase(
			@RequestHeader("Authorization") String token,//회원토큰
			@RequestBody SeatsPurchaseRequestVO request) throws URISyntaxException {
		UserClaimVO claimVO = //회원 아이디 불러옴
				tokenService.check(tokenService.removeBearer(token));
		
		StringBuffer buffer = new StringBuffer();
		int total=0;
		for(SeatsQtyVO vo : request.getSeatsList()) {
			SeatsDto seatsDto = seatsDao.selectOne(vo.getSeatsNo());
			if(seatsDto==null) throw new TargetNotFoundException("결제 대상 없음");
			total += seatsDto.getSeatsPrice() * vo.getQty();
			if(buffer.isEmpty()) {
				buffer.append(seatsDto.getSeatsRank());
			}
		}
		if(request.getSeatsList().size()>=2) {
			buffer.append(" 외 " +(request.getSeatsList().size()-1)+"건");
		}
		//payService #4에 body에 해당
		//ready 준비 (입력)
		PayReadyRequestVO requestVO = new PayReadyRequestVO();
		requestVO.setPartnerOrderId(UUID.randomUUID().toString());//주문번호 Random
		requestVO.setPartnerUserId(claimVO.getUserId());//token
		requestVO.setItemName(buffer.toString());
		requestVO.setTotalAmount(total);
		requestVO.setApprovalUrl(request.getApprovalUrl());
		requestVO.setCancelUrl(request.getCancelUrl());
		requestVO.setFailUrl(request.getFailUrl());
		//ready 처리 (입력된 값을) , payservice로 가서 ready #4에 requestVO 입력
		PayReadyResponseVO responseVO = payService.ready(requestVO);
		//ready 출력 PayService response로부터 tid,url,partner_order_id, partner_user_id 받아옴
		return responseVO;
	}
	//response에 받은 tid ,partner_order_id, partner_user_id , pg_token 전달
	@PostMapping("/approve")
	public PayApproveResponseVO approve(
			@RequestHeader ("Authorization") String token, //아이디 토큰
			@RequestBody SeatsApproveRequestVO request // tid,pg_token,partnerOrderId
			) throws URISyntaxException {
	
		UserClaimVO claimVO = //아이디 토큰 불러옴
				tokenService.check(tokenService.removeBearer(token));
		//approve 준비 (입력)
		PayApproveRequestVO requestVO = new PayApproveRequestVO();
		requestVO.setPartnerOrderId(request.getPartnerOrderId());
		requestVO.setPartnerUserId(claimVO.getUserId());
		requestVO.setTid(request.getTid());
		requestVO.setPgToken(request.getPgToken());
		//approve 처리 client에 전송
		PayApproveResponseVO responseVO = payService.approve(requestVO);

		//최종 결제 DB저장
		
		//[1]대표 저보 등록
		int paymentSeq= paymentDao.paymentSequence();
		PaymentDto paymentDto = new PaymentDto();
		paymentDto.setPyamentNo(paymentSeq);
		paymentDto.setPaymentTid(responseVO.getTid());
		paymentDto.setPaymentName(responseVO.getItemName());
		//approve 출력
		return responseVO;
	}
			
}
