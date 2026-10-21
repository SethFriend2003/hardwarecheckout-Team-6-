import { useEffect, useState } from "react";
import { Link } from "react-router";
import HardwareRow from "../components/HardwareRow";
import { getHardware, getProject } from "../api";

export default function Hardware({ projects, projectId, onSelect }) {
  const [hardware, setHardware] = useState([]);
  const [heldByName, setHeldByName] = useState({});
  const [error, setError] = useState("");
  const [reloadCount, setReloadCount] = useState(0);

  // Runs after the first render (mount) and again when projectId or reloadCount changes
  useEffect(() => {
    if (!projectId) return;
    let isStale = false;

    const load = async () => {
      try {
        const sets = await getHardware();
        const project = await getProject(projectId);
        if (isStale) return;
        setHardware(sets);
        setHeldByName(project.hwCheckedOut);
        setError("");
      } catch (err) {
        if (!isStale) setError(err.message);
      }
    };
    load();

    return () => {
      isStale = true;
    };
  }, [projectId, reloadCount]);

  if (!projectId) {
    return <p>Pick a project first. <Link to="/projects">Go to Projects</Link></p>;
  }

  return (
    <>
      <h1>Hardware</h1>
      <label>
        Project{" "}
        <select value={projectId} onChange={(event) => onSelect(event.target.value)}>
          {projects.map((pid) => (
            <option key={pid} value={pid}>{pid}</option>
          ))}
        </select>
      </label>
      {error && <p className="error" role="alert">{error}</p>}
      <table>
        <thead>
          <tr>
            <th>Set</th>
            <th>Capacity</th>
            <th>Available</th>
            <th>Your project holds</th>
            <th>Request</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {hardware.map((hw) => (
            <HardwareRow
              key={hw.name}
              hw={hw}
              held={heldByName[hw.name] ?? 0}
              projectId={projectId}
              onDone={() => setReloadCount(reloadCount + 1)}
            />
          ))}
        </tbody>
      </table>
    </>
  );
}
