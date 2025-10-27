/**
 * Tests for MobileCaptureButton component
 */

import { render, screen, fireEvent } from '@testing-library/react';
import { MobileCaptureButton } from '../MobileCaptureButton';

describe('MobileCaptureButton', () => {
  const mockOnCapture = jest.fn();

  beforeEach(() => {
    mockOnCapture.mockClear();
  });

  it('should render capture button', () => {
    render(<MobileCaptureButton onCapture={mockOnCapture} />);
    
    const button = screen.getByRole('button');
    expect(button).toBeInTheDocument();
    expect(button).toHaveClass('fixed', 'bottom-8', 'left-1/2', 'transform', '-translate-x-1/2');
  });

  it('should call onCapture when clicked', () => {
    render(<MobileCaptureButton onCapture={mockOnCapture} />);
    
    const button = screen.getByRole('button');
    fireEvent.click(button);
    
    expect(mockOnCapture).toHaveBeenCalledTimes(1);
  });

  it('should have proper styling classes', () => {
    render(<MobileCaptureButton onCapture={mockOnCapture} />);
    
    const button = screen.getByRole('button');
    expect(button).toHaveClass(
      'w-20',
      'h-20',
      'bg-gradient-to-r',
      'from-yellow-400',
      'to-orange-500',
      'rounded-full',
      'shadow-2xl',
      'border-4',
      'border-white',
      'hover:scale-110',
      'transition-all',
      'duration-300'
    );
  });

  it('should render camera emoji', () => {
    render(<MobileCaptureButton onCapture={mockOnCapture} />);
    
    expect(screen.getByText('📸')).toBeInTheDocument();
  });

  it('should be accessible', () => {
    render(<MobileCaptureButton onCapture={mockOnCapture} />);
    
    const button = screen.getByRole('button');
    expect(button).toHaveAttribute('aria-label', 'Take Photo');
  });
});
