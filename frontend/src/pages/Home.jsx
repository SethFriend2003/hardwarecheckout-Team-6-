import { Link } from "react-router";

export default function Home({ userid }) {
  return (
    <>
      <h1>Hardware checkout</h1>
      <p>{userid ? `Signed in as ${userid}.` : "Log in to manage projects and hardware."}</p>
      <ul>
        <li><Link to="/login">Login</Link></li>
        <li><Link to="/projects">Projects</Link></li>
        <li><Link to="/hardware">Hardware</Link></li>
      </ul>
    </>
  );
}
