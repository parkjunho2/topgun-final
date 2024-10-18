package com.kh.topgunFinal.websocket;

import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.TreeSet;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.event.EventListener;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.stereotype.Service;
import org.springframework.web.socket.messaging.SessionConnectEvent;
import org.springframework.web.socket.messaging.SessionDisconnectEvent;

import com.kh.topgunFinal.dao.MessageDao;
import com.kh.topgunFinal.service.TokenService;
import com.kh.topgunFinal.vo.MessageMoreVO;
import com.kh.topgunFinal.vo.MessageVO;
import com.kh.topgunFinal.vo.UserClaimVO;

@Service
public class WebsocketEventHandler {
	@Autowired
	private TokenService tokenService;
	@Autowired
	private SimpMessagingTemplate messagingTemplate;
	@Autowired
	private MessageDao messageDao;
	
	private Map<String, String> userList = Collections.synchronizedMap(new HashMap<>());
	
	//사용자 입장
	@EventListener
	public void userEnter(SessionConnectEvent event) {
		StompHeaderAccessor accessor = StompHeaderAccessor.wrap(event.getMessage());
		String sessionId = accessor.getSessionId();
		String accessToken = accessor.getFirstNativeHeader("accessToken");
		if(accessToken == null) return;
		
		UserClaimVO claimVO = tokenService.check(tokenService.removeBearer(accessToken));
		
		userList.put(sessionId, claimVO.getUserId());
//		log.info("사용자 접속! 인원수 = {},  세션 = {} , 아이디 = {}", userList.size(), sessionId, claimVO.getUserId());
	}
	
	//채널 구독
	@EventListener
	public void userSubscribe(SessionConnectEvent event) {
		StompHeaderAccessor accessor = StompHeaderAccessor.wrap(event.getMessage());
		if(accessor.getDestination() == null) return;
		
		if(accessor.getDestination().startsWith("/private/chat")) {
			String removeStr = accessor.getDestination().substring("/private/chat".length());
			int slash = removeStr.indexOf("/");
			int roomNo = Integer.parseInt(removeStr.substring(0, slash));
			String usersId = removeStr.substring(slash + 1);
			
			List<MessageVO> messageList = messageDao.selectListMessage(usersId, 1, 100, roomNo);
			
			MessageMoreVO moreVO = new MessageMoreVO();
			moreVO.setMessageList(messageList);
			if(messageList.size() > 0) {
				List<MessageVO> prevMessageList = 
						messageDao.selectListMessage(usersId, 1, 100, roomNo, messageList.get(0).getNo());
			}
			messagingTemplate.convertAndSend("/private/chat/"+roomNo+"/"+usersId, moreVO);
		}
	}
	
	//사용자 퇴장
	@EventListener
	public void userLeave(SessionDisconnectEvent event) {
		StompHeaderAccessor accessor = StompHeaderAccessor.wrap(event.getMessage());
		String sessionId = accessor.getSessionId();
		
		userList.remove(sessionId);
		
		Set<String> values = new TreeSet<>(userList.values());
		messagingTemplate.convertAndSend("/private/chat", values);
	}
}
