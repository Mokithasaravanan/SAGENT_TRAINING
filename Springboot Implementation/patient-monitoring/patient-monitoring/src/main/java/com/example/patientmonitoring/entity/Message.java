//package com.example.patientmonitoring.entity;
//
//import jakarta.persistence.*;
//import lombok.Data;
//import java.time.LocalTime;
//
//@Entity
//@Data
//public class Message {
//
//    @Id
//    @GeneratedValue(strategy = GenerationType.IDENTITY)
//    private int messageId;
//
//    private String sender;
//    private String message;
//    private LocalTime time;
//
//    @ManyToOne
//    @JoinColumn(name = "consult_id")
//    private Consultation consultation;
//}


package com.example.patientmonitoring.entity;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Entity
@Data
public class Message {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int messageId;

    private int senderId;
    private int receiverId;
    private String senderType;
    private String subject;
    private String messageContent;
    private LocalDateTime messageDate;
//    private boolean isRead;

    @JsonProperty("isRead")
    @Column(name = "is_read")
    private boolean isRead;

    private String priority;

    @ManyToOne
    @JoinColumn(name = "consult_id")
    private Consultation consultation;
}
