package com.kh.topgunFinal.restController;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.kh.topgunFinal.dao.FlightDao;
import com.kh.topgunFinal.dto.FlightDto;

@CrossOrigin(origins = "http://localhost:3000") // 컨트롤러에서 설정
@RestController
@RequestMapping("/fligt")
public class FligthRestController {

	@Autowired
	private FlightDao flightDao;
	
	@PostMapping("/")
	public void insert(@RequestBody FlightDto flightDto) {
		flightDao.insert(flightDto);
	}
}
