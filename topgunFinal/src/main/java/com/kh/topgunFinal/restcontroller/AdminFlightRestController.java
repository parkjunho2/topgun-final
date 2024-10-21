package com.kh.topgunFinal.restcontroller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.kh.topgunFinal.dao.AdminFlightDao;
import com.kh.topgunFinal.dao.FlightDao;
import com.kh.topgunFinal.dto.FlightDto;

@CrossOrigin(origins = {"http://localhost:3000"})
@RestController
@RequestMapping("/admin")
public class AdminFlightRestController {

	@Autowired
	private AdminFlightDao adminFlightDao;
	
	@GetMapping("/")
	public List<FlightDto> list() {
		return adminFlightDao.selectList();
	}
	
	
	@GetMapping("/{flightId}")
	public FlightDto detail(@PathVariable int flightId) {
		return adminFlightDao.selectOne(flightId);
	}
	
	
	@PutMapping("/update")
	public void update(@RequestBody FlightDto flightDto) {
		adminFlightDao.update(flightDto);
	}
}
