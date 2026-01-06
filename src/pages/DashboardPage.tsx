import { useState} from "react";
//import reactLogo from "./assets/react.svg";
import { invoke } from "@tauri-apps/api/core";
import { listen } from "@tauri-apps/api/event";
import "../App.css";

import { useNavigate } from "react-router";

import TopicView from '../components/TopicView';
import TopicDetails from '../components/TopicDetails';
import MenuBar from '../components/MenuBar';

function DashboardPage() {
  const [name, setName] = useState("");
  const [receivedTopics, setReceivedTopics] = useState<Record<string, string>>({});
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);

  const navigate = useNavigate();

  async function subscribe() {
    await invoke("subscribe_topic", { topic: name });
  }

  async function stopMqtt() {
    await invoke("stop_mqtt");
    navigate("/connect");
  }

  listen("mqtt://message", (event) => {
    const {topic, payload} = event.payload as any;
    setReceivedTopics(prev => ({ ...prev, [topic]: payload }));
  });

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      <MenuBar onDisconnect={stopMqtt} />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', overflow: 'hidden', padding: '16px' }}>
          <div className="panel" style={{ resize: 'horizontal', overflow: 'auto', minWidth: '200px' }}>
            <TopicView topics={receivedTopics} onTopicSelect={setSelectedTopic} />
          </div>
          <div className="panel" style={{ overflow: 'auto', minWidth: '200px' }}>
            <TopicDetails selectedTopic={selectedTopic} topics={receivedTopics} />
          </div>
        </div>
        <div className="panel" style={{ margin: '16px' }}>
          <form
            className="row"
            onSubmit={(e) => {
              e.preventDefault();
              subscribe();
              e.currentTarget.reset();
            }}
          >
            <input
              id="greet-input"
              onChange={(e) => setName(e.currentTarget.value)}
              placeholder="Enter a topic..."
            />
            <button type="submit">Subscribe</button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default DashboardPage;
