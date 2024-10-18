package com.kh.topgunFinal.websocket;

import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;

@Configuration
@EnableWebSocketMessageBroker
public class WebsocketConfiguration implements WebSocketMessageBrokerConfigurer{
	@Override
    public void configureMessageBroker(MessageBrokerRegistry registry) {
		registry.enableSimpleBroker("/private");
		registry.setApplicationDestinationPrefixes("/app");
    }
	@Override
	public void registerStompEndpoints(StompEndpointRegistry registry) {
		registry.addEndpoint("/ws") //웹소켓 연결을 위한 주소 설정
				.setAllowedOriginPatterns("*") //웹소켓용 CORS 설정(=@CrossOrigin)
				.withSockJS(); //SockJS는 구형 브라우저에서도 작동하도록 웹소켓을 확장한 기술
	}
}