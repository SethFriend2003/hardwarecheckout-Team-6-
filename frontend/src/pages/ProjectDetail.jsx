import { useEffect, useState } from "react";
import { Link, useParams } from "react-router";
import Card from "../components/Card";
import { getProject, getMembers } from "../api";

export default function ProjectDetail({ userid }) {
  const { projectId } = useParams();
  const [project, setProject] = useState(null);
  const [members, setMembers] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadProject = async () => {
      try {
        const projectData = await getProject(projectId);
        const memberData = await getMembers(projectId, userid);
        setProject(projectData);
        setMembers(memberData.members);
        setError("");
      } catch (err) {
        setError(err.message);
      }
    };
    loadProject();
  }, [projectId, userid]);

  if (error) {
    return (
      <p className="error">
        {error} <Link to="/projects">Back to Projects</Link>
      </p>
    );
  }

  if (!project) {
    return <p>Loading...</p>;
  }

  // hwCheckedOut looks like {HWSet1: 3}, so turn it into a list we can loop over
  const hardwareList = Object.entries(project.hwCheckedOut || {});

  return (
    <>
      <p><Link to="/projects">Back to Projects</Link></p>
      <h1>{project.name} ({project.projectId})</h1>
      {project.description && <p>{project.description}</p>}

      <Card title={`Team (${members.length})`}>
        <ul>
          {members.map((name) => (
            <li key={name}>
              {name}
              {name === userid && " (you)"}
            </li>
          ))}
        </ul>
      </Card>

      <Card title="Checked out hardware">
        {hardwareList.length === 0 && <p>None yet.</p>}
        <ul>
          {hardwareList.map(([hwName, qty]) => (
            <li key={hwName}>{hwName}: {qty}</li>
          ))}
        </ul>
      </Card>
    </>
  );
}
