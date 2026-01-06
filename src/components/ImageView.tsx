import React from 'react';

interface ImageViewProps {
  payload: string;
}

const ImageView: React.FC<ImageViewProps> = ({ payload }) => {
  // Assume payload is base64 encoded image
  const src = `data:image/jpeg;base64,${payload}`;
  return (
    <div>
      <img src={src} alt="Topic content" style={{ maxWidth: '100%', height: 'auto' }} />
    </div>
  );
};

export default ImageView;