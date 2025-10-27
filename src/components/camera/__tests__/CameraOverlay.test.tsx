/**
 * Tests for CameraOverlay component
 */

import { render, screen } from '@testing-library/react';
import { CameraOverlay } from '../CameraOverlay';

describe('CameraOverlay', () => {
  it('should render camera overlay in English by default', () => {
    render(<CameraOverlay />);
    
    expect(screen.getByText('📷 Photo Recognition')).toBeInTheDocument();
    expect(screen.getByText('✅ Authorized')).toBeInTheDocument();
    expect(screen.getByText('Put your object here!')).toBeInTheDocument();
    expect(screen.getByText('✨ Ready for magic!')).toBeInTheDocument();
  });

  it('should render camera overlay in Chinese when specified', () => {
    render(<CameraOverlay isChinese={true} />);
    
    expect(screen.getByText('📷 Photo Recognition')).toBeInTheDocument();
    expect(screen.getByText('✅ Authorized')).toBeInTheDocument();
    expect(screen.getByText('把东西放在框框里！')).toBeInTheDocument();
    expect(screen.getByText('✨ 准备变魔法啦！')).toBeInTheDocument();
  });

  it('should render decorative elements', () => {
    render(<CameraOverlay />);
    
    // Check for camera emoji
    expect(screen.getByText('📸')).toBeInTheDocument();
    
    // Check for decorative stars
    const stars = screen.getAllByText('⭐');
    expect(stars).toHaveLength(2);
  });

  it('should have proper styling classes', () => {
    const { container } = render(<CameraOverlay />);
    
    // Check for overlay container
    expect(container.firstChild).toHaveClass('absolute', 'inset-0', 'pointer-events-none');
    
    // Check for guide frame
    const guideFrame = screen.getByText('Put your object here!').closest('div');
    expect(guideFrame).toHaveClass('w-72', 'h-72', 'border-4', 'border-yellow-300', 'rounded-3xl');
    
    // Check for animated elements
    expect(screen.getByText('📸')).toHaveClass('animate-bounce');
    expect(screen.getAllByText('⭐')[0]).toHaveClass('animate-pulse');
  });

  it('should render corner decorations', () => {
    const { container } = render(<CameraOverlay />);
    
    // Check for corner decorations (they should be present as div elements)
    const cornerDecorations = container.querySelectorAll('.absolute.top-3.left-3, .absolute.top-3.right-3, .absolute.bottom-3.left-3, .absolute.bottom-3.right-3');
    expect(cornerDecorations).toHaveLength(4);
  });
});
