package com.kh.topgunFinal.dao;

import org.apache.ibatis.session.SqlSession;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Repository;

import com.kh.topgunFinal.dto.PaymentDetailDto;
import com.kh.topgunFinal.dto.PaymentDto;

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
}
