import { PaginaListadoEncuestas } from '@/components/formularios/001_lista_formularios/PaginaListadoEncuestas';

const MIGAS = [
  { etiqueta: 'Inicio', href: '/' },
  { etiqueta: 'Encuestas' },
];

export default function PaginaEncuestas() {
  return <PaginaListadoEncuestas migas={MIGAS} />;
}
