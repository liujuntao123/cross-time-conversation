'use client';
import { useState, useEffect, useRef } from 'react';
import CharacterSelector from './components/CharacterSelector';
import ChatWindow from './components/ChatWindow';
import styles from './styles/Loader.module.css';
import html2canvas from 'html2canvas-pro';

const MAX_SELECTABLE_CHARACTERS = 4;

const PhoneFrame = ({ children, title, isVisible = true }) => (
  <div className={`absolute top-0 left-0 w-full h-full bg-white rounded-[12px] shadow-md flex flex-col overflow-hidden border-4 border-gray-900 ${isVisible ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'}`}>
    {/* Phone Header with Camera */}
    <div className="h-4 bg-gray-900 flex justify-center items-center relative">
      <div className="w-24 h-full bg-black rounded-b-xl"></div>
      <div className="absolute right-3 w-1.5 h-1.5 rounded-full bg-gray-600"></div>
    </div>

    {/* App Content */}
    <div className="flex-1 flex flex-col bg-white relative h-full overflow-auto">
      {children}
    </div>

    {/* Home Indicator */}
    <div className="h-1 bg-gray-900 flex justify-center items-center p-2">
      <div className="w-20 h-0.5 rounded-full bg-gray-600"></div>
    </div>
  </div>
);

PhoneFrame.displayName = 'PhoneFrame';

export default function Home() {
  const [selectedCharacters, setSelectedCharacters] = useState([]);
  const [messages, setMessages] = useState([]);
  const [showAddCharacter, setShowAddCharacter] = useState(false);
  const [newCharacterName, setNewCharacterName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessageIndex, setLoadingMessageIndex] = useState(0);
  const [conversationStarted, setConversationStarted] = useState(false);
  const [showCharacterSelector, setShowCharacterSelector] = useState(false);
  const [confirmedSelectedCharacters, setConfirmedSelectedCharacters] = useState([]);
  const [isExporting, setIsExporting] = useState(false);
  const [showConfig, setShowConfig] = useState(false);
  const [config, setConfig] = useState({
    rounds: 10,
    model: 'deepseek-r1'
  });
  const chatPhoneRef = useRef(null);

  const loadingMessages = [
    "这可能需要一点时间，请耐心等待...",
    "正在创建时空隧道...",
    "正在添加好友...",
    "正在拉群...",
  ];

  // 添加useEffect来处理loading消息的轮播
  useEffect(() => {
    let intervalId;
    if (isLoading) {
      intervalId = setInterval(() => {
        setLoadingMessageIndex((prev) => (prev + 1) % loadingMessages.length);
      }, 2000); // 每2秒切换一次消息
    }
    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [isLoading]);

  const handleCharacterSelect = (character) => {
    // 如果角色已经被选中，则移除它
    if (selectedCharacters.some(c => c.name === character.name)) {
      setSelectedCharacters(selectedCharacters.filter(c => c.name !== character.name));
      return;
    }
    
    // 如果未选中且未达到上限，则添加
    if (selectedCharacters.length < MAX_SELECTABLE_CHARACTERS) {
      setSelectedCharacters([...selectedCharacters, character]);
    }
  };

  const startConversation = async () => {
    setIsLoading(true);
    setConfirmedSelectedCharacters(selectedCharacters);
    setShowCharacterSelector(false); // Hide character selector after starting conversation
    try {
      const response = await fetch('/api/generate-conversation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          characters: selectedCharacters,
          rounds: config.rounds,
          model: config.model
        }),
      });

      if (!response.ok) {
        throw new Error('生成对话失败');
      }

      const data = await response.json();
      setMessages(data.messages);
      setConversationStarted(true);
    } catch (error) {
      console.error('生成对话失败:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const commonButtonClasses = "p-2 text-black";
  const addCharacterButtonClasses = "w-14 h-14 rounded-lg border border-gray-200 flex items-center justify-center text-gray-400 hover:bg-gray-50 transition-colors";
  const selectedCharacterButtonClasses = "w-14 h-14 rounded-lg flex items-center justify-center text-base overflow-hidden bg-[#E7F7EB] border-2 border-[#09B83E] text-[#09B83E]";

  const exportChatAsImage = async () => {
    if (!chatPhoneRef.current || isExporting) return;
    
    try {
      setIsExporting(true);
      
      // 获取聊天内容区域的截图
      const chatCanvas = await html2canvas(chatPhoneRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff',
        logging: false,
        onclone: (clonedDoc, clonedElement) => {
          // 直接在克隆的元素中查找
          // 处理消息气泡
          const bubbles = clonedElement.querySelectorAll('div[class*="bg-[#95EC69]"]');
          bubbles.forEach(bubble => {
            bubble.style.backgroundColor = '#95EC69';
          });

          // 处理自己的头像背景
          const selfAvatars = clonedElement.querySelectorAll('div[class*="bg-[#57be6a]"]');
          selfAvatars.forEach(avatar => {
            avatar.style.backgroundColor = '#57be6a';
          });

          // 处理其他人的头像背景
          const otherAvatars = clonedElement.querySelectorAll('div[class*="bg-[#9aa0a6]"]');
          otherAvatars.forEach(avatar => {
            avatar.style.backgroundColor = '#9aa0a6';
          });

          // 处理聊天窗口背景
          const chatBg = clonedElement.querySelectorAll('div[class*="bg-[#F7F7F7]"]');
          chatBg.forEach(bg => {
            bg.style.backgroundColor = '#F7F7F7';
          });
        }
      });
      
      // 创建聊天标题区域，使用实际的聊天内容宽度
      const titleCanvas = document.createElement('canvas');
      titleCanvas.width = chatCanvas.width;
      titleCanvas.height = 44 * 2; // h-11 = 44px
      const titleCtx = titleCanvas.getContext('2d');
      titleCtx.scale(2, 2);
      titleCtx.fillStyle = '#ffffff';
      titleCtx.fillRect(0, 0, chatCanvas.width/2, 44);
      
      // 绘制底部边框
      titleCtx.fillStyle = '#f3f4f6'; // border-gray-100
      titleCtx.fillRect(0, 43, chatCanvas.width/2, 1);
      
      // 绘制标题文本
      titleCtx.font = '16px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
      titleCtx.fillStyle = '#000000';
      titleCtx.textAlign = 'center';
      titleCtx.textBaseline = 'middle';
      const titleText = confirmedSelectedCharacters.length > 0 
        ? confirmedSelectedCharacters.map(char => char.name).join('、')
        : '跨时空对话';
      titleCtx.fillText(titleText, chatCanvas.width/4, 22);
      
      // 创建最终的画布
      const finalCanvas = document.createElement('canvas');
      finalCanvas.width = chatCanvas.width;
      finalCanvas.height = chatCanvas.height + 44 * 2;
      const finalCtx = finalCanvas.getContext('2d');
      
      // 组合所有部分
      finalCtx.drawImage(titleCanvas, 0, 0);
      finalCtx.drawImage(chatCanvas, 0, 44 * 2);
      
      // 将canvas转换为图片URL
      const imageUrl = finalCanvas.toDataURL('image/png');
      
      // 创建下载链接
      const link = document.createElement('a');
      link.download = `跨时空对话_${new Date().toLocaleDateString()}.png`;
      link.href = imageUrl;
      link.click();
    } catch (error) {
      console.error('导出图片失败:', error);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <main className="flex min-h-screen bg-gray-100 items-center justify-center p-4">
      <div className="relative w-[90vw] h-[90vh] max-w-[420px] max-h-[800px] min-w-[320px] min-h-[568px] aspect-[9/16]">
        {/* Character Selector Phone */}
        <PhoneFrame isVisible={showCharacterSelector}>
          <div className="flex-1 flex flex-col relative">
            {/* Header - WeChat Style */}
            <div className="flex items-center h-11 px-2 border-b border-gray-100 relative">
              <button 
                onClick={() => setShowCharacterSelector(false)}
                className={commonButtonClasses}
              >
                <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <h2 className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-lg font-normal">
                聊天信息({selectedCharacters.length}/{MAX_SELECTABLE_CHARACTERS})
              </h2>
            </div>

            {/* Selected Characters Preview */}
            <div className="flex-1 flex flex-col bg-[#f7f7f7]">
              <div className="p-4">
                <div className="grid grid-cols-5 gap-x-2 gap-y-3">
                  {selectedCharacters.map((char, index) => (
                    <div key={char.name} className="flex flex-col items-center">
                      <div className="relative">
                        <button
                          className={`${selectedCharacterButtonClasses} ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                          {char.name[0]}
                        </button>
                        <button
                          onClick={() => handleCharacterSelect(char)}
                          disabled={isLoading}
                          className={`absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full text-white text-xs flex items-center justify-center hover:bg-red-600 ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                          ×
                        </button>
                      </div>
                      <span className="mt-0.5 text-xs text-gray-600 truncate w-full text-center">
                        {char.name}
                      </span>
                    </div>
                  ))}
                  {selectedCharacters.length < MAX_SELECTABLE_CHARACTERS && (
                    <div className="flex flex-col items-center">
                      <button
                        onClick={() => setShowAddCharacter(true)}
                        disabled={isLoading}
                        className={`${addCharacterButtonClasses} ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v16m8-8H4" />
                        </svg>
                      </button>
                      <span className="mt-0.5 text-xs text-gray-600 truncate w-full text-center">
                        添加
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Character Selector */}
              <div className={`flex-1 overflow-auto px-4 border-t py-4 ${
                selectedCharacters.length > 0 ? 'max-h-[60vh]' : 'max-h-[70vh]'
              } ${isLoading ? 'opacity-50' : ''} scrollbar-thin hover:scrollbar-thumb-gray-300 scrollbar-thumb-gray-200 scrollbar-track-transparent`}>
                <CharacterSelector 
                  onCharacterSelect={handleCharacterSelect}
                  selectedCharacters={selectedCharacters}
                  isLoading={isLoading}
                />
              </div>

              {/* Start Conversation Button */}
              <div className="p-2 shadow-md bg-white flex justify-center items-center gap-2">
                <button
                  onClick={startConversation}
                  disabled={selectedCharacters.length < 2 || isLoading}
                  className="w-[70%] py-1 bg-[#09B83E] text-white rounded-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isLoading ? (
                    <>
                      <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      生成中...
                    </>
                  ) : (
                    '开始生成对话'
                  )}
                </button>
                <button
                  onClick={() => setShowConfig(true)}
                  disabled={isLoading}
                  className="w-[10%] py-1 bg-gray-100 text-gray-600 rounded-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center hover:bg-gray-200"
                >
                  <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </button>
              </div>

              {/* Configuration Modal */}
              {showConfig && (
                <div className="absolute inset-0 bg-white z-20">
                  <div className="flex items-center h-11 px-2 border-b border-gray-100">
                    <button 
                      onClick={() => setShowConfig(false)}
                      className={commonButtonClasses}
                    >
                      <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                      </svg>
                    </button>
                    <h2 className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-lg font-normal">
                      对话配置
                    </h2>
                  </div>
                  <div className="p-4 space-y-6">
                    {/* Rounds Selection */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        对话轮数
                      </label>
                      <div className="grid grid-cols-3 gap-2">
                        {[10, 15, 20].map((round) => (
                          <button
                            key={round}
                            onClick={() => setConfig(prev => ({ ...prev, rounds: round }))}
                            className={`py-2 px-4 rounded-lg border ${
                              config.rounds === round
                                ? 'border-[#09B83E] bg-[#E7F7EB] text-[#09B83E]'
                                : 'border-gray-200 bg-white text-gray-700'
                            }`}
                          >
                            {round}轮
                          </button>
                        ))}
                      </div>
                    </div>
                    
                    {/* Model Selection */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        对话模型
                      </label>
                      <div className="space-y-2">
                        {['deepseek-r1', 'claude', 'gemini'].map((model) => (
                          <button
                            key={model}
                            onClick={() => setConfig(prev => ({ ...prev, model }))}
                            className={`w-full py-2 px-4 rounded-lg border ${
                              config.model === model
                                ? 'border-[#09B83E] bg-[#E7F7EB] text-[#09B83E]'
                                : 'border-gray-200 bg-white text-gray-700'
                            } text-left`}
                          >
                            {model}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Add Character Modal */}
              {showAddCharacter && (
                <div className="absolute inset-0 bg-white z-20">
                  <div className="flex items-center h-11 px-2 border-b border-gray-100">
                    <button 
                      onClick={() => {
                        setShowAddCharacter(false);
                        setNewCharacterName('');
                      }}
                      className={commonButtonClasses}
                    >
                      <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                      </svg>
                    </button>
                    <h2 className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-lg font-normal">
                      添加角色
                    </h2>
                  </div>
                  <div className="p-4">
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          角色名称
                        </label>
                        <input
                          type="text"
                          value={newCharacterName}
                          onChange={(e) => setNewCharacterName(e.target.value)}
                          placeholder="请输入角色名称"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#09B83E] focus:border-transparent"
                        />
                      </div>
                      <button
                        onClick={() => {
                          if (newCharacterName.trim()) {
                            handleCharacterSelect({ name: newCharacterName.trim() });
                            setNewCharacterName('');
                            setShowAddCharacter(false);
                          }
                        }}
                        disabled={!newCharacterName.trim()}
                        className="w-full py-2 bg-[#09B83E] text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        确认添加
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </PhoneFrame>

        {/* Chat Phone */}
        <PhoneFrame isVisible={!showCharacterSelector}>
          <div className="flex-1 flex flex-col">
            {/* Header - WeChat Style */}
            <div className="flex items-center h-11 px-2 border-b border-gray-100 bg-white sticky top-0 z-10">
              <button className={commonButtonClasses}>
                <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <div className="flex-1 flex justify-center">
                <h2 className="text-base font-normal max-w-[200px] truncate">
                  { confirmedSelectedCharacters.length > 0 
                    ? confirmedSelectedCharacters.map(char => char.name).join('、')
                    : '跨时空对话'
                  }
                </h2>
              </div>
              <div className="flex items-center">
                <button 
                  onClick={exportChatAsImage}
                  disabled={!conversationStarted || messages.length === 0 || isExporting}
                  className={`${commonButtonClasses} ${(!conversationStarted || messages.length === 0) ? 'opacity-50' : ''}`}
                  title="导出为图片"
                >
                  <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </button>
                <button 
                  onClick={() => setShowCharacterSelector(true)}
                  className={commonButtonClasses}
                >
                  <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Chat Content Area */}
            <div className="flex-1" ref={chatPhoneRef}>
              {isLoading ? (
                <div className="flex items-center justify-center h-full">
                  <div className="flex flex-col items-center gap-3">
                    <div className={styles.loader}></div>
                    <p className="text-gray-500">{loadingMessages[loadingMessageIndex]}</p>
                  </div>
                </div>
              ) : (
                <ChatWindow messages={messages} />
              )}
            </div>

            {/* WeChat-style Input Bar */}
            <div className="sticky bottom-0 left-0 right-0 border-t border-gray-200 bg-white">
              <div className="flex items-center gap-2 w-full px-2 py-1.5">
                <button className="p-1.5">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" viewBox="0 0 48 48" fill="#666">
                    <path d="M24 4C12.95 4 4 12.95 4 24s8.95 20 20 20 20-8.95 20-20S35.05 4 24 4zm0 36c-8.82 0-16-7.18-16-16S15.18 8 24 8s16 7.18 16 16-7.18 16-16 16zm7-18c1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3 1.34 3 3 3zm-14 0c1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3 1.34 3 3 3zm7 13c4.66 0 8.61-2.92 10.21-7H13.79c1.6 4.08 5.55 7 10.21 7z"/>
                  </svg>
                </button>
                <div className="flex-1 bg-[#f5f5f6] rounded-full px-4 py-1.5 text-[#7c7c7c] text-[15px] flex items-center justify-center">
                  按住说话
                </div>
                <button className="p-1.5">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" viewBox="0 0 48 48" fill="#666">
                    <path d="M24 4C12.95 4 4 12.95 4 24s8.95 20 20 20 20-8.95 20-20S35.05 4 24 4zm10 22h-8v8h-4v-8h-8v-4h8v-8h4v8h8v4z"/>
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </PhoneFrame>
      </div>
        <p className='absolute bottom-[16px] left-0 w-full text-center text-xs text-gray-400 flex items-center justify-center'>
          <a href="https://github.com/liujuntao123/cross-time-conversation" className="hover:text-gray-500 mr-2 flex items-center" target="_blank" rel="noopener noreferrer">
            <svg height="14" width="14" viewBox="0 0 16 16" className="translate-y-[0.5px]" fill="currentColor">
              <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"/>
            </svg>
          </a>
          跨时空对话 Powered by AI
        </p>
    </main>
  );
}
