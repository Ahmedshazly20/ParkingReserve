
### **📝 Smart Parking Management System**

This project is a modern, web-based intelligent parking management
system designed to streamline parking operations, enhance user
experience, and provide real-time monitoring and control for
administrators and employees. It is built with React, Redux, and React
Query, offering a dynamic and responsive user interface for managing
parking zones, gates, and user access.

------------------------------------------------------------------------

### **🚀 Getting Started**

To run the application, you'll need Node.js and npm installed on your
machine.

#### **Prerequisites**

-   Node.js (version 16 or higher)
-   npm (Comes with Node.js)

#### **Installation**

Navigate to the project's root directory in your terminal and install
the required dependencies:

``` bash
npm install
```

#### **Running the Application**

Start the development server:

``` bash
npm start
```

The application will be available at `http://localhost:3000` in your web
browser.

------------------------------------------------------------------------

### **🗺️ Application Routes**

The application uses `react-router-dom` to manage navigation and provide
a clear, logical user flow.

  ------------------------------------------------------------------------
  Route                    Description             Required Role
  ------------------------ ----------------------- -----------------------
  `/` or `/login`          **Login Page**          All Users

  `/admin`                 **Admin Dashboard** -   `admin`
                           Provides a high-level   
                           overview of the entire  
                           system.                 

  `/gates`                 **Gates Selection       `employee`
                           Screen** - Lists all    
                           gates for an employee   
                           to choose from.         

  `/gate/:gateId`          **Gate Control          `employee`
                           Screen** - Displays     
                           real-time data for a    
                           specific gate.          

  `/checkpoint`            **Checkout Screen** - A `employee`
                           dedicated screen for    
                           processing tickets.     

  `/admin/parking-state`   **Parking State         `admin`
                           Report** - Detailed     
                           report on all parking   
                           zones.                  

  `/admin/employees`       **Employee              `admin`
                           Management** - For      
                           managing user accounts  
                           and roles.              

  `/admin/control`         **Control Panel** -     `admin`
                           Advanced system         
                           configuration.          

  `*`                      **Not Found Page** -    N/A
                           Catch-all for undefined 
                           URLs.                   
  ------------------------------------------------------------------------

------------------------------------------------------------------------

### **✨ Features & Core Logic**

The system is designed with a focus on efficiency, security, and a
seamless user experience.

#### **1. Role-Based Access Control (RBAC)**

The application implements a robust **RBAC system**. It checks the
user's role on every page load to ensure they have the necessary
permissions. If a user tries to access a restricted page, they are
automatically redirected to the login screen.

#### **2. Smart & Dynamic Routing**

Upon successful login, the application intelligently redirects the user
based on their role:

-   **`admin`**: Redirects to the main `Admin Dashboard` (`/admin`).
-   **`employee`**: Redirects to the `Gates Selection Screen`
    (`/gates`), allowing them to choose their specific checkpoint to
    operate.

This prevents employees from accessing the administrative sections and
guides them directly to their assigned tasks.

#### **3. Real-Time Data Management**

-   **State Management**: **Redux** is used for managing global
    application state, such as authentication tokens and user
    information, ensuring data is accessible across the entire app.
-   **Data Fetching**: **React Query** handles all API calls, providing
    powerful caching, automatic refetching, and error handling. This
    significantly improves performance and responsiveness. The
    `useTicket` and `useSubscription` hooks, for example, automatically
    fetch data as needed, eliminating the need for manual data fetching
    within components.

#### **4. Employee Checkpoint Workflow**

The **Checkout Screen** (`/checkpoint`) provides a streamlined process
for employees:

-   **Ticket Scanning**: Employees can enter a ticket ID (simulating a
    QR scan). The app uses **React Query** to immediately fetch ticket
    details from the server.
-   **Dynamic UI**: Based on the fetched ticket data, the UI dynamically
    updates to show ticket details, duration, and subscription
    information if applicable.
-   **Checkout Processing**: The employee can process the checkout, and
    the system handles the API request to finalize the transaction,
    clear the UI, and prepare for the next ticket.

This workflow is designed to be fast and intuitive, reducing manual
errors and speeding up the checkout process.
