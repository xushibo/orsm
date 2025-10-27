/**
 * Tests for MobileResultModal component
 */

import { render, screen, fireEvent } from '@testing-library/react';
import { MobileResultModal } from '../MobileResultModal';

const mockResult = {
  word: 'cat',
  story: 'A cute cat is sitting quietly.',
  chineseName: '猫',
  chineseStory: '一只可爱的猫安静地坐着。',
};

const mockOnClose = jest.fn();
const mockOnSpeak = jest.fn();

describe('MobileResultModal', () => {
  beforeEach(() => {
    mockOnClose.mockClear();
    mockOnSpeak.mockClear();
  });

  it('should render result modal with English content by default', () => {
    render(
      <MobileResultModal
        result={mockResult}
        onClose={mockOnClose}
        onSpeak={mockOnSpeak}
        isSpeaking={false}
        showChinese={false}
      />
    );
    
    expect(screen.getByText('🎊 Magic Success! 🎊')).toBeInTheDocument();
    expect(screen.getByText('🔍 What I Found')).toBeInTheDocument();
    expect(screen.getByText('cat')).toBeInTheDocument();
    expect(screen.getByText('🎭 Magic Story 🎭')).toBeInTheDocument();
    expect(screen.getByText(/A cute cat is sitting quietly/)).toBeInTheDocument();
  });

  it('should render result modal with Chinese content when specified', () => {
    render(
      <MobileResultModal
        result={mockResult}
        onClose={mockOnClose}
        onSpeak={mockOnSpeak}
        isSpeaking={false}
        showChinese={true}
      />
    );
    
    expect(screen.getByText('🎊 魔法成功！🎊')).toBeInTheDocument();
    expect(screen.getByText('🔍 我发现了什么')).toBeInTheDocument();
    expect(screen.getByText('猫')).toBeInTheDocument();
    expect(screen.getByText('🎭 魔法故事 🎭')).toBeInTheDocument();
    expect(screen.getByText(/一只可爱的猫安静地坐着/)).toBeInTheDocument();
  });

  it('should call onClose when close button is clicked', () => {
    render(
      <MobileResultModal
        result={mockResult}
        onClose={mockOnClose}
        onSpeak={mockOnSpeak}
        isSpeaking={false}
        showChinese={false}
      />
    );
    
    const closeButton = screen.getByText('✕');
    fireEvent.click(closeButton);
    
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('should call onSpeak when speak button is clicked', () => {
    render(
      <MobileResultModal
        result={mockResult}
        onClose={mockOnClose}
        onSpeak={mockOnSpeak}
        isSpeaking={false}
        showChinese={false}
      />
    );
    
    const speakButton = screen.getByText('🔊 Listen to Story');
    fireEvent.click(speakButton);
    
    expect(mockOnSpeak).toHaveBeenCalledTimes(1);
  });

  it('should disable speak button when speaking', () => {
    render(
      <MobileResultModal
        result={mockResult}
        onClose={mockOnClose}
        onSpeak={mockOnSpeak}
        isSpeaking={true}
        showChinese={false}
      />
    );
    
    const speakButton = screen.getByText('🔊 Reading...');
    expect(speakButton).toBeDisabled();
  });

  it('should toggle language when language button is clicked', () => {
    render(
      <MobileResultModal
        result={mockResult}
        onClose={mockOnClose}
        onSpeak={mockOnSpeak}
        isSpeaking={false}
        showChinese={false}
      />
    );
    
    const languageButton = screen.getByText('🌍 切换到中文');
    fireEvent.click(languageButton);
    
    // Should now show Chinese text
    expect(screen.getByText('🎊 魔法成功！🎊')).toBeInTheDocument();
    expect(screen.getByText('🔍 我发现了什么')).toBeInTheDocument();
  });

  it('should call onClose when take another button is clicked', () => {
    render(
      <MobileResultModal
        result={mockResult}
        onClose={mockOnClose}
        onSpeak={mockOnSpeak}
        isSpeaking={false}
        showChinese={false}
      />
    );
    
    const takeAnotherButton = screen.getByText('🚀 Take Another!');
    fireEvent.click(takeAnotherButton);
    
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('should have proper styling classes', () => {
    const { container } = render(
      <MobileResultModal
        result={mockResult}
        onClose={mockOnClose}
        onSpeak={mockOnSpeak}
        isSpeaking={false}
        showChinese={false}
      />
    );
    
    const modalContainer = container.firstChild;
    expect(modalContainer).toHaveClass('w-full', 'h-full', 'flex', 'flex-col');
  });

  it('should render decorative elements', () => {
    render(
      <MobileResultModal
        result={mockResult}
        onClose={mockOnClose}
        onSpeak={mockOnSpeak}
        isSpeaking={false}
        showChinese={false}
      />
    );
    
    // Check for success emoji
    expect(screen.getByText('🎉')).toBeInTheDocument();
    
    // Check for decorative sparkles
    const sparkles = screen.getAllByText('✨');
    expect(sparkles.length).toBeGreaterThan(0);
    
    // Check for decorative stars
    const stars = screen.getAllByText('🌟');
    expect(stars.length).toBeGreaterThan(0);
  });
});
