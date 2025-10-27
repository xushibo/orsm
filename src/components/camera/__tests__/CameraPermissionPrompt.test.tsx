/**
 * Tests for CameraPermissionPrompt component
 */

import { render, screen, fireEvent } from '@testing-library/react';
import { CameraPermissionPrompt } from '../CameraPermissionPrompt';

describe('CameraPermissionPrompt', () => {
  const mockOnRequestCamera = jest.fn();

  beforeEach(() => {
    mockOnRequestCamera.mockClear();
  });

  it('should render permission prompt in English by default', () => {
    render(<CameraPermissionPrompt onRequestCamera={mockOnRequestCamera} />);
    
    expect(screen.getByText('🎭 Story Magic Camera 🎭')).toBeInTheDocument();
    expect(screen.getByText(/📸 Take a photo, create magic!/)).toBeInTheDocument();
    expect(screen.getByText('🚀 Start Magic Journey!')).toBeInTheDocument();
  });

  it('should render permission prompt in Chinese when specified', () => {
    render(<CameraPermissionPrompt onRequestCamera={mockOnRequestCamera} isChinese={true} />);
    
    expect(screen.getByText('🎭 故事魔法相机 🎭')).toBeInTheDocument();
    expect(screen.getByText(/📸 拍一拍，变魔法！/)).toBeInTheDocument();
    expect(screen.getByText('🚀 开始魔法之旅！')).toBeInTheDocument();
  });

  it('should call onRequestCamera when start button is clicked', () => {
    render(<CameraPermissionPrompt onRequestCamera={mockOnRequestCamera} />);
    
    const startButton = screen.getByText('🚀 Start Magic Journey!');
    fireEvent.click(startButton);
    
    expect(mockOnRequestCamera).toHaveBeenCalledTimes(1);
  });

  it('should toggle language when language button is clicked', () => {
    render(<CameraPermissionPrompt onRequestCamera={mockOnRequestCamera} />);
    
    const languageButton = screen.getByText('🌍 切换到中文');
    fireEvent.click(languageButton);
    
    // Should now show Chinese text
    expect(screen.getByText('🎭 故事魔法相机 🎭')).toBeInTheDocument();
    expect(screen.getByText('🚀 开始魔法之旅！')).toBeInTheDocument();
    
    // Click again to toggle back to English
    const englishButton = screen.getByText('🌍 Switch to English');
    fireEvent.click(englishButton);
    
    expect(screen.getByText('🎭 Story Magic Camera 🎭')).toBeInTheDocument();
    expect(screen.getByText('🚀 Start Magic Journey!')).toBeInTheDocument();
  });

  it('should render decorative elements', () => {
    render(<CameraPermissionPrompt onRequestCamera={mockOnRequestCamera} />);
    
    // Check for camera emoji
    expect(screen.getByText('📷')).toBeInTheDocument();
    
    // Check for decorative stars (there are 2 ✨ and 1 🌟)
    const sparkles = screen.getAllByText('✨');
    expect(sparkles).toHaveLength(2);
    
    const stars = screen.getAllByText('🌟');
    expect(stars).toHaveLength(1);
    
    // Check for decorative balloons (there are 2 🎈 and 1 🎪)
    const balloons = screen.getAllByText('🎈');
    expect(balloons).toHaveLength(2);
    
    const circus = screen.getAllByText('🎪');
    expect(circus).toHaveLength(1);
  });

  it('should have proper styling classes', () => {
    const { container } = render(<CameraPermissionPrompt onRequestCamera={mockOnRequestCamera} />);
    
    // Check for gradient background
    expect(container.firstChild).toHaveClass('bg-gradient-to-br', 'from-pink-400', 'via-purple-500', 'to-blue-500');
    
    // Check for animated elements
    expect(screen.getByText('📷')).toHaveClass('animate-bounce');
    expect(screen.getByText('🚀 Start Magic Journey!')).toHaveClass('animate-pulse');
  });
});
