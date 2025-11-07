# 🚖 Ride Management System – Frontend (React + Redux Toolkit + RTK Query)

A **production-grade**, **responsive**, and **role-based ride booking platform frontend** built with **React**, **Redux Toolkit**, and **RTK Query**.  
This project replicates modern ride-hailing systems like **Uber** or **Pathao**, offering tailored dashboards for **Riders**, **Drivers**, and **Admins**.

> 🌐 **Live Demo:** [https://ride-booking-client-one.vercel.app/](https://ride-booking-client-one.vercel.app/)  
> 🎥 **Demo Video:** [🔗 Watch the demo video](https://drive.google.com/file/d/1qSwijwX5yz1nfHPxkroICcIdCfj9Gmt8/view?usp=sharing)  
> 🗂️ **Backend Repository:** [Ride Booking Backend](https://github.com/Arifulit/rideBookingServer)

---

## 📋 Table of Contents

1. [Project Overview](#project-overview)  
2. [Tech Stack](#tech-stack)  
3. [Features](#features)  
   - [Public Landing Pages](#public-landing-pages)  
   - [Authentication & Authorization](#authentication--authorization)  
   - [Rider Dashboard](#rider-features)  
   - [Driver Dashboard](#driver-features)  
   - [Admin Dashboard](#admin-features)  
   - [General UI/UX Enhancements](#general-uiux-enhancements)  
4. [Installation & Setup](#installation--setup)  
5. [Project Structure](#project-structure)  
6. [Available Scripts](#available-scripts)  
7. [Configuration](#configuration)  
8. [Error Handling & Validation](#error-handling--validation)  
9. [Demo Walkthrough](#demo-walkthrough)  
10. [Contributors](#contributors)  
11. [License](#license)

---

## 🧭 Project Overview

The **Ride Management System Frontend** provides an intuitive and seamless user interface for a **full-stack ride booking application**.  
It integrates with a **Node.js/Express + MongoDB backend** to deliver a **secure**, **responsive**, and **real-time** experience for all users.

The platform supports **three distinct roles**:

- 👤 **Rider** – Request rides, track status, and manage profile.  
- 🚘 **Driver** – Accept rides, manage availability, and monitor earnings.  
- 🛠️ **Admin** – Manage users, monitor rides, and analyze system activity.

The application is built with **modern frontend best practices**, ensuring scalability, maintainability, and superior performance.

---

## 🧰 Tech Stack

| Category | Technology |
|-----------|-------------|
| **Frontend Framework** | React (with React Router DOM) |
| **State Management** | Redux Toolkit + RTK Query |
| **Language** | TypeScript |
| **Styling** | Tailwind CSS |
| **Data Visualization** | Recharts |
| **Notifications** | react-hot-toast |
| **Authentication** | JWT-based (via Backend API) |
| **API Client** | RTK Query / Axios |
| **Optional APIs** | Google Maps / Leaflet for location tracking |
| **Build & Deployment** | Vite + Vercel |

---

## 🌟 Features

### 🏠 Public Landing Pages

Accessible without authentication:

- **Home Page** – Five sections: Hero Banner, How It Works, Service Highlights, Testimonials, and Call-to-Action.
- **About Us** – Company mission and team introduction.
- **Features** – Detailed description of Rider, Driver, and Admin functionalities.
- **Contact Page** – Validated contact form (simulated submission).
- **FAQ Page** – Searchable list of frequently asked questions.

---

### 🔐 Authentication & Authorization

- **JWT-based secure authentication**
- **Role-based routing** (`Rider`, `Driver`, `Admin`)
- Registration with **role selection**
- Persistent login sessions using local storage
- **Account status handling**:
  - Blocked/Suspended users redirected to status page
  - Offline drivers restricted from receiving new ride requests
- Logout functionality with redirect

---

### 🚗 Rider Features

- **Ride Request Form** – Pickup/destination input, fare estimate, payment method.  
- **Ride Tracking** – Real-time ride updates and map integration *(optional)*.  
- **Ride History** – Paginated and searchable list of rides with filters.  
- **Ride Details Page** – Route map, timestamps, driver info, and timeline.  
- **Profile Management** – Update name, phone, and password.  

---

### 🚙 Driver Features

- **Availability Toggle** – Switch between online/offline.  
- **Incoming Requests** – Accept or reject ride offers.  
- **Active Ride Management** – Update ride status from Accepted → Completed.  
- **Earnings Dashboard** – Recharts visualization (daily/weekly/monthly).  
- **Ride History** – Filterable list of completed rides.  
- **Profile Management** – Update vehicle info, contact details, and password.  

---

### 🛠️ Admin Features

- **User Management** – Search, filter, block/unblock users, approve drivers.  
- **Ride Oversight** – View all rides with advanced filters.  
- **Analytics Dashboard** – Visual insights into rides, revenue, and activity.  
- **Profile Management** – Manage personal admin settings and password.  

---

### 🧩 General UI/UX Enhancements

- Fully responsive design for mobile, tablet, and desktop.  
- Sticky navigation bar with multiple menu routes.  
- Skeleton loaders and lazy loading for performance.  
- Consistent color palette and typography.  
- Accessibility-compliant UI and semantic HTML.  
- Real-time data visualization (cards, charts, tables).  
- **Emergency / SOS Button**
  - Visible during active rides only.  
  - Triggers emergency call or live location sharing.  
  - Configurable contacts under **Settings → Safety**.  

---

## ⚙️ Installation & Setup

### 1️⃣ Clone the Repository

```bash
git clone https://github.com/Arifulit/rideBookingClient.git
cd rideBookingClient
