import { useState } from "react";
import Card from "../components/Card";
import Button from "../components/Button";
import TextInput from "../components/TextInput";
import { createProject, joinProject } from "../api";

export default function Projects({ userid, projects, onProjectsChange, onSelect }) {
  const [newId, setNewId] = useState("");
  const [newName, setNewName] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [joinId, setJoinId] = useState("");
  const [message, setMessage] = useState("");

  const addProject = (pid) => {
    if (!projects.includes(pid)) onProjectsChange([...projects, pid]);
    onSelect(pid);
  };

  const handleCreate = async (event) => {
    event.preventDefault();
    try {
      await createProject(newId, newName, newDescription, userid);
      addProject(newId);
      setMessage(`Created ${newId}.`);
      setNewId("");
      setNewName("");
      setNewDescription("");
    } catch (err) {
      setMessage(err.message);
    }
  };

  const handleJoin = async (event) => {
    event.preventDefault();
    try {
      await joinProject(joinId, userid);
      addProject(joinId);
      setMessage(`Joined ${joinId}.`);
      setJoinId("");
    } catch (err) {
      setMessage(err.message);
    }
  };

  return (
    <>
      <h1>Projects</h1>
      {message && <p className="notice">{message}</p>}

      <Card title="Your projects">
        {projects.length === 0 && <p>None yet.</p>}
        <ul>
          {projects.map((pid) => (
            <li key={pid}>{pid}</li>
          ))}
        </ul>
      </Card>

      <Card title="Create a project">
        <form onSubmit={handleCreate}>
          <TextInput label="Project ID" value={newId} onChange={(event) => setNewId(event.target.value)} />
          <TextInput label="Name" value={newName} onChange={(event) => setNewName(event.target.value)} />
          <TextInput label="Description" value={newDescription} onChange={(event) => setNewDescription(event.target.value)} />
          <Button type="submit">Create</Button>
        </form>
      </Card>

      <Card title="Use an existing project">
        <form onSubmit={handleJoin}>
          <TextInput label="Project ID" value={joinId} onChange={(event) => setJoinId(event.target.value)} />
          <Button type="submit">Join</Button>
        </form>
      </Card>
    </>
  );
}
