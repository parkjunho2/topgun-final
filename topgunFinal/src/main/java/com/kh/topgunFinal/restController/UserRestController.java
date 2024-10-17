package com.kh.topgunFinal.restController;

import org.springframework.web.bind.annotation.RestController;
import com.kh.topgunFinal.dao.UserDao;
import com.kh.topgunFinal.dao.UserTokenDao;
import com.kh.topgunFinal.dto.UserDto;
import com.kh.topgunFinal.dto.UserTokenDto;
import com.kh.topgunFinal.error.TargetNotFoundException;
import com.kh.topgunFinal.service.TokenService;
import com.kh.topgunFinal.vo.JoinRequestVO;
import com.kh.topgunFinal.vo.UserClaimVO;
import com.kh.topgunFinal.vo.UserLoginRequestVO;
import com.kh.topgunFinal.vo.UserLoginResponseVO;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;

@CrossOrigin(origins = "http://localhost:3000") // 컨트롤러에서 설정
@RestController
@RequestMapping("/users")
public class UserRestController {

	@Autowired
	private UserDao userDao;

	@Autowired
	private UserTokenDao userTokenDao;

	@Autowired
	private TokenService tokenService;

	@Autowired
	private PasswordEncoder encoder;

	@PostMapping("/login")
	public UserLoginResponseVO login(@RequestBody UserLoginRequestVO requestVo) {
		System.out.println(requestVo);

		// 회원조회
		UserDto userDto = userDao.selectOne(requestVo.getUsersId());
		if (userDto == null) {// 아이디 없음
			throw new TargetNotFoundException("아이디 없음");
		}

		boolean isValid = encoder.matches(requestVo.getUsersPw(), userDto.getUsersPassword());// 암호화O

		if (isValid) {
			UserLoginResponseVO response = new UserLoginResponseVO();
			response.setUsersId(userDto.getUsersId());
			response.setUsersType(userDto.getUsersType());
			UserClaimVO claimVO = new UserClaimVO();
			claimVO.setUserId(userDto.getUsersId());
			claimVO.setUserType(userDto.getUsersType());
			response.setAccessToken(tokenService.createAccessToken(claimVO));// 액세스토큰
			response.setRefreshToken(tokenService.createRefreshToken(claimVO));// 리프레시토큰
			return response;
		} else {// 로그인 실패
			throw new TargetNotFoundException("비밀번호 불일치");
		}
	}

	@PostMapping("/refresh")
	public UserLoginResponseVO refresh(@RequestHeader("Authorization") String refreshToken) {
		System.out.println("refresh = " + refreshToken);
		// [1] refreshToken이 없거나 Bearer로 시작하지 않으면 안됨
		if (refreshToken == null)
			throw new TargetNotFoundException("토큰 없음");
		if (tokenService.isBearerToken(refreshToken) == false)
			throw new TargetNotFoundException("Bearer 토큰 아님");

		// [2] 토큰에서 정보를 추출
		UserClaimVO claimVO = tokenService.check(tokenService.removeBearer(refreshToken));
		if (claimVO.getUserId() == null)
			throw new TargetNotFoundException("아이디 없음");
		if (claimVO.getUserType() == null)
			throw new TargetNotFoundException("등급 없음");

		// [3] 토큰 발급 내역을 조회
		UserTokenDto userTokenDto = new UserTokenDto();
		userTokenDto.setTokenTarget(claimVO.getUserId());
		userTokenDto.setTokenValue(tokenService.removeBearer(refreshToken));
		UserTokenDto resultDto = userTokenDao.selectOne(userTokenDto);
		System.out.println("resultDto ============" + resultDto);
		if (resultDto == null)// 발급내역이 없음
			throw new TargetNotFoundException("발급 내역이 없음");

		// [4] 기존의 리프시 토큰 삭제
		userTokenDao.delete(resultDto);

		// [5] 로그인 정보 재발급
		UserLoginResponseVO response = new UserLoginResponseVO();
		response.setUsersId(claimVO.getUserId());
		response.setUsersType(claimVO.getUserType());
		response.setAccessToken(tokenService.createAccessToken(claimVO));// 재발급
		response.setRefreshToken(tokenService.createRefreshToken(claimVO));// 재발급
		return response;
	}

	// 회원 본인의 정보를 반환하는 기능
	// - 아이디를 변경할 수 없도록 Authorization 헤더에서 정보를 읽어 조회한 뒤 반환
	@GetMapping("/find")
	public UserDto find(@RequestHeader("Authorization") String accessToken) {
		if (tokenService.isBearerToken(accessToken) == false)
			throw new TargetNotFoundException("유효하지 않은 토큰");
		UserClaimVO claimVO = tokenService.check(tokenService.removeBearer(accessToken));

		UserDto userDto = userDao.selectOne(claimVO.getUserId());
		if (userDto == null)
			throw new TargetNotFoundException("존재하지 않는 회원");

		userDto.setUsersPassword(null);// 비밀번호 제거

		return userDto;
	}

	// 회원 등록 기능
	@PostMapping("/join")
	@Transactional
	public void join(@RequestBody JoinRequestVO vo) {
		System.out.println("vo = " + vo);

		// 기본 회원 정보 저장 객체 생성
		UserDto userDto = new UserDto();

		// 상세 회원 정보 저장 객체 생성

		// 항공사 회원 정보 저장 객체 생성

		if (vo.getUsersType().equals("MEMBER")) {
			// MEMBER 유형에 대한 처리
			userDto.setUsersId(vo.getUsersId());
			userDto.setUsersPassword(vo.getUsersPassword());
			userDto.setUsersName(vo.getUsersName());
			userDto.setUsersType(vo.getUsersType());
			userDto.setUsersEmail(vo.getUsersEmail());
			userDto.setUsersContact(vo.getUsersContact());

			System.out.println(userDto);

			System.out.println("하이~");
			System.out.println(userDto);

			userDao.insert(userDto);
		} else if (vo.getUsersType().equals("AIRLINE")) {
			// AIRLINE 유형에 대한 처리
			userDto.setUsersId(vo.getUsersId());
			userDto.setUsersPassword(vo.getUsersPassword());
			userDto.setUsersName(vo.getUsersName());
			userDto.setUsersType(vo.getUsersType());
			userDto.setUsersEmail(vo.getUsersEmail());
			userDto.setUsersContact(vo.getUsersContact());

			System.out.println("빠이~");

		} else {
			return; // 사용자의 유형이 null일 경우 반환
		}

	}

}
