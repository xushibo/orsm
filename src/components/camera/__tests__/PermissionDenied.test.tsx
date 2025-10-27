/**
 * Tests for PermissionDenied component
 */

import { render, screen, fireEvent } from '@testing-library/react';
import { PermissionDenied } from '../PermissionDenied';

describe('PermissionDenied', () => {
  const mockOnRetry = jest.fn();

  beforeEach(() => {
    mockOnRetry.mockClear();
  });

  it('should render permission denied message', () => {
    render(<PermissionDenied onRetry={mockOnRetry} />);
    
    expect(screen.getByText('🚫')).toBeInTheDocument();
    expect(screen.getByText('Camera Access Denied')).toBeInTheDocument();
    expect(screen.getByText('Please allow camera access in your browser settings')).toBeInTheDocument();
    expect(screen.getByText('Retry')).toBeInTheDocument();
  });

  it('should display custom error message when provided', () => {
    const customError = 'Custom error message';
    render(<PermissionDenied error={customError} onRetry={mockOnRetry} />);
    
    expect(screen.getByText(customError)).toBeInTheDocument();
  });

  it('should call onRetry when retry button is clicked', () => {
    render(<PermissionDenied onRetry={mockOnRetry} />);
    
    const retryButton = screen.getByText('Retry');
    fireEvent.click(retryButton);
    
    expect(mockOnRetry).toHaveBeenCalledTimes(1);
  });

  it('should have proper styling classes', () => {
    const { container } = render(<PermissionDenied onRetry={mockOnRetry} />);
    
    // Check for background
    expect(container.firstChild).toHaveClass('absolute', 'inset-0', 'bg-red-900');
    
    // Check for retry button styling
    const retryButton = screen.getByText('Retry');
    expect(retryButton).toHaveClass('bg-white', 'text-red-600', 'px-8', 'py-4', 'rounded-full');
  });

  it('should render with error icon', () => {
    render(<PermissionDenied onRetry={mockOnRetry} />);
    
    // Check for error emoji
    expect(screen.getByText('🚫')).toBeInTheDocument();
  });
});
