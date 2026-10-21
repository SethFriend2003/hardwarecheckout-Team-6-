import { useState } from "react";
import { Link } from "react-router";
import Button from "../components/Button";
import Modal from "../components/Modal";
import CredentialsForm from "../components/CredentialsForm";
import { login, register } from "../api";

export default function Login({ userid: signedInAs, onLogin }) {
  const [isRegistering, setIsRegistering] = useState(false);
  const [notice, setNotice] = useState("");

  if (signedInAs) {
    return <p>Signed in as {signedInAs}. <Link to="/projects">Go to Projects</Link></p>;
  }

  const handleLogin = async (userid, password) => {
    const data = await login(userid, password);
    onLogin(data.userid, data.projects);
  };

  const handleRegister = async (userid, password) => {
    await register(userid, password);
    setIsRegistering(false);
    setNotice("Account created. Log in to continue.");
  };

  return (
    <>
      <h1>Sign in</h1>
      {notice && <p className="notice">{notice}</p>}
      <CredentialsForm submitLabel="Log in" onSubmit={handleLogin} />
      <p>New user? <Button onClick={() => setIsRegistering(true)}>Create an account</Button></p>

      {isRegistering && (
        <Modal title="New user" onClose={() => setIsRegistering(false)}>
          <CredentialsForm submitLabel="Create account" onSubmit={handleRegister} />
        </Modal>
      )}
    </>
  );
}
