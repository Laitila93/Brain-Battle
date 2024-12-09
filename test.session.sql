--@block
CREATE TABLE Users(
    id INT PRIMARY KEY AUTO_INCREMENT UNIQUE,
    email VARCHAR(255) NOT NULL ,
    bio text,
    country VARCHAR(2)
);
--@block
INSERT INTO Users (email, bio, country)
VALUES (
    'hello@world.com', 
    'i love stragers!', 
    'US'
);
--@block
INSERT into Users (email, bio, country)
values (
    'drbu@gmail.com',
    'i dont like stragers!',
    'se'

);
--@block
SELECT * FROM Users
WHERE country = 'se'
AND email LIKE 'dr%'
;

--@block
CREATE TABLE Rooms (
    id INT AUTO_INCREMENT,
    street VARCHAR(255),
    owner_id INT NOT NULL,
    PRIMARY KEY (id),
    FOREIGN KEY (owner_id) REFERENCES Users(id)
);
--@block
 INSERT INTO Rooms (owner_id,street)
 Values 
    (1,'loftbodvägen 1'),
      (1,'loftbodvägen 2'),
        (1,'loftbodvägen 3');
--@block
SELECT * FROM users
LEFT JOIN Rooms
ON Rooms.owner_id = Users.id;

--@block
CREATE TABLE Bookings (
    id INT AUTO_INCREMENT,
    guest_id INT NOT NULL,
    room_id INT NOT NULL,
    check_in DATETIME,
    PRIMARY KEY (id),
    FOREIGN KEY (guest_id) REFERENCES Users(id),
    FOREIGN KEY (room_id) REFERENCES Rooms(id)
);
--@block Rooms a user has booked
SELECT
    guest_id,
    street,
    check_in
FROM bookings
INNER JOIN Rooms ON Rooms.owner_id = guest_id
