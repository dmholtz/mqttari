import { useState} from "react";
//import reactLogo from "./assets/react.svg";
import { invoke } from "@tauri-apps/api/core";
import { listen } from "@tauri-apps/api/event";
import "../App.css";

import { useNavigate } from "react-router";

import TopicView from '../components/TopicView';
import TopicDetails from '../components/TopicDetails';

function DashboardPage() {
  const [name, setName] = useState("");
  const [imageUrl, setImageUrl] = useState("");
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

  listen("image-bytes", event => {
    const { payload } = event.payload as any;
    const url = `data:image/jpeg;base64,${payload}`;
    setImageUrl(url);
  });

  return (
    <main className="container">
      <div style={{ display: 'flex', marginBottom: '20px' }}>
        <TopicView topics={receivedTopics} onTopicSelect={setSelectedTopic} />
        <TopicDetails selectedTopic={selectedTopic} topics={receivedTopics} />
      </div>

      <form
        className="row"
        onSubmit={(e) => {
          e.preventDefault();
          subscribe();
        }}
      >
        <input
          id="greet-input"
          onChange={(e) => setName(e.currentTarget.value)}
          placeholder="Enter a topic..."
        />
        <button type="submit">Subscribe</button>
      </form>

      <form
        className="row"
        onSubmit={(e) => {
          e.preventDefault();
          stopMqtt();
        }}
      >
        <button type="submit">Disconnect</button>
      </form>

      <img src={imageUrl} alt="Waiting for image…" />
    </main>
  );
}

export default DashboardPage;
