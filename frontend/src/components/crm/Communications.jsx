import { useState } from 'react';

export function EmailEditor({ template = '', subject = '', onSubjectChange, onTemplateChange }) {
  return (
    <div className="border rounded bg-white overflow-hidden d-flex flex-column" style={{ minHeight: 400 }}>
      <div className="p-3 border-bottom bg-light">
        <div className="d-flex align-items-center mb-2">
          <label className="text-muted-c fs-13 me-3 fw-5" style={{ width: 60 }}>To</label>
          <div className="flex-grow-1 border px-2 py-1 bg-white rounded fs-13">Selected Audience</div>
        </div>
        <div className="d-flex align-items-center mb-2">
          <label className="text-muted-c fs-13 me-3 fw-5" style={{ width: 60 }}>Subject</label>
          <input 
            type="text" 
            className="form-control form-control-sm border-0 bg-white" 
            placeholder="Enter email subject..." 
            value={subject} 
            onChange={e => onSubjectChange?.(e.target.value)} 
          />
        </div>
        <div className="d-flex align-items-center gap-2 pt-2 border-top mt-2">
          <button className="icon-btn bg-white border" title="Insert Variable" onClick={() => onTemplateChange?.(template + '{{CustomerName}}')}><i className="bi bi-braces" /></button>
          <button className="icon-btn bg-white border"><i className="bi bi-type-bold" /></button>
          <button className="icon-btn bg-white border"><i className="bi bi-type-italic" /></button>
          <button className="icon-btn bg-white border"><i className="bi bi-link-45deg" /></button>
          <button className="icon-btn bg-white border"><i className="bi bi-image" /></button>
        </div>
      </div>
      <textarea
        className="form-control border-0 flex-grow-1 p-3 shadow-none"
        style={{ resize: 'none' }}
        value={template}
        onChange={e => onTemplateChange?.(e.target.value)}
        placeholder="Write your email here..."
      />
    </div>
  );
}

export function WhatsAppChat({ conversation }) {
  if (!conversation) return <div className="h-100 d-flex align-items-center justify-content-center bg-light text-muted-c">Select a chat to start messaging</div>;
  
  return (
    <div className="h-100 d-flex flex-column" style={{ background: '#efeae2' }}>
      <div className="p-3 bg-white border-bottom d-flex align-items-center">
        <div className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center me-3" style={{ width: 40, height: 40, fontSize: 18 }}>
          {conversation.customer.charAt(0)}
        </div>
        <div>
          <div className="fw-6">{conversation.customer}</div>
          <div className="fs-12 text-muted-c">{conversation.company}</div>
        </div>
      </div>
      
      <div className="flex-grow-1 p-4" style={{ overflowY: 'auto' }}>
        {conversation.messages.map((m) => (
          <WhatsAppMessage key={m.id} message={m} />
        ))}
      </div>
      
      <WhatsAppComposer />
    </div>
  );
}

export function WhatsAppMessage({ message }) {
  const isAgent = message.sender === 'Agent';
  return (
    <div className={`d-flex mb-3 ${isAgent ? 'justify-content-end' : 'justify-content-start'}`}>
      <div 
        className={`p-2 px-3 rounded shadow-sm`} 
        style={{ 
          maxWidth: '75%', 
          background: isAgent ? '#dcf8c6' : '#fff',
          borderTopRightRadius: isAgent ? 0 : 8,
          borderTopLeftRadius: !isAgent ? 0 : 8,
        }}
      >
        <div className="fs-14 text-dark">{message.text}</div>
        <div className="d-flex justify-content-end align-items-center gap-1 mt-1">
          <span className="fs-10 text-muted-c">{message.time}</span>
          {isAgent && (
            <i className={`bi bi-check-all fs-14 ${message.status === 'Read' ? 'text-primary' : 'text-muted'}`} />
          )}
        </div>
      </div>
    </div>
  );
}

export function WhatsAppComposer({ onSend }) {
  const [text, setText] = useState('');
  return (
    <div className="p-3 bg-light border-top d-flex align-items-end gap-2">
      <button className="icon-btn text-muted-c"><i className="bi bi-paperclip fs-5" /></button>
      <button className="icon-btn text-muted-c"><i className="bi bi-emoji-smile fs-5" /></button>
      <textarea
        className="form-control flex-grow-1 shadow-none border-0 py-2"
        style={{ borderRadius: 20, resize: 'none', maxHeight: 100, minHeight: 40 }}
        rows={1}
        placeholder="Type a message..."
        value={text}
        onChange={e => setText(e.target.value)}
        onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); onSend?.(text); setText(''); } }}
      />
      <button 
        className="icon-btn rounded-circle bg-primary text-white" 
        style={{ width: 40, height: 40, flexShrink: 0 }}
        onClick={() => { if(text.trim()) { onSend?.(text); setText(''); } }}
      >
        <i className="bi bi-send-fill" />
      </button>
    </div>
  );
}
