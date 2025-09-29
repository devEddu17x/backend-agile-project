# Setting Up Databases in AWS RDS for the Application and SuperTokens

This guide assumes that you already have an AWS RDS PostgreSQL instance running and that you are connected to the instance using the administrative database (usually `postgres`). The setup will use a single database with two separate schemas: one for the application and one for SuperTokens.

Follow these steps to configure the schemas:

1. **Create Development Database**

   ```sql
   CREATE DATABASE dumi_development;
   ```

2. **Connect to Database**

   ```
   \c dumi_development
   ```

   If your are using Dbeaver or a similar client just create a new connection a change database name to **dumi_development**

3. **Create Schemas**

   ```sql
    CREATE SCHEMA supertokens;
    CREATE SCHEMA dumi_app;
   ```

4. **Create Users**

   ```sql
    CREATE USER supertokens_user WITH PASSWORD 'secure_password';
    CREATE USER dumi_app_user WITH PASSWORD 'secure_password';
   ```

5. **Grant Privileges**

   ```sql
   GRANT ALL PRIVILEGES ON SCHEMA supertokens TO supertokens_user;
   GRANT ALL PRIVILEGES ON SCHEMA dumi_app TO dumi_app_user;
   ```

6. **Set SearchPath**

   ```sql
    ALTER ROLE supertokens_user SET search_path = supertokens;
    ALTER ROLE dumi_app_user SET search_path = dumi_app;
   ```
