import React, { useState, useEffect, ReactElement } from 'react';
import { SimpleTreeView } from '@mui/x-tree-view/SimpleTreeView';
import { TreeItem } from '@mui/x-tree-view/TreeItem';

interface TopicViewProps {
    topics: Record<string, string>; // topic -> payload
    onTopicSelect: (topic: string) => void;
}

function buildTopicTree(topics: Record<string, string>) {
    const tree: any = {};
    Object.keys(topics).forEach((topic) => {
        const parts = topic.split('/');
        let current = tree;
        parts.forEach((part, index) => {
            if (!current[part]) {
                current[part] = {};
            }
            if (index === parts.length - 1) {
                current[part].payload = topics[topic];
            } else {
                if (!current[part].children) {
                    current[part].children = {};
                }
                current = current[part].children;
            }
        });
    });
    return tree;
}

function renderTreeItems(node: any, path: string = ''): ReactElement[] {
    return Object.keys(node).map((key) => {
        const fullPath = path ? `${path}/${key}` : key;
        const item = node[key];
        if (item.payload !== undefined) {
            let display_content: string;
            if (item.payload.length > 30) {
                display_content = item.payload.substring(0, 30) + '...';
            } else {
                display_content = item.payload;
            }

            // leaf
            return (
                <TreeItem
                    key={fullPath}
                    itemId={fullPath}
                    label={
                        <div
                            style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                width: '100%',
                            }}
                        >
                            <span>{key}</span>
                            <span style={{ marginLeft: 'auto', color: 'gray' }}>
                                {display_content}
                            </span>
                        </div>
                    }
                />
            );
        } else {
            // branch
            const children = renderTreeItems(item.children || {}, fullPath);
            return (
                <TreeItem
                    key={fullPath}
                    itemId={fullPath}
                    label={
                        <div
                            style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                width: '100%',
                            }}
                        >
                            <span>{key}</span>
                            <span style={{ marginLeft: 'auto', color: 'gray' }}></span>
                        </div>
                    }
                >
                    {children}
                </TreeItem>
            );
        }
    });
}

const TopicView: React.FC<TopicViewProps> = ({ topics, onTopicSelect }) => {
    const [selectedItems, setSelectedItems] = useState<string>('');

    useEffect(() => {
        if (selectedItems) {
            if (topics[selectedItems]) {
                onTopicSelect(selectedItems);
            }
        }
    }, [selectedItems, topics, onTopicSelect]);

    const handleItemClick = (_event: React.MouseEvent, itemId: string) => {
        setSelectedItems(itemId);
    };

    const topicTree = buildTopicTree(topics);

    return (
        <div style={{ flex: 1 }}>
            <h2>MQTT Topics</h2>
            <SimpleTreeView selectedItems={selectedItems} onItemClick={handleItemClick}>
                {renderTreeItems(topicTree)}
            </SimpleTreeView>
        </div>
    );
};

export default TopicView;
