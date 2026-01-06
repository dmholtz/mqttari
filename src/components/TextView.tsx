import React from 'react';

interface TextViewProps {
  payload: string;
}

const TextView: React.FC<TextViewProps> = ({ payload }) => {
  
  let display_content: string;
  if (payload.length > 30) {
    display_content = payload.substring(0, 30) + '...';
  }
  else {
    display_content = payload;
  }

  return (
    <div>
      <pre style={{ whiteSpace: 'pre-wrap', wordWrap: 'break-word' }}>{display_content}</pre>
    </div>
  );
};

export default TextView;