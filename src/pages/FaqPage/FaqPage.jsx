import { Link } from 'react-router'
import '../pages.css'

const questions = [
  {
    question: '¿Cómo puedo solicitar una visita?',
    answer: 'Entra en la ficha de la vivienda que te interesa y completa el formulario de visita. Te contactaremos para confirmar la fecha y resolver cualquier duda antes de la cita.',
  },
  {
    question: '¿Las propiedades publicadas siguen disponibles?',
    answer: 'Revisamos el catálogo de forma periódica. La disponibilidad puede cambiar rápidamente, por lo que recomendamos contactar con nosotros para confirmar el estado de una vivienda concreta.',
  },
  {
    question: '¿Puedo guardar viviendas para verlas más tarde?',
    answer: 'Sí. Pulsa el corazón de cualquier propiedad para añadirla a favoritos. Tu selección se guarda en este navegador y puedes consultarla desde el menú principal.',
  },
  {
    question: '¿Lumera también gestiona alquileres?',
    answer: 'Sí. En el buscador y en el catálogo puedes cambiar entre compra y alquiler para consultar las viviendas disponibles en cada modalidad.',
  },
  {
    question: '¿Cómo puedo anunciar mi propiedad?',
    answer: 'Escríbenos desde la página de contacto seleccionando “Quiero vender”. Estudiaremos la vivienda, su ubicación y la mejor forma de presentarla.',
  },
  {
    question: '¿La valoración inicial tiene coste?',
    answer: 'La primera conversación y la valoración inicial son gratuitas y no implican ningún compromiso. Antes de iniciar cualquier gestión explicaremos con claridad las condiciones del servicio.',
  },
  {
    question: '¿Trabajáis en toda España?',
    answer: 'Nuestra selección actual se concentra en varias de las principales ciudades y destinos residenciales de España. Puedes consultar las ubicaciones disponibles desde el catálogo.',
  },
  {
    question: '¿Necesito crear una cuenta?',
    answer: 'No. Actualmente puedes explorar, filtrar y guardar propiedades sin registrarte. Los favoritos permanecen únicamente en el navegador desde el que los guardaste.',
  },
]

function FaqPage() {
  return <div className="faq-page page-space"><header className="page-hero container"><p className="eyebrow">Estamos para ayudarte</p><h1>Preguntas<br /><em>frecuentes.</em></h1><p>Todo lo que necesitas saber para buscar, visitar o poner a la venta una propiedad con Lumera.</p></header><section className="faq-content container" aria-label="Preguntas frecuentes">{questions.map(({ question, answer }) => <details className="faq-item" key={question}><summary>{question}<span aria-hidden="true">+</span></summary><p>{answer}</p></details>)}</section><section className="faq-contact"><div className="container"><p className="eyebrow">¿No encuentras tu respuesta?</p><h2>Hablemos de lo que necesitas.</h2><Link to="/contacto" className="solid-link">Contactar con Lumera</Link></div></section></div>
}

export default FaqPage
