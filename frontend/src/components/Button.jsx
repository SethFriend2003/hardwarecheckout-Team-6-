export default function Button({ children, type = "button", ...props }) {
  return (
    <button type={type} {...props}>
      {children}
    </button>
  );
}
