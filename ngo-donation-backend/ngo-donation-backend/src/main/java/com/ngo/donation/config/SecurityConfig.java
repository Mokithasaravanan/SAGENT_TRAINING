package com.ngo.donation.config;

import com.ngo.donation.security.JwtAuthFilter;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;

/**
 * Spring Security configuration with JWT and role-based access control.
 * Handles all endpoint permissions for NGO Hub backend.
 */
@Configuration
@EnableWebSecurity
@EnableMethodSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtAuthFilter jwtAuthFilter;
    private final UserDetailsService userDetailsService;

    // ── CORS Configuration ─────────────────────────────────────────────────────
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration config = new CorsConfiguration();
        config.setAllowedOrigins(List.of("http://localhost:3000"));
        config.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        config.setAllowedHeaders(List.of("*"));
        config.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        return source;
    }

    // ── Security Filter Chain ──────────────────────────────────────────────────
    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http)
            throws Exception {
        http
                // Enable CORS using the bean above
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))

                // Disable CSRF (using JWT, no session)
                .csrf(csrf -> csrf.disable())

                // Stateless session
                .sessionManagement(session ->
                        session.sessionCreationPolicy(
                                SessionCreationPolicy.STATELESS))

                .authorizeHttpRequests(auth -> auth

                        // ════════════════════════════════════════════════════
                        // PUBLIC — No token needed
                        // ════════════════════════════════════════════════════
                        .requestMatchers("/api/auth/**")
                        .permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/ngos/**")
                        .permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/campaigns/**")
                        .permitAll()

                        // ════════════════════════════════════════════════════
                        // NGO — Admin can create, public can read
                        // ════════════════════════════════════════════════════
                        .requestMatchers(HttpMethod.POST, "/api/ngos/**")
                        .hasRole("ADMIN")
                        .requestMatchers(HttpMethod.PUT, "/api/ngos/**")
                        .hasRole("ADMIN")
                        .requestMatchers(HttpMethod.DELETE, "/api/ngos/**")
                        .hasRole("ADMIN")

                        // ════════════════════════════════════════════════════
                        // CAMPAIGNS — Admin can create/update, public can read
                        // ════════════════════════════════════════════════════
                        .requestMatchers(HttpMethod.POST, "/api/campaigns/**")
                        .hasAnyRole("ADMIN", "DONOR")
                        .requestMatchers(HttpMethod.PUT, "/api/campaigns/**")
                        .hasRole("ADMIN")
                        .requestMatchers(HttpMethod.DELETE, "/api/campaigns/**")
                        .hasRole("ADMIN")

                        // ════════════════════════════════════════════════════
                        // DONATIONS — Donor and Admin
                        // ════════════════════════════════════════════════════
                        .requestMatchers("/api/donations/**")
                        .hasAnyRole("DONOR", "ADMIN")

                        // ════════════════════════════════════════════════════
                        // PICKUPS — Donor and Admin
                        // ════════════════════════════════════════════════════
                        .requestMatchers("/api/pickups/**")
                        .hasAnyRole("DONOR", "ADMIN")

                        // ════════════════════════════════════════════════════
                        // VOLUNTEER TASKS — Volunteer and Admin
                        // ════════════════════════════════════════════════════
                        .requestMatchers("/api/tasks/**")
                        .hasAnyRole("VOLUNTEER", "ADMIN")

                        // ════════════════════════════════════════════════════
                        // MESSAGES — Admin sends, all roles receive
                        // ════════════════════════════════════════════════════
                        .requestMatchers(
                                HttpMethod.POST,
                                "/api/messages/send")
                        .hasRole("ADMIN")
                        .requestMatchers(
                                HttpMethod.POST,
                                "/api/messages/broadcast")
                        .hasRole("ADMIN")
                        .requestMatchers(
                                HttpMethod.GET,
                                "/api/messages/sent/**")
                        .hasRole("ADMIN")
                        .requestMatchers(
                                HttpMethod.GET,
                                "/api/messages/inbox/**")
                        .hasAnyRole("DONOR", "VOLUNTEER", "ADMIN")
                        .requestMatchers(
                                HttpMethod.PUT,
                                "/api/messages/read/**")
                        .hasAnyRole("DONOR", "VOLUNTEER", "ADMIN")
                        .requestMatchers(
                                HttpMethod.POST,
                                "/api/messages/verify-otp")
                        .hasAnyRole("DONOR", "VOLUNTEER", "ADMIN")

                        // ════════════════════════════════════════════════════
                        // ADMIN DASHBOARD — Admin only
                        // ════════════════════════════════════════════════════
                        .requestMatchers("/api/admin/**")
                        .hasRole("ADMIN")

                        // ════════════════════════════════════════════════════
                        // Everything else — must be authenticated
                        // ════════════════════════════════════════════════════
                        .anyRequest().authenticated()
                )

                // Set auth provider
                .authenticationProvider(authenticationProvider())

                // Add JWT filter before username/password filter
                .addFilterBefore(
                        jwtAuthFilter,
                        UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public AuthenticationProvider authenticationProvider() {
        DaoAuthenticationProvider provider =
                new DaoAuthenticationProvider();
        provider.setUserDetailsService(userDetailsService);
        provider.setPasswordEncoder(passwordEncoder());
        return provider;
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public AuthenticationManager authenticationManager(
            AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }
}