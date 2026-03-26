import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder; 
String p = new String(new char[]{'g','i','t','h','a','1','2','3'}); 
System.out.println(new BCryptPasswordEncoder().encode(p)); 
/exit
