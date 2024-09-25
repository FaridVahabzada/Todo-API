![Brand Logo](/public/images/api.jpg) 
 
# Application Name: **Todo API**
## Purpose: **To enable logged-in users of the API to login, sign up & create/update/delete todos with their associated categories.**
### Author: **Farid Vahabzada**

---

&nbsp;

# Application Installation and Usage Instructions
Not any special installation processes are required other than downloading the whole repository locally, and starting the web app with the **npm start**. In this CA, we decided to go with**out** a **.gitignore** file creation. More details can be found below under the appropriate section name.

# Environment Variables
Information on the environment variables needed:
```
HOST = "localhost"
ADMIN_USERNAME = "admin"
ADMIN_PASSWORD = "P@ssw0rd"
DATABASE_NAME = "myTodo"
DIALECT = "mysql"
PORT = "3000"
TOKEN_SECRET = "d3fe9f2507dc0dd7bed2d2a1f71e235e90b47b2765c05e09c64c6876206a4ee7a580760556c8d413696d8ab726f22a9654fe6ecf994414c8fa25c3a20ff015e9"
```

# Additional Libraries/Packages
The technologies / external libraries used are given below:\
\
![Packages](/public/images/packages.png)

# NodeJS Version Used
Node version was accessed by the **node -v** command and it is shown below:\
\
![Node Version](/public/images/node.png)

# POSTMAN Documentation link
No POSTMAN Documentation link will be supplied as it was not a requirement in the REST API CA instruction requirements.

# DATABASE
The sql script responsible for creating the database:
```sql
DROP DATABASE myTodo;
CREATE DATABASE myTodo;
USE myTodo;
```

# DATABASEACCESS
The sql script responsible for creating the new user login and password with the admin rights and permissions:
```sql
CREATE USER 'admin'@'localhost'
IDENTIFIED WITH mysql_native_password
BY 'P@ssw0rd';

GRANT ALL PRIVILEGES
ON myTodo.*
TO 'admin'@'localhost';
```

# Further recommendations and future plans

Remarks for the users or the issues to be fixed for the future app versions, as they do **NOT** cause any functionality problems, are: 
+ With tests running, **signing up** was taking too much time for the rest of the tests to catch up. Therefore, one **optional line** of code for acquiring the newly signed-up user's info was added and commented out.
+ Getting **user id** in the **router** files in this version is a repetetive process. It would be better if this could be reduced down to a middleware function. However, attempts resulted in "**un**defined **headers**".





