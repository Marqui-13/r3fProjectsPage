// Navbar.js
import React from "react";
import "./Navbar.css";

const Navbar = ({ projects }) => {
  const scrollToProject = (projectName) => {
    const projectSection = document.getElementById(projectName.replace(/ /g, '-')); // Replace spaces with hyphens
    if (projectSection) {
      projectSection.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <nav>
      <ul>
        {projects.map((project) => (
          <li key={project.id}>
            <button onClick={() => scrollToProject(project.projectName)}>
              {project.projectName}
            </button>
          </li>
        ))}
      </ul>
    </nav>
  );
};

export default Navbar;