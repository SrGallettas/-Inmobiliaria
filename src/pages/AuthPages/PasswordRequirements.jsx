import { passwordRequirements } from '../../utils/formValidation'
import './PasswordRequirements.css'

export default function PasswordRequirements() {
  return <div className="password-requirements" aria-label="Requisitos de la contraseña"><strong>La contraseña debe incluir:</strong><ul>{passwordRequirements.map((requirement) => <li key={requirement}>{requirement}</li>)}</ul></div>
}
