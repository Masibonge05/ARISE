// Re-export from Modal.jsx for convenience
export { ConfirmDialog } from "../ui/Modal";
export default function ConfirmDialog(props) {
  const { ConfirmDialog: CD } = require("../ui/Modal");
  return <CD {...props} />;
}