import { useState } from "react";
import { Routes, Route, Link } from "react-router";
import Button from "./components/Button";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Projects from "./pages/Projects";
import Hardware from "./pages/Hardware";

export default function App() {
  const [userid, setUserid] = useState(null);
  const [projects, setProjects] = useState([]);
  const [activeProject, setActiveProject] = useState(null);

  const handleLogin = (id, projectIds) => {
    setUserid(id);
    setProjects(projectIds);
    setActiveProject(projectIds[0] ?? null);
  };

  const handleLogout = () => {
    setUserid(null);
    setProjects([]);
    setActiveProject(null);
  };

  const requireLogin = (page) =>
    userid ? page : <p>Please <Link to="/login">log in</Link> first.</p>;

  return (
    <>
      <nav>
        <Link to="/">Home</Link>
        <Link to="/login">Login</Link>
        <Link to="/projects">Projects</Link>
        <Link to="/hardware">Hardware</Link>
        {userid && <Button onClick={handleLogout}>Log out ({userid})</Button>}
      </nav>
      <main>
        <Routes>
          <Route path="/" element={<Home userid={userid} />} />
          <Route path="/login" element={<Login userid={userid} onLogin={handleLogin} />} />
          <Route
            path="/projects"
            element={requireLogin(
              <Projects
                userid={userid}
                projects={projects}
                onProjectsChange={setProjects}
                onSelect={setActiveProject}
              />
            )}
          />
          <Route
            path="/hardware"
            element={requireLogin(
              <Hardware projects={projects} projectId={activeProject} onSelect={setActiveProject} />
            )}
          />
        </Routes>
      </main>
    </>
  );
}
