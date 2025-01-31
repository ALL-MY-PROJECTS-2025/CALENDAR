package com.example.demo.domain.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class UserDto {
	private String username;
	private String password;
	private String role;

	//OAUTH2 CLIENT
	private String provider;
	private String providerId;
}
