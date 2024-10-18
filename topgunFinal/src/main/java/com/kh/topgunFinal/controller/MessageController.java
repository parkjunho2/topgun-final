package com.kh.topgunFinal.controller;

import java.sql.Timestamp;
import java.time.LocalDateTime;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.Message;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.stereotype.Controller;

import com.kh.topgunFinal.dao.MessageDao;
import com.kh.topgunFinal.dao.RoomDao;
import com.kh.topgunFinal.dto.MessageDto;
import com.kh.topgunFinal.service.TokenService;
import com.kh.topgunFinal.vo.MessageRequestVO;
import com.kh.topgunFinal.vo.MessageResponseVO;
import com.kh.topgunFinal.vo.UserClaimVO;

@Controller
public class MessageController {

	@Autowired
	private TokenService tokenService;
	@Autowired
	private SimpMessagingTemplate messagingTemplate;
	@Autowired
	private MessageDao messageDao;
	@Autowired
	private RoomDao roomDao;
	
	@MessageMapping("/room/{roomNo}")
	public void chat(@DestinationVariable int roomNo, Message<MessageRequestVO> message) {
		//토큰 
		StompHeaderAccessor accessor = StompHeaderAccessor.wrap(message);
		String accessToken = accessor.getFirstNativeHeader("accessToken");
		if(accessToken == null) return;
		
		UserClaimVO claimVO = tokenService.check(tokenService.removeBearer(accessToken));
		
		MessageRequestVO request = message.getPayload();
		
		//메세지 발송
		MessageResponseVO response = new MessageResponseVO();
		response.setSenderUsersId(claimVO.getUserId());
		response.setSenderUsersType(claimVO.getUserType());
		response.setTime(LocalDateTime.now());
		response.setContent(request.getContent());
		messagingTemplate.convertAndSend("/private/chate/"+roomNo, response);
		
		//DB 저장
		int messageNo = messageDao.sequence();
		MessageDto messageDto = new MessageDto();
		messageDto.setMessageNo(messageNo);
		messageDto.setMessageSender(claimVO.getUserId());
		messageDto.setMessageReceiver(null);
		messageDto.setMessageContent(request.getContent());
		messageDto.setMessageType("chat");
		messageDto.setMessageTime(Timestamp.valueOf(response.getTime()));
		messageDto.setRoomNo(roomNo);
		messageDao.insert(messageDto);
	}
	
}
