import React from 'react';
import { render, screen } from '@testing-library/react';
import Match from '../views/Match';

test('renders learn react link', () => {
  render(<Match />);
  const linkElement = screen.getByText(/learn react/i);
  expect(linkElement).toBeInTheDocument();
});
