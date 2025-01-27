package com.example.demo.config.auth;

import com.example.demo.domain.dto.UserDto;
import com.example.demo.domain.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import com.example.demo.domain.entity.User;


import lombok.extern.slf4j.Slf4j;

import java.util.Optional;

@Service
@Slf4j
public class PrincipalDetailsServiceImpl implements UserDetailsService{

	@Autowired
	private UserRepository userRepository;
	
	@Override
	public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {

		Optional<User> userOptional =userRepository.findById(username);
		if(userOptional.isEmpty())
			throw new UsernameNotFoundException(username);

		User user = userOptional.get();

		//entity -> dto
		UserDto userDto = UserDto.builder()
                .username(user.getUsername())
                .password(user.getPassword())
				.role(user.getRole())
                .build();

		return new PrincipalDetails(userDto);
	}

}
