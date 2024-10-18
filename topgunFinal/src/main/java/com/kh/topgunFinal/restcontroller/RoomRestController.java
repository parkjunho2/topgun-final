package com.kh.topgunFinal.restcontroller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.kh.topgunFinal.dao.RoomDao;
import com.kh.topgunFinal.dto.RoomDto;
import com.kh.topgunFinal.dto.RoomMemberDto;
import com.kh.topgunFinal.error.TargetNotFoundException;
import com.kh.topgunFinal.service.TokenService;
import com.kh.topgunFinal.vo.RoomVO;
import com.kh.topgunFinal.vo.UserClaimVO;

@CrossOrigin(origins = {"http://localhost:3000"})
@RestController
@RequestMapping("/room")
public class RoomRestController {
	@Autowired
	private RoomDao roomDao;
	@Autowired
	private TokenService tokenService;
	
	//채팅방 등록
	@PostMapping("/")
	public RoomDto insert(@RequestBody RoomDto roomDto) {
		int roomNo = roomDao.sequence();
		roomDto.setRoomNo(roomNo);
		roomDao.insert(roomDto);
		return roomDao.selectOne(roomNo);
	}
	
	//채팅방 목록
	@GetMapping("/")
	public List<RoomVO> list(@RequestHeader("Authorization") String token){
		UserClaimVO claimVO = tokenService.check(tokenService.removeBearer(token));
		return roomDao.selectList(claimVO.getUserId());
	}
	
	//채팅방 입장
	@PostMapping("/enter")
	public void enter(@RequestBody RoomMemberDto roomMemberDto, 
								@RequestHeader("Authorization") String token) {
		//방이 없는 경우 사전 차단
		RoomDto roomDto = roomDao.selectOne(roomMemberDto.getRoomNo());
		if(roomDto == null) throw new TargetNotFoundException("존재하지 않는 채팅방");
		
		UserClaimVO claimVO = tokenService.check(tokenService.removeBearer(token));
		roomMemberDto.setUsersId(claimVO.getUserId());
		roomDao.enter(roomMemberDto);
	}
	
	//채팅방 퇴장
	@PostMapping("/leave")
	public void leave(@RequestBody RoomMemberDto roomMemberDto, 
								@RequestHeader("Authorization") String token) {
		//방이 없는 경우 사전 차단
		RoomDto roomDto = roomDao.selectOne(roomMemberDto.getRoomNo());
		if(roomDto == null) throw new TargetNotFoundException("존재하지 않는 채팅방");
		
		UserClaimVO claimVO = tokenService.check(tokenService.removeBearer(token));
		roomMemberDto.setUsersId(claimVO.getUserId());
		roomDao.leave(roomMemberDto);
	}
	
	//자격검사
	@GetMapping("/check/{roomNo}")
	public boolean check(@PathVariable int roomNo, @RequestHeader("Authorization") String token) {
		UserClaimVO claimVO = tokenService.check(tokenService.removeBearer(token));
		
		//DB 검사
		RoomMemberDto roomMemberDto = new RoomMemberDto();
		roomMemberDto.setUsersId(claimVO.getUserId());
		roomMemberDto.setRoomNo(roomNo);
		boolean canEnter = roomDao.check(roomMemberDto);
		
		return canEnter;
	}
}
