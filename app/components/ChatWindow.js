'use client';
import MessageItem from './MessageItem';

export default function ChatWindow({ messages }) {
  return (
    <div className="h-full bg-[#F7F7F7]">
      {messages.length === 0 ? (
        <div className="h-full flex items-center justify-center text-gray-400">
          点击右上角，选择角色开始跨时空对话
        </div>
      ) : (
        <div className="px-4 py-4 pb-0">
          <div>
            {messages.map((message) => (
              <MessageItem
                key={message.id}
                message={message}
                isSelf={message.id % 2 === 1}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
