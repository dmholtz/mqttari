
use std::time::Duration;

use tauri::Manager;
use tauri::State;
use tauri::Emitter;

use rumqttc::{MqttOptions, QoS, AsyncClient, Event, Incoming};

use tokio::sync::Mutex;
use tokio_util::sync::CancellationToken;

use base64;

pub struct RunningMqtt {
    cancel: CancellationToken, 
    task: tauri::async_runtime::JoinHandle<()>,
    client: AsyncClient,
}

pub struct MqttService {
    inner: Mutex<Option<RunningMqtt>>,
}

impl MqttService {
    pub fn new() -> Self {
        Self {
            inner: Mutex::new(None),
        }
    }
}

// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

#[tauri::command]
async fn subscribe_topic(state: State<'_, MqttService>, topic: &str) -> Result<(), String> {
    let guard = state.inner.lock().await;

    if let Some(running) = guard.as_ref() {
        running.client.subscribe(topic, QoS::AtMostOnce)
            .await
            .map_err(|e| e.to_string())?;
    }
    else {
        return Err("MQTT client not running".into());
    }
    println!("Subscribed to topic: {}", topic);

    Ok(())
}

#[tauri::command]
async fn unsubscribe_topic(state: State<'_, MqttService>, topic: &str) -> Result<(), String> {
    let guard = state.inner.lock().await;

    if let Some(running) = guard.as_ref() {
        let _ = running.client.unsubscribe(topic)
            .await
            .map_err(|e| e.to_string())?;
    }
    else {
        return Err("MQTT client not running".into());
    }
    println!("Unsubscribed from topic: {}", topic);

    Ok(())
}

#[tauri::command(async)]
async fn start_mqtt(app: tauri::AppHandle, service: State<'_, MqttService>, host: &str, port: u16) -> Result<(), String> {
    let mut guard = service.inner.lock().await;

    // prevent double start
    if guard.is_some() {
        return Err("MQTT client already running".into());
    }

    let mut mqtt_options = MqttOptions::new("rumqtt-client", host, port);
    mqtt_options.set_keep_alive(Duration::from_secs(5));
    mqtt_options.set_max_packet_size(127000, 127000);

    let (client, mut eventloop) = AsyncClient::new(mqtt_options, 10);

    // subscribe before polling
    client.subscribe("$SYS/broker/uptime", rumqttc::QoS::AtLeastOnce)
        .await
        .map_err(|e| e.to_string())?;

    let cancel = CancellationToken::new();
    let cancel_child = cancel.child_token();
    let app_clone = app.clone();

    let task = tauri::async_runtime::spawn(async move {
        app_clone.emit("mqtt://status", "started").ok();

        loop {
            tokio::select! {
                _ = cancel_child.cancelled() => {
                    app_clone.emit("mqtt://status", "stopped").ok();
                    break;
                }
                
                res = eventloop.poll() => {
                    match res {
                        Ok(Event::Incoming(Incoming::Publish(p))) => {
                            if p.topic == "txt/image" {
                                println!("Received image data on topic {}: {} bytes", p.topic, p.payload.len());
                                let encoded = base64::encode(&p.payload);
                                app_clone.emit("mqtt://message", serde_json::json!({
                                    "topic": p.topic,
                                    "payload": encoded,
                                    "is_base64": true
                                })).ok();
                            }
                            else {
                                // Emit to frontend
                                let payload = String::from_utf8_lossy(&p.payload);
                                let _ = app_clone.emit("mqtt://message", {
                                    serde_json::json!({
                                        "topic": p.topic,
                                        "payload": payload
                                    })
                                });
                            }

                            
                        }
                        Ok(_) => {}
                        Err(e) => {
                            let _ = app_clone.emit("mqtt://error", e.to_string());
                            break;
                        }
                    }
                }
            }   
        }
    });
    *guard = Some(RunningMqtt {
        cancel,
        task,
        client,
    });
    Ok(())
}

#[tauri::command]
async fn stop_mqtt(service: State<'_, MqttService>) -> Result<(), String> {
    let mut guard = service.inner.lock().await;

    if let Some(running) = guard.take() {
        running.cancel.cancel();
        let _ = running.task.await;
        Ok(())
    }
    else {
        Err("MQTT client not running".into())
    }
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    //let mut mqttoptions = MqttOptions::new("rumqtt-client", "test.mosquitto.org", 1883);
    //let (mut client, mut connection) = Client::new(mqttoptions, 255);

    tauri::Builder::default()
        .setup(|app| {
            app.manage(MqttService::new());
            Ok(())
        })
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![greet, start_mqtt, stop_mqtt, subscribe_topic])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
