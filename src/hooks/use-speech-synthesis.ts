import { useState, useCallback } from 'react';

export interface SpeechSynthesisHook {
  isSpeaking: boolean;
  speakText: (text: string) => Promise<void>;
  stopSpeaking: () => void;
}

/**
 * Hook for managing speech synthesis
 * Handles text-to-speech with Safari compatibility
 */
export function useSpeechSynthesis(): SpeechSynthesisHook {
  const [isSpeaking, setIsSpeaking] = useState(false);

  // Safari语音加载辅助函数
  const loadVoicesForSafari = (): Promise<SpeechSynthesisVoice[]> => {
    return new Promise((resolve) => {
      const voices = window.speechSynthesis.getVoices();
      if (voices.length > 0) {
        resolve(voices);
      } else {
        // Safari需要等待语音加载
        const checkVoices = () => {
          const voices = window.speechSynthesis.getVoices();
          if (voices.length > 0) {
            resolve(voices);
          } else {
            setTimeout(checkVoices, 100);
          }
        };
        checkVoices();
      }
    });
  };

  const speakText = useCallback(async (text: string): Promise<void> => {
    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    console.log('Speech text:', text);
    console.log('Text length:', text.length);
    console.log('First 50 chars:', text.substring(0, 50));

    // 检测文本语言
    const isChinese = /[\u4e00-\u9fff]/.test(text);
    console.log('Is Chinese text:', isChinese);
    console.log('Chinese characters found:', text.match(/[\u4e00-\u9fff]/g));
    
    // 检测Safari浏览器
    const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
    console.log('Is Safari:', isSafari);

    const utterance = new SpeechSynthesisUtterance(text);
    
    // Safari特殊处理
    if (isSafari && isChinese) {
      // Safari中文朗读需要特殊设置
      utterance.lang = 'zh-CN';
      utterance.rate = 0.84; // Safari中文朗读速度：0.6 * 1.4 = 0.84 (快40%)
      utterance.pitch = 0.8; // 降低音调
      utterance.volume = 0.9;
      
      // 异步获取中文语音
      loadVoicesForSafari().then(voices => {
        const chineseVoice = voices.find(voice => 
          voice.lang.startsWith('zh') || 
          voice.name.includes('Chinese') ||
          voice.name.includes('中文')
        );
        
        if (chineseVoice) {
          utterance.voice = chineseVoice;
          console.log('Using Chinese voice:', chineseVoice.name);
        }
        
        // 延迟开始朗读
        setTimeout(() => {
          window.speechSynthesis.speak(utterance);
        }, 200);
      });
      
      return; // 提前返回，避免执行下面的代码
    } else {
      // 非Safari或英文内容
      utterance.lang = isChinese ? 'zh-CN' : 'en-US';
      utterance.rate = isChinese ? 1.008 : 0.72; // 中文快40%: 0.72 * 1.4 = 1.008, 英文保持0.72
      utterance.pitch = 1.0;
    }

    console.log('Speech language set to:', utterance.lang);
    console.log('Speech rate:', utterance.rate);
    console.log('Speech pitch:', utterance.pitch);

    utterance.onstart = () => {
      console.log('Speech started');
      setIsSpeaking(true);
    };
    
    utterance.onend = () => {
      console.log('Speech ended');
      setIsSpeaking(false);
    };
    
    utterance.onerror = (event) => {
      console.error('Speech error:', event.error);
      setIsSpeaking(false);
    };

    // 开始朗读（非Safari中文情况）
    window.speechSynthesis.speak(utterance);
  }, [isSpeaking]);

  const stopSpeaking = useCallback(() => {
    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  }, [isSpeaking]);

  return {
    isSpeaking,
    speakText,
    stopSpeaking,
  };
}
