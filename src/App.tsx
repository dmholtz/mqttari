import { useState, useEffect } from "react";
import reactLogo from "./assets/react.svg";
import { invoke } from "@tauri-apps/api/core";
import { listen } from "@tauri-apps/api/event";
import "./App.css";

import { SimpleTreeView } from '@mui/x-tree-view/SimpleTreeView';
import { TreeItem } from '@mui/x-tree-view/TreeItem';

import ConnectView from './ConnectView';

function buildTopicTree(topics: string[]) {
  const tree: any = {};
  topics.forEach(topic => {
    const parts = topic.split('/');
    let current = tree;
    parts.forEach(part => {
      if (!current[part]) {
        current[part] = {};
      }
      current = current[part];
    });
  });
  return tree;
}

function renderTreeItems(node: any, path: string = ''): JSX.Element[] {
  return Object.keys(node).map(key => {
    const fullPath = path ? `${path}/${key}` : key;
    const children = renderTreeItems(node[key], fullPath);
    return (
      <TreeItem key={fullPath} itemId={fullPath} label={key}>
        {children}
      </TreeItem>
    );
  });
}

function App() {
  const [greetMsg, setGreetMsg] = useState("");
  const [name, setName] = useState("");
  const [counterMsg, setCounterMsg] = useState("0");
  const [imageUrl, setImageUrl] = useState(null);

  const topics = ["txt/temperature", "txt/humidity", "txt/image", "txt4/pressure"];

  const topicTree = buildTopicTree(topics);

  async function subscribe() {
    await invoke("subscribe_topic", { topic: name });
  }

  async function greet() {
    // Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
    setGreetMsg(await invoke("greet", { name }));
  }

  async function increaseCounter() {
    let counter : Number = await invoke("increase_counter");
    setCounterMsg(counter.toString());
  }

  async function startMqtt() {
    await invoke("start_mqtt");
  }

  async function stopMqtt() {
    await invoke("stop_mqtt");
  }

  listen("mqtt://message", (event) => {
    const {topic, payload} = event.payload as any;
    setCounterMsg(`Topic: ${topic}, Payload: ${payload}`);
  });

  listen("image-bytes", event => {
    const { payload } = event.payload as any;
    const url = `data:image/jpeg;base64,${payload}`;
    setImageUrl(url);
  });

  return (
    <main className="container">
      <h1>Welcome to Tauri + React</h1>

      <ConnectView />

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

      <SimpleTreeView>
        {renderTreeItems(topicTree)}
      </SimpleTreeView>


      <form
        className="row"
        onSubmit={(e) => {
          e.preventDefault();
          increaseCounter();
        }}
      >
        <button type="submit">Increase Counter</button>
      </form>

      <form
        className="row"
        onSubmit={(e) => {
          e.preventDefault();
          startMqtt();
        }}
      >
        <button type="submit">Start MQTT</button>
      </form>

      <form
        className="row"
        onSubmit={(e) => {
          e.preventDefault();
          stopMqtt();
        }}
      >
        <button type="submit">Stop MQTT</button>
      </form>

      <p>{greetMsg}</p>
      <p>{counterMsg}</p>

      <img src={imageUrl} alt="Waiting for image…" />
    </main>
  );
}

export default App;
