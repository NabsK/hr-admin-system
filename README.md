# HR Administration System

This project is a Human Resources Administration System built with the T3 stack.

## Getting Started

Follow these steps to set up the project locally:

1. **Clone the repository**

   ```bash
   git clone https://github.com/NabsK/hr-admin-system.git
   ```

   Alternatively, download the ZIP file and extract the project.

2. **Open the project**
   Open the folder in your preferred IDE (e.g., Visual Studio Code).

3. **Set up environment variables**

   - Rename the `.env.example` file to `.env`.
   - Remove the DISCORD_CLIENT_ID and DISCORD_CLIENT_SECRET provider from the `.env` file.
   - Edit the following line in your `.env` file:
     ```
     NEXTAUTH_SECRET="vN/xpeBVrbCZOilgkwyntHU574p3EEHvVOih3geqMSg="
     ```
   - Please make sure your file includes these:

   ```
   DATABASE_URL="file:./db.sqlite"
   NEXTAUTH_URL="http://localhost:3000"
   ```

4. **Install dependencies**
   Open a terminal in your project directory and run:

   ```bash
   npm install
   ```

5. **Run database migrations**

   ```bash
   npx prisma migrate dev
   ```

   Ensure that all migrations have been applied successfully.

6. **Start the development server**

   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000) in your browser to view the application.

7. **Optional: Open Prisma Studio**
   To view and edit the database using a visual editor, open an additional terminal and run:
   ```bash
   npx prisma studio
   ```
   This will launch Prisma Studio at [http://localhost:5555](http://localhost:5555).
