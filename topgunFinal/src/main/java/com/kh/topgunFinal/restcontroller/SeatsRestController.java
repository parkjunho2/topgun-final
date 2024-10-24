package com.kh.topgunFinal.restcontroller;


import java.net.URISyntaxException;
import java.util.List;
import java.util.UUID;

import org.apache.ibatis.session.SqlSession;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.kh.topgunFinal.dao.PaymentDao;
import com.kh.topgunFinal.dao.SeatsDao;
import com.kh.topgunFinal.dto.PaymentDetailDto;
import com.kh.topgunFinal.dto.PaymentDto;
import com.kh.topgunFinal.dto.SeatsDto;
import com.kh.topgunFinal.error.TargetNotFoundException;
import com.kh.topgunFinal.service.PayService;
import com.kh.topgunFinal.service.TokenService;
import com.kh.topgunFinal.vo.PaymentInfoVO;
import com.kh.topgunFinal.vo.PaymentTotalVO;
import com.kh.topgunFinal.vo.SeatsApproveRequestVO;
import com.kh.topgunFinal.vo.SeatsPurchaseRequestVO;
import com.kh.topgunFinal.vo.SeatsQtyVO;
import com.kh.topgunFinal.vo.UserClaimVO;
import com.kh.topgunFinal.vo.pay.PayApproveRequestVO;
import com.kh.topgunFinal.vo.pay.PayApproveResponseVO;
import com.kh.topgunFinal.vo.pay.PayCancelRequestVO;
import com.kh.topgunFinal.vo.pay.PayCancelResponseVO;
import com.kh.topgunFinal.vo.pay.PayOrderRequestVO;
import com.kh.topgunFinal.vo.pay.PayOrderResponseVO;
import com.kh.topgunFinal.vo.pay.PayReadyRequestVO;
import com.kh.topgunFinal.vo.pay.PayReadyResponseVO;

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
	
	@Autowired
	private SqlSession sqlSession;
	
	
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
		
		//total, itemName
		StringBuffer buffer = new StringBuffer();
		int total = 0;
		for(SeatsQtyVO vo : request.getSeatsList()) {
			SeatsDto seatsDto = seatsDao.selectOne(vo.getSeatsNo());
			if(seatsDto==null) throw new TargetNotFoundException("결제 대상 없음");
			total += seatsDto.getSeatsPrice() * vo.getQty();
			if(buffer.isEmpty()) {//첫번째 좌석 번호 //메인이름
				buffer.append("AirlineDto.getAirlineName() ");
				buffer.append(seatsDto.getSeatsRank());
				buffer.append(seatsDto.getSeatsNumber());
			}
		}
		if(request.getSeatsList().size()>=2) { //2좌석 이상 구매시
			buffer.append(" 외 " +(request.getSeatsList().size()-1)+"건");
		}
		//payService #4에 body에 해당
		//ready 준비 (입력)
		PayReadyRequestVO requestVO = new PayReadyRequestVO();
		requestVO.setPartnerOrderId(UUID.randomUUID().toString());//주문번호 Random
		requestVO.setPartnerUserId(claimVO.getUserId());//header token
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
	@Transactional
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
		
		//DB저장
		//[1]대표 정보 등록
		int paymentSeq= paymentDao.paymentSequence();
		PaymentDto paymentDto = new PaymentDto();
		paymentDto.setPaymentNo(paymentSeq);//결제번호
		paymentDto.setPaymentTid(responseVO.getTid());////거래번호
		paymentDto.setPaymentName(responseVO.getItemName());//상품명
		paymentDto.setPaymentTotal(responseVO.getAmount().getTotal());//총결제금액
		paymentDto.setPaymentRemain(paymentDto.getPaymentTotal());//취소가능금액
		paymentDto.setUserId(claimVO.getUserId());//결제한 아이디
		paymentDao.paymentInsert(paymentDto);//대표정보 등록
		
		//[2]상세 정보 등록
		for(SeatsQtyVO qtyVO : request.getSeatsList()) {//tid,pg_token,partner_orderId
			SeatsDto seatsDto = seatsDao.selectOne(qtyVO.getSeatsNo());//좌석조회
			if(seatsDto==null) throw new TargetNotFoundException("존재하지 않는 좌석입니다");//취소가 된다면 위에 있는거 모두 삭제
			
			int paymentDetailSeq= paymentDao.paymentDetailSequence();//번호추출
			PaymentDetailDto paymentDetailDto = new PaymentDetailDto();
			paymentDetailDto.setPaymentDetailNo(paymentDetailSeq);//번호 설정
			paymentDetailDto.setPaymentDetailName(seatsDto.getSeatsRank()+seatsDto.getSeatsNumber());//좌석번호
			paymentDetailDto.setPaymentDetailPrice(seatsDto.getSeatsPrice());//좌석판매가
			paymentDetailDto.setPaymentDetailSeatsNo(seatsDto.getSeatsNo());//좌석번호
			paymentDetailDto.setPaymentDetailQty(qtyVO.getQty());//구매수량
			paymentDetailDto.setPaymentDetailOrigin(paymentSeq);//어느소속에 상세번호인지
			paymentDao.paymentDetailInsert(paymentDetailDto);
		}
		//approve 출력
		return responseVO;
	}

	//구매 내역 조회
	@GetMapping("/paymentlist")
	public List<PaymentDto> paymentList(@RequestHeader("Authorization") String token){
		UserClaimVO claimVO = tokenService.check(tokenService.removeBearer(token)); 
		List<PaymentDto> list =paymentDao.selectList(claimVO. getUserId());
		return list;
	}
	//구매 내역 상세 조회
	@GetMapping("/paymentlist/{paymentNo}")
	public List<PaymentDetailDto> paymentDetailList(
			@RequestHeader("Authorization") String token,
			@PathVariable int paymentNo){
		UserClaimVO claimVO = tokenService.check(tokenService.removeBearer(token));
		
		PaymentDto paymentDto= paymentDao.selectOne(paymentNo);
		if(paymentDto==null)
			throw new TargetNotFoundException("존재하지 않는 결제번호");
		if(!paymentDto.getUserId().equals(claimVO.getUserId()))//내 결제 정보가 아니면
			throw new TargetNotFoundException("잘못된 대상의 결제번호");
		
		List<PaymentDetailDto> list = paymentDao.selectDetailList(paymentNo);
		return list;
	}
	//모든목록 한번에
	@GetMapping("/paymentTotalList")
	public List<PaymentTotalVO> paymentTotalList(
			@RequestHeader("Authorization") String token) {
		UserClaimVO claimVO = tokenService.check(tokenService.removeBearer(token));
		return  paymentDao.selectTotalList(claimVO.getUserId());
	}
	
	@GetMapping("/order/{tid}")
	public PayOrderResponseVO order(@PathVariable String tid) throws URISyntaxException {
		PayOrderRequestVO request = new PayOrderRequestVO();
		request.setTid(tid);
		return payService.order(request);
	}
	
	@GetMapping("/detail/{paymentNo}")
	public PaymentInfoVO detail(
			@RequestHeader("Authorization") String token,
			@PathVariable int paymentNo) throws URISyntaxException{
		//결제내역
		PaymentDto paymentDto = paymentDao.selectOne(paymentNo);
		if(paymentDto==null)
			throw new TargetNotFoundException("존재하지 않는 결제내역");
		//회원 소유 검증
		UserClaimVO claimVO = tokenService.check(tokenService.removeBearer(token));
		if(!paymentDto.getUserId().equals(claimVO.getUserId()))
			throw new TargetNotFoundException("결제내역의 소유자가 아닙니다.");
		//결제 상세 내역
		List<PaymentDetailDto> list = paymentDao.selectDetailList(paymentNo);
		//조회내역
		PayOrderRequestVO requestVO = new PayOrderRequestVO();
		requestVO.setTid(paymentDto.getPaymentTid());
		PayOrderResponseVO responseVO = payService.order(requestVO);
		
		//반환 형태 생성
		PaymentInfoVO infoVO = new PaymentInfoVO();
		infoVO.setPaymentDto(paymentDto);
		infoVO.setPaymentDetailList(list);
		infoVO.setResponseVO(responseVO);
		return infoVO;
	}
	
		//1. 전체취소(paymentNo)
		@Transactional
		@DeleteMapping("/cancelAll/{paymentNo}")
		public PayCancelResponseVO cancelAll(
				@PathVariable int paymentNo, 
				@RequestHeader("Authorization") String token) throws URISyntaxException{
			PaymentDto paymentDto = paymentDao.selectOne(paymentNo);
			if(paymentDto == null)
				throw new TargetNotFoundException("존재하지 않는 결제정보");
			UserClaimVO claimVO = tokenService.check(tokenService.removeBearer(token));
			if(!paymentDto.getUserId().equals(claimVO.getUserId()))
				throw new TargetNotFoundException("소유자 불일치");
			if(paymentDto.getPaymentRemain()==0)
				throw new TargetNotFoundException("이미 취소된 결제");
			
			//남은금액 취소 요청
			PayCancelRequestVO request = new PayCancelRequestVO();
			request.setTid(paymentDto.getPaymentTid());
			request.setCancelAmount(paymentDto.getPaymentRemain());
			PayCancelResponseVO response = payService.cancel(request);
			
			//잔여금액 0으로 변경
			paymentDao.cancelAll(paymentNo);
			//관련항목의 상태를 취소로 변경
			paymentDao.cancelAllItem(paymentNo);
			
			return response;
		}
		//2. 항목취소(paymentDetailNo)
		@DeleteMapping("/cancelItem/{paymentDetailNo}")
		public PayCancelResponseVO cancelItem(
				@RequestHeader("Authorization") String token, 
				@PathVariable int paymentDetailNo) throws URISyntaxException {
			PaymentDetailDto paymentDetailDto = 
					paymentDao.selectDetailOne(paymentDetailNo);
			if(paymentDetailDto==null)
				throw new TargetNotFoundException("존재하지 않는 결제정보");
			
			PaymentDto paymentDto = 
					paymentDao.selectOne(paymentDetailDto.getPaymentDetailOrigin());
			if(paymentDto==null)
				throw new TargetNotFoundException("존재하지 않는 결제정보");
			
			UserClaimVO claimVO = tokenService.check(tokenService.removeBearer(token));
			if(!paymentDto.getUserId().equals(claimVO.getUserId()));
				
				//취소요청
				int money = paymentDetailDto.getPaymentDetailPrice()*paymentDetailDto.getPaymentDetailQty();
				PayCancelRequestVO request = new PayCancelRequestVO();
				request.setTid(paymentDto.getPaymentTid());
				request.setCancelAmount(money);
				PayCancelResponseVO response = payService.cancel(request);
				//상태항목을 취소로 변경
				response.setItemName(paymentDetailDto.getPaymentDetailName());
				paymentDao.cancelItem(paymentDetailNo);
				//항목금액 차감
				paymentDao.decreaseItemRemain(paymentDto.getPaymentNo(), money);
				return response;
		}
		
		// 결제 상세 정보 업데이트
		@PutMapping("/detailUpdate/{paymentDetailNo}")
		public ResponseEntity<String> detailUpdate(
		        @RequestHeader("Authorization") String token,
		        @PathVariable int paymentDetailNo,
		        @RequestBody PaymentDetailDto paymentDetailDto) throws URISyntaxException {

		    // 회원 정보 확인
		    UserClaimVO claimVO = tokenService.check(tokenService.removeBearer(token));
		    
		    // 결제 상세 정보 조회
		    PaymentDetailDto existingDetail = paymentDao.selectDetailOne(paymentDetailNo);
		    if (existingDetail == null) {
		        throw new TargetNotFoundException("존재하지 않는 결제 상세정보");
		    }
		    // 결제 정보 조회
		    PaymentDto paymentDto = paymentDao.selectOne(existingDetail.getPaymentDetailOrigin());
		    if (paymentDto == null) {
		        throw new TargetNotFoundException("존재하지 않는 결제 정보");
		    }
		    // 소유자 확인
		    if (!paymentDto.getUserId().equals(claimVO.getUserId())) {
		        throw new TargetNotFoundException("결제 상세정보의 소유자가 아닙니다.");
		    }
		    // 업데이트 수행
		    paymentDao.updatePaymentDetail(paymentDetailDto);
		    
		    return ResponseEntity.ok("Payment detail updated successfully.");
		}
		
}
