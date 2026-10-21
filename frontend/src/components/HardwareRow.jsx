import { useState } from "react";
import Button from "./Button";
import { checkout, checkin } from "../api";

export default function HardwareRow({ hw, held, projectId, onDone }) {
  const [qty, setQty] = useState("1");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  const amount = Number(qty);
  const isValid = Number.isInteger(amount) && amount > 0;

  const send = async (action) => {
    setMessage("");
    setBusy(true);
    try {
      const data = await action(projectId, hw.name, amount);
      setMessage(data.message);
      onDone();
    } catch (err) {
      setMessage(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <tr>
        <td>{hw.name}</td>
        <td>{hw.capacity}</td>
        <td>{hw.available}</td>
        <td>{held}</td>
        <td>
          <input aria-label={`${hw.name} quantity`} className="qty" value={qty} onChange={(event) => setQty(event.target.value)} />
        </td>
        <td className="actions">
          <Button disabled={busy || !isValid} onClick={() => send(checkout)}>Check out</Button>
          <Button disabled={busy || !isValid} onClick={() => send(checkin)}>Check in</Button>
        </td>
      </tr>
      {message && (
        <tr>
          <td colSpan={6} className="row-message">{message}</td>
        </tr>
      )}
    </>
  );
}
