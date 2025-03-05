'use client';

export default function MessageItem({ message, isSelf }) {
  return (
    <div className={`flex items-start gap-3 ${isSelf ? 'flex-row-reverse' : ''} mb-4`}>
      {/* Avatar */}
      <div className="flex flex-col items-center">
        <div className={`w-12 h-12 rounded-md shrink-0 flex items-center justify-center text-white ${
          isSelf ? 'bg-[#57be6a]' : 'bg-[#9aa0a6]'
        }`}>
          {message.name[0]}
        </div>
      </div>
      
      {/* Message Content */}
      <div className="flex flex-col">
        <span className={`text-xs text-gray-500 mb-1 ${isSelf ? 'text-right' : 'text-left'}`}>
          {message.name}
        </span>
        <div className={`relative ${isSelf ? 'self-end' : 'self-start'} px-4 py-2 rounded-lg max-w-[80%] ${
          isSelf ? 'bg-[#95EC69] text-black' : 'bg-white text-black'
        } break-words before:content-[""] before:absolute before:top-[14px] ${
          isSelf 
            ? 'before:-right-[8px] before:border-l-[#95EC69]  before:border-l-[8px] before:border-y-transparent before:border-y-[6px] before:border-r-0' 
            : 'before:-left-[8px] before:border-r-white before:border-r-[8px] before:border-y-transparent before:border-y-[6px] before:border-l-0'
        } before:w-0 before:h-0`}>
          {message.content}
        </div>
      </div>
    </div>
  );
}
