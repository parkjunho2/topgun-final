package com.kh.topgunFinal.dto;

import java.sql.Date;

import lombok.Data;

@Data
public class PaymentDto {
    private int pyamentNo;
    private String paymentTid;
    private String paymentName;
    private int paymentTotal;
    private int paymentRemain;
    private String userId;
    private Date paymentTime;
    
}
