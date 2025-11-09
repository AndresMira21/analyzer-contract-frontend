import { render, screen } from '@testing-library/react';
import Home from '../pages/Home';

test('renders Spanish title', () => {
  render(<Home />);
  const title = screen.getByText('Analizador de Contratos Legales con IA');
  expect(title).toBeInTheDocument();
});