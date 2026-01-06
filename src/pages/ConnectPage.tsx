import { useState } from "react";
import { useNavigate } from "react-router";

import { invoke } from "@tauri-apps/api/core";

import "../App.css";

export default function ConnectPage() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    brokerUrl: "",
    port: "",
    clientId: "",
    username: "",
    password: ""
  });

  const update = (e: React.ChangeEvent<HTMLInputElement>): void =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleConnect = async () => {
    const invokeArgs = {
      host: form.brokerUrl || "localhost",
      port: parseInt(form.port) || 1883,
    };
    await invoke("start_mqtt", invokeArgs);
    navigate("/dashboard", { state: { connectionConfig: form } });
  };

  return (
    <div className="page">
      <div className="card">
        <h2>Connect to MQTT Broker</h2>

        <div className="form">
          <label>
            Broker URL
            <input
              name="brokerUrl"
              placeholder="localhost"
              value={form.brokerUrl}
              onChange={update}
            />
          </label>

          <label>
            Port
            <input
              name="port"
              placeholder="1883"
              value={form.port}
              onChange={update}
            />
          </label>
          
          <button onClick={handleConnect}>
            Connect
          </button>
        </div>
      </div>

      <style>{`
        .page {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #0f172a;
          color: #e5e7eb;
          font-family: system-ui, sans-serif;
        }
        .card {
          background: #020617;
          padding: 24px 28px;
          border-radius: 18px;
          width: 420px;
          box-shadow: 0 20px 40px rgba(0,0,0,.35);
        }
        .form {
          display: grid;
          gap: 14px;
          margin-top: 12px;
        }
        label {
          display: grid;
          gap: 6px;
          font-size: 14px;
        }
        input {
          padding: 8px 10px;
          border-radius: 12px;
          border: 1px solid #1f2937;
          background: #020617;
          color: #fff;
        }
      `}</style>
    </div>
  );
}
