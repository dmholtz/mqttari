import React, { useState } from 'react';
import { ToggleButton, ToggleButtonGroup } from '@mui/material';
import TextSnippetIcon from '@mui/icons-material/TextSnippet';
import ImageIcon from '@mui/icons-material/Image';
import TextView from './TextView';
import ImageView from './ImageView';

interface TopicDetailsProps {
  selectedTopic: string | null;
  topics: Record<string, string>;
}

const TopicDetails: React.FC<TopicDetailsProps> = ({ selectedTopic, topics }) => {
  const [viewMode, setViewMode] = useState<'text' | 'image'>('text');

  const handleViewModeChange = (
    event: React.MouseEvent<HTMLElement>,
    newMode: 'text' | 'image' | null,
  ) => {
    if (newMode !== null) {
      setViewMode(newMode);
    }
  };

  const payload = selectedTopic ? topics[selectedTopic] : null;

  return (
    <div style={{ flex: 1 }}>
      <h2>Topic Details</h2>
      {selectedTopic ? (
        <div>
          <p><strong>Path:</strong> {selectedTopic}</p>
          {payload ? (
            <>
              <ToggleButtonGroup
                value={viewMode}
                exclusive
                onChange={handleViewModeChange}
                aria-label="view mode"
                style={{ marginBottom: '10px' }}
              >
                <ToggleButton value="text" aria-label="text view">
                  <TextSnippetIcon />
                </ToggleButton>
                <ToggleButton value="image" aria-label="image view">
                  <ImageIcon />
                </ToggleButton>
              </ToggleButtonGroup>
              {viewMode === 'text' ? (
                <TextView payload={payload} />
              ) : (
                <ImageView payload={payload} />
              )}
            </>
          ) : (
            <p><strong>Type:</strong> Branch</p>
          )}
        </div>
      ) : (
        <p>Select a topic to view details.</p>
      )}
    </div>
  );
};

export default TopicDetails;