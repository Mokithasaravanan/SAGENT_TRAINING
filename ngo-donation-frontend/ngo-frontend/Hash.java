import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder; 
public class Hash { public static void main(String[] args) { String p = new String(new char[]{'g','i','t','h','a','1','2','3'}); System.out.println(new BCryptPasswordEncoder().encode(p)); } }
