## 1 Frameworks used

- Express.js (NodeJS framework)

## 2 DB Schema:

- Database System: MySQL
- Database name: userdb
- Tables created in the database: usertable, datatable

- schema for usertable  
   <sub> _`CREATE TABLE usertable (
    id INT AUTO_INCREMENT PRIMARY KEY,   
  username VARCHAR(255) NOT NULL,  
  email VARCHAR(255) NOT NULL,  
  password VARCHAR(255) NOT NULL,  
  full_name VARCHAR(255) NOT NULL,  
  age INT NOT NULL,  
  gender VARCHAR(20) NOT NULL   
);`_</sub>

- schema for datatable  
   <sub> _`CREATE TABLE datatable (  
  id INT AUTO_INCREMENT PRIMARY KEY,  
  key VARCHAR(255) NOT NULL,  
  value VARCHAR(255) NOT NULL  
);`_</sub>

## 3 Instructions to run the code

- Clone the [repository](https://github.com/Avinash9694/backend-system) and install all dependencies using `npm i` command on your terminal or cmd prompt
- Open a terminal/command prompt and navigate to the navigate.
- Run `node app.js` command in the terminal or command prompt.
- The server will start running on the specified port, and you should see the message "Server Started on port `PORT`" in the console.

## 4 Instructions to Set Up the Code:

Before running the code, you need to set up the following:

### a. Install Node.js and npm (Node Package Manager) on your machine.

### b. MySQL Database:

- Install MySQL and MySQL workbench on your machine or set up a -remote MySQL server.
- Create a new database note down the database credentials (host, username, password, database name, and port).
- Create two tables (usertable and datatable) inside userdb. Refer to "Point 2 DB schema" for schema details.

### c. .env File

- Create a .env file inside routes folder.
- Add the following environment variables and set their values accordingly:  
  `DB_HOST=<your_database_host>`  
  `DB_USER=<your_database_username>`  
  `DB_PASSWORD=<your_database_password>`  
  `DB_DATABASE=<your_database_name>`  
  `DB_PORT=<your_database_port>`  
  `JWT_SECRET=<your_jwt_secret_key>`  
  `PORT=<your_server_port>`  
  Replace `<your_database_host>`, `<your_database_username>`, `<your_database_password>`, `<your_database_name>`, `<your_database_port>`, `<your_jwt_secret_key>`, and `<your_server_port>` with the appropriate values.

### d. Database Tables:

- Create the required database tables using the provided schema or modify them according to your needs.

### e. Run the Code:

Follow the "Instructions to Run the Code" section mentioned above to start the server.  
With these instructions, you should be able to run and set up the code successfully. Make sure to test the APIs using Postman or any API testing tool after the setup is complete.
