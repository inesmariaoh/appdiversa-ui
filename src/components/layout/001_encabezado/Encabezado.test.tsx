import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { Encabezado } from './Encabezado';

const configuracionBase = {
  nombre_aplicativo: 'Divers App',
  logo_institucional: null,
  logo_principal: null,
  texto_contacto: 'Contacto',
  url_contacto: '/contacto',
  color_primario: '#3B2484',
};

describe('Encabezado', () => {
  it('renderiza el nombre de la aplicacion como enlace al inicio cuando no hay logo principal', () => {
    render(<Encabezado configuracion={configuracionBase} />);
    expect(
      screen.getByRole('link', { name: /ir al inicio: divers app/i })
    ).toHaveTextContent('Divers App');
    expect(
      screen.getByRole('link', { name: /ir al inicio de encuestas/i })
    ).toBeInTheDocument();
    expect(screen.getByLabelText('DANE')).toBeInTheDocument();
    expect(screen.getByLabelText('SEN')).toBeInTheDocument();
  });

  it('renderiza el logo institucional cuando la API lo entrega', () => {
    render(
      <Encabezado
        configuracion={{
          ...configuracionBase,
          logo_institucional: 'http://localhost:8000/media/logos/dane-sen.png',
        }}
      />
    );
    expect(screen.getByAltText('DANE y SEN')).toBeInTheDocument();
  });

  it('renderiza el logo principal cuando la API lo entrega', () => {
    render(
      <Encabezado
        configuracion={{
          ...configuracionBase,
          logo_principal: 'http://localhost:8000/media/logos/divers-app.jpg',
        }}
      />
    );
    expect(screen.getByAltText('Divers App')).toBeInTheDocument();
    expect(screen.queryByText('Divers App')).not.toBeInTheDocument();
  });

  it('renderiza el enlace de contacto con texto correcto', () => {
    render(<Encabezado configuracion={configuracionBase} />);
    expect(screen.getByRole('link', { name: /contacto/i })).toBeInTheDocument();
  });

  it('muestra botones de registro e inicio de sesion cuando no hay usuario autenticado', () => {
    render(<Encabezado configuracion={configuracionBase} usuarioAutenticado={false} />);
    expect(screen.getByRole('link', { name: /registrarse/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /iniciar sesión/i })).toBeInTheDocument();
  });

  it('muestra menu de perfil cuando hay usuario autenticado', () => {
    render(<Encabezado configuracion={configuracionBase} usuarioAutenticado={true} />);
    expect(
      screen.getByRole('button', { name: /menú de perfil/i }),
    ).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: /registrarse/i })).not.toBeInTheDocument();
  });

  it('contiene un elemento header con role banner', () => {
    render(<Encabezado configuracion={configuracionBase} />);
    expect(screen.getByRole('banner')).toBeInTheDocument();
  });

  it('contiene navegacion con aria-label descriptivo', () => {
    render(<Encabezado configuracion={configuracionBase} />);
    expect(screen.getByRole('navigation', { name: /acciones de usuario/i })).toBeInTheDocument();
  });
});
