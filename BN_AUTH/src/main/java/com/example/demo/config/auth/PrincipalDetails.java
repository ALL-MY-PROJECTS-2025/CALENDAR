package com.example.demo.config.auth;

import java.security.Principal;
import java.util.ArrayList;
import java.util.Collection;
import java.util.Map;

import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import com.example.demo.domain.dto.UserDto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.security.oauth2.core.user.OAuth2User;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PrincipalDetails implements UserDetails, OAuth2User {

	private UserDto userDto;

	public PrincipalDetails(UserDto userDto){
		this.userDto = userDto;
	}
	//-------------------------------------------
	//OAuth2User Function
	//-------------------------------------------
	private Map<String,Object> attributes;
	private String accessToken;
	@Override
	public Map<String, Object> getAttributes() {
		return attributes;
	}
	@Override
	public String getName() {
		return userDto.getUsername();
	}
	//-------------------------------------------

	@Override
	public Collection<? extends GrantedAuthority> getAuthorities() {
		Collection<GrantedAuthority> authorities = new ArrayList();
		authorities.add(new SimpleGrantedAuthority(userDto.getRole()));
		return authorities;
	}

	@Override
	public String getPassword() {
		return userDto.getPassword();
	}

	@Override
	public String getUsername() {
		return userDto.getUsername();
	}

	@Override
	public boolean isAccountNonExpired() {
		// TODO Auto-generated method stub
		return true;
	}

	@Override
	public boolean isAccountNonLocked() {
		// TODO Auto-generated method stub
		return true;
	}

	@Override
	public boolean isCredentialsNonExpired() {
		// TODO Auto-generated method stub
		return true;
	}

	@Override
	public boolean isEnabled() {
		// TODO Auto-generated method stub
		return true;
	}



}
