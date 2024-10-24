package com.kh.topgunFinal.dao;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.apache.ibatis.session.SqlSession;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Repository;

import com.kh.topgunFinal.dto.PaymentDetailDto;
import com.kh.topgunFinal.dto.PaymentDto;
import com.kh.topgunFinal.vo.PaymentTotalVO;

@Repository
public class PaymentDao {
    @Autowired
    private SqlSession sqlSession;

    public int paymentSequence(){
        return sqlSession.selectOne("payment.paymentSequence");
    }
    public int paymentDetailSequence(){
        return sqlSession.selectOne("payment.paymentDetailSequence");
    }
    public void paymentInsert(PaymentDto paymentDto){
        sqlSession.insert("payment.paymentInsert", paymentDto);
    }
    public void paymentDetailInsert(PaymentDetailDto paymentDetailDto){
        sqlSession.insert("payment.paymentDetailInsert", paymentDetailDto);
    }
	public List<PaymentDto> selectList(String userId) {
		return sqlSession.selectList("payment.list", userId);
	}
	public PaymentDto selectOne(int paymentNo) {
		return sqlSession.selectOne("payment.find", paymentNo);
	}
	public List<PaymentDetailDto> selectDetailList(int paymentNo){
		return sqlSession.selectList("payment.findDetail", paymentNo);
	}
	public List<PaymentTotalVO> selectTotalList(String userId){
		return sqlSession.selectList("payment.findTotal", userId);
	}
	//전체취소
	public boolean cancelAll(int paymentNo) {
		return sqlSession.update("payment.cancelAll", paymentNo)>0;
	}
	public boolean cancelAllItem(int paymentNo) {
		return sqlSession.update("payment.cancelAllItem", paymentNo)>0;
	}
	//항목취소
	public boolean cancelItem(int paymentDetailNo) {
		return sqlSession.update("payment.cancelItem", paymentDetailNo)>0;
	}
	public boolean decreaseItemRemain(int paymentNo, int money) {
		Map<String, Integer> params = new HashMap<>();
		params.put("paymentNo", paymentNo);
		params.put("money", money);
		return sqlSession.update("payment.decreaseItemRemain", params)>0;
	}
	public PaymentDetailDto selectDetailOne(int paymentDetailNo) {
		return sqlSession.selectOne("payment.selectDetailOne", paymentDetailNo);
	}
	
	//정보 추가입력
	 public void updatePaymentDetail(PaymentDetailDto paymentDetail) {
	        sqlSession.update("payment.paymentDetailUpdate", paymentDetail);
	    }
	 
}
