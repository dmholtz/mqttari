import React from 'react';

interface TopicDetailsProps {
  selectedTopic: string | null;
  topics: Record<string, string>;
}

const TopicDetails: React.FC<TopicDetailsProps> = ({ selectedTopic, topics }) => {
  return (
    <div style={{ flex: 1, marginLeft: '20px' }}>
      <h3>Topic Details</h3>
      {selectedTopic ? (
        <div>
          <p><strong>Path:</strong> {selectedTopic}</p>
          {topics[selectedTopic] ? (
            <p><strong>Value:</strong> {topics[selectedTopic]}</p>
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