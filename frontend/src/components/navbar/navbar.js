import React from "react";
import { NavLink } from "react-router-dom";
import "./navbar.css";

function Navbar() {
  return (
    <nav className="navbar">
      <ul className="nav-links">
        <li><NavLink to="/" end className={({ isActive }) => isActive ? "active" : ""}>Dashboard</NavLink></li>
        <li><NavLink to="/patient-list" className={({ isActive }) => isActive ? "active" : ""}>Patients</NavLink></li>
        <li><NavLink to="/appointments" className={({ isActive }) => isActive ? "active" : ""}>Appointments</NavLink></li>
        <li><NavLink to="/payments" className={({ isActive }) => isActive ? "active" : ""}>Payments</NavLink></li>
        <li><NavLink to="/medicament-list" className={({ isActive }) => isActive ? "active" : ""}>Medicaments</NavLink></li>
        <li><NavLink to="/dental_labs" className={({ isActive }) => isActive ? "active" : ""}>Labs</NavLink></li>
      </ul>
    </nav>
  );
}

export default Navbar;
