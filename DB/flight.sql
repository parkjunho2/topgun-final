DROP TABLE flight;

CREATE TABLE Flight (
    flight_id NUMBER NOT NULL PRIMARY KEY,
    flight_number VARCHAR2(255) NOT NULL,
    departure_time Timestamp NOT NULL,
    arrival_time Timestamp NOT NULL,
    flight_time VARCHAR2(255) NOT NULL,
    departure_airport VARCHAR2(255) NOT NULL,
    arrival_airport VARCHAR2(255) NOT NULL,
    user_id VARCHAR2(255) NOT NULL,
    flight_price NUMBER NOT NULL,
    flight_status CHAR(6) DEFAULT '대기'
);



drop sequence flight_seq;
create sequence flight_seq;
