import { useState } from "react";
import Button from "./Button";
import TextInput from "./TextInput";

// The backend cipher only handles printable ASCII 34 to 126 (see security.py)
const hasUnsupportedCharacter = (text) =>
  [...text].some((c) => c.charCodeAt(0) < 34 || c.charCodeAt(0) > 126);

export default function CredentialsForm({ submitLabel, onSubmit }) {
  const [userid, setUserid] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    if (!userid || !password) {
      setError("Enter both a user ID and a password.");
      return;
    }
    if (hasUnsupportedCharacter(userid)) {
      setError("User IDs can't contain spaces or '!'.");
      return;
    }
    setBusy(true);
    try {
      await onSubmit(userid, password);
    } catch (err) {
      setError(err.message);
      setBusy(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <TextInput label="User ID" value={userid} onChange={(event) => setUserid(event.target.value)} />
      <TextInput label="Password" type="password" value={password} onChange={(event) => setPassword(event.target.value)} />
      {error && <p className="error" role="alert">{error}</p>}
      <Button type="submit" disabled={busy}>{submitLabel}</Button>
    </form>
  );
}
