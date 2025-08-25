<div align="center">

  <h1 style="font-size: 3em; margin-bottom: 0;">
    <font color="#3f51b5" style="font-weight: bold;">Car Marketplace</font>
  </h1>

  <h3 style="font-weight: normal; margin-top: 0;">A Modern Vehicle Trading Platform</h3>

  A full-stack web application connecting vehicle buyers and sellers, built with ASP.NET Core and Angular.

  <p>
    <img alt="Backend" src="https://img.shields.io/badge/Backend-.NET%20Core-blueviolet.svg?style=for-the-badge&logo=dotnet"/>
    <img alt="Frontend" src="https://img.shields.io/badge/Frontend-Angular-DD0031.svg?style=for-the-badge&logo=angular"/>
    <img alt="Database" src="https://img.shields.io/badge/Database-SQL%20Server-D92A25.svg?style=for-the-badge&logo=microsoftsqlserver"/>
    <img alt="Real-Time" src="https://img.shields.io/badge/Real--Time-SignalR-0078D4.svg?style=for-the-badge&logo=microsoft"/>
  </p>

<a href="https://dev.azure.com/rs1-2024-25-carmarketplace/Car%20marketplace" target="_blank">Azure DevOps</a>
</div>

---

## About Car Marketplace

**Car Marketplace** is a comprehensive web platform developed as a university project to create a modern ecosystem for vehicle transactions. It bridges the gap between buyers and sellers with a feature-rich, responsive web application. The backend is built on a robust **ASP.NET Core** API, while the dynamic and interactive frontend is powered by **Angular**.

### Key Features

| Category              | Core Functionality                                                                                             |
| --------------------- | -------------------------------------------------------------------------------------------------------------- |
| **Listings & Search** | Create, manage, and browse detailed vehicle advertisements with a powerful, multi-criteria search and filter system. |
| **User Management**   | Secure registration and login with role-based access control for regular users and administrators.             |
| **Real-Time Chat**    | Instantly communicate with other users through a live messaging system built with **SignalR**.                 |
| **Administration**    | A dedicated admin panel for managing users, moderating listings, and overseeing platform activity.               |
| **User Experience**   | A fully responsive design optimized for all devices and multi-language support for broader accessibility.       |

---

## Tech Stack

| Category         | Technology / Tool                                     | Purpose                                                       |
| ---------------- | ----------------------------------------------------- | ------------------------------------------------------------- |
| **Backend**      | **ASP.NET Core**                                    | High-performance framework for building the REST API.         |
|                  | **C#**                                                | Primary language for all backend business logic.              |
|                  | **Entity Framework Core**                             | ORM for seamless database interaction and data modeling.      |
|                  | **SignalR**                                           | Enables real-time, bi-directional communication for the chat. |
|                  | **FluentValidation**                                  | Provides strongly-typed validation rules for data models.     |
| **Frontend**     | **Angular**                                           | A component-based framework for building the app. |
|                  | **TypeScript**                                        | Superset of JavaScript for building scalable applications.    |
|                  | **Angular Material**                                  | A library of high-quality UI components for a polished look.  |
|                  | **RxJS**                                              | Manages asynchronous operations and event handling.           |
| **Database**     | **SQL Server**                                        | Relational database for storing all application data.         |
| **DevOps**    | **Azure DevOps**                                      | For project management.  |

---

## Prerequisites

Before you begin, ensure you have the following software installed and configured on your system.

| Tool                                                                                          | Purpose                                               |
| --------------------------------------------------------------------------------------------- | ----------------------------------------------------- |
| 🌐 **[.NET 8.0 SDK](https://dotnet.microsoft.com/en-us/download/dotnet/8.0)**                    | To build and run the ASP.NET Core backend.            |
| 📦 **[Node.js & npm](https://nodejs.org/en/)**                                                  | For managing frontend dependencies and running Angular. |
| 🛢️ **[SQL Server](https://www.microsoft.com/en-us/sql-server/sql-server-downloads)**             | The relational database for storing all application data. |
| 💻 **[An IDE](https://visualstudio.microsoft.com/vs/)**                                         | Visual Studio (for backend) & WebStorm/VS Code (for frontend) are recommended. |

---

## Getting Started

Follow these steps to get the entire platform up and running on your local machine.

### 1. Clone the Repository

First, clone the project from GitHub.

```bash
git clone https://github.com/TAR33k/car-marketplace.git
```

### 2. Backend Setup

1.  **Open the Solution:** Launch the `.sln` file in Visual Studio.
2.  **Configure Database Connection:** Open `appsettings.json` and ensure the `DefaultConnection` string points to your local SQL Server instance.
3.  **Apply Migrations:** Open the **Package Manager Console** (`View` -> `Other Windows` -> `Package Manager Console`) and run the following command to create the database schema:
    ```powershell
    update-database
    ```
4.  **Run the API:** Press `F5` or the start button in Visual Studio to launch the backend.

> **Note:** The project includes a `DataSeedGenerateEndpoint`. Once the API is running, you can execute this endpoint to populate the database with initial sample data for testing.

### 3. Frontend Setup

1.  **Navigate to the Client Directory:** Open a new terminal and navigate to the Angular project folder.
    ```bash
    cd frontend/RS1_2024_25_angular_template
    ```
2.  **Install Dependencies:** Install all the required Node.js packages.
    ```bash
    npm install
    ```
3.  **Run the Application:** Start the Angular development server.
    ```bash
    ng serve
    ```
4.  **View the App:** Open your browser and navigate to **`http://localhost:4200`**. The application should now be running and connected to your local backend.

---

## Screenshots

<details>
<summary><b>Click to expand Public-Facing Pages</b></summary>
<br>
  
![Home Page](https://github.com/user-attachments/assets/6a630940-a800-412f-81f9-70ffebb2c773)
![Home Page 2](https://github.com/user-attachments/assets/1bd85d56-0af7-4df1-bf92-5c7acc3dd242)
![Vehicle Listings](https://github.com/user-attachments/assets/e389dd01-2b64-46f7-bff5-925790c10da8)
![Vehicle Listings 2](https://github.com/user-attachments/assets/18a72c8b-c710-4112-95e3-8a609ac190cc)
![Vehicle Details](https://github.com/user-attachments/assets/c9bf1365-6a93-40a8-9864-51d3da170f86)
![Vehicle Details 2](https://github.com/user-attachments/assets/333c7fc6-c449-4d07-ad86-8538445dd822)
![Vehicle Details 3](https://github.com/user-attachments/assets/33f835b7-0bb9-45b8-ac10-b42ac9ff5097)
![Profile](https://github.com/user-attachments/assets/a8b978e1-f377-427f-9e3d-cdc9107f5f97)
![Chat](https://github.com/user-attachments/assets/96f50351-77b1-428c-8496-fab631c0d064)

</details>

<details>
<summary><b>Click to expand Admin Dashboard</b></summary>
<br>
  
![Admin Dashboard](https://github.com/user-attachments/assets/58327e13-6bf7-4fb7-8b1e-b57132803548)
![Admin Dashboard 2](https://github.com/user-attachments/assets/d38387d3-fd31-4bd4-9543-7ea0fcda7b72)

</details>

---

## Project Information

-   **Documentation:** Detailed system documentation, including **Use Case Diagrams**, **Domain Models**, and **Class Diagrams**, is available within the `/documents` directory of this repository.

-   **Future Enhancements:**
    -   Payment integration for featured listings.
    -   Advanced analytics dashboard for sellers.
    -   AI-powered price estimation tool.

### About This Project

This project was developed as part of the coursework for the **Faculty of Information Technologies, "Džemal Bijedić" University of Mostar**.

**Built by:**
*   Tarik Kukuljac (IB220202)
*   Aida Ušanović (IB220012)
